import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, Send, Paperclip, Database, Globe, Plus, 
  BarChart2, PieChart, Edit3, Lightbulb, FolderSearch,
  MoreVertical 
} from 'lucide-react';
import { loadDocumentLibrary } from '../data/documentLibrary';

const navigationPages = [
  { label: 'Dashboard', path: '/' },
  { label: 'Documents', path: '/documents' },
  { label: 'Reports', path: '/reports' },
  { label: 'Analysis', path: '/analysis' },
  { label: 'Archives', path: '/archives' },
  { label: 'Settings', path: '/settings' },
  { label: 'Notifications', path: '/notifications' },
];

const searchStopWords = new Set([
  'a', 'all', 'and', 'can', 'document', 'documents', 'file', 'files', 'find',
  'for', 'folder', 'folders', 'in', 'is', 'latest', 'locate', 'me', 'my', 'of', 'open', 'please',
  'search', 'show', 'the', 'to', 'where', 'which',
]);

function getAssistantResponse(prompt) {
  const normalizedPrompt = prompt.toLowerCase();
  const destination = navigationPages.find((item) => (
    normalizedPrompt.includes(item.label.toLowerCase())
    && /\b(open|go|navigate|show|take me)\b/.test(normalizedPrompt)
  ));

  if (destination) {
    return { handled: true, text: `Open ${destination.label} to continue.`, destination };
  }

  if (/\b(file|files|document|documents|folder|folders|find|search|locate|where)\b/.test(normalizedPrompt)) {
    const terms = normalizedPrompt
      .replace(/[^a-z0-9._-]+/g, ' ')
      .split(/\s+/)
      .filter((term) => term && !searchStopWords.has(term));
    const { files, folders, error } = loadDocumentLibrary();
    const matchingFiles = files.filter((file) => {
      const searchableText = `${file.name.replace(/[_-]/g, ' ')} ${file.folder} ${file.category}`.toLowerCase();
      return terms.length === 0 || terms.every((term) => searchableText.includes(term));
    });
    const matches = matchingFiles.slice(0, 6);

    return {
      handled: true,
      text: `${error ? `${error} ` : ''}${matchingFiles.length
        ? `Found ${matchingFiles.length} matching ${matchingFiles.length === 1 ? 'file' : 'files'} in your saved library${matchingFiles.length > matches.length ? `; showing the first ${matches.length}` : ''}:`
        : 'No files matched that search in the saved library. Try a file name, category, or folder such as “safety”, “water”, or “geological”.'}`,
      files: matches.map((file) => ({
        ...file,
        folderExists: folders.some((folder) => folder.name === file.folder),
      })),
    };
  }

  return {
    handled: false,
  };
}

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm Carbonexa's mining and field-work assistant.\n\nI can search saved documents and navigate the workspace. Ask me about mining operations, geology, environmental monitoring, or reports when Gemini is connected.",
      time: '10:24 AM',
      localOnly: true,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/health')
      .then((response) => response.ok ? response.json() : null)
      .then((status) => {
        if (active) setGeminiConfigured(Boolean(status?.geminiConfigured));
      })
      .catch(() => {
        if (active) setGeminiConfigured(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const [recentChats] = useState([
    { id: 1, title: 'Coal Production Analysis', desc: 'Compare production data of last 6...', date: '30 Sep 2026' },
    { id: 2, title: 'Geological Survey Summary', desc: 'Summarize the latest geological r...', date: '28 Sep 2026' },
    { id: 3, title: 'Environmental Impact', desc: 'Generate EIA summary for North...', date: '28 Sep 2026' },
    { id: 4, title: 'Mine-wise Comparison', desc: 'Show output trend for all mines', date: '26 Sep 2026' },
    { id: 5, title: 'Report Draft - Bokaro Project', desc: 'Create a detailed production report', date: '24 Sep 2026' },
  ]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;
    const prompt = inputValue.trim();
    const localResponse = getAssistantResponse(prompt);

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: prompt,
      time: 'Just now',
      localOnly: localResponse.handled,
    };

    setMessages((currentMessages) => [...currentMessages, userMsg]);
    setInputValue('');

    if (localResponse.handled) {
      const assistantResponse = { ...localResponse };
      delete assistantResponse.handled;
      setMessages((currentMessages) => [...currentMessages, {
        id: Date.now() + 1,
        sender: 'ai',
        ...assistantResponse,
        time: 'Just now',
      }]);
      return;
    }

    const history = messages
      .filter((message) => (
        !message.localOnly
        && !message.files
        && !message.destination
        && (message.sender === 'user' || message.sender === 'ai')
      ))
      .slice(-12)
      .map((message) => ({
        role: message.sender === 'user' ? 'user' : 'model',
        text: message.text,
      }));

    setIsSending(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, history }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const serverMessage = typeof result?.error === 'string' ? result.error : '';
        if (response.status === 502) {
          throw new Error(`The AI service gateway returned HTTP 502.${serverMessage ? ` ${serverMessage}` : ''} Check that Carbonexa is running on the URL printed by Vite and review its server logs.`);
        }
        if (response.status >= 500 && !serverMessage) {
          throw new Error('The Carbonexa backend is unavailable. Check that the frontend and API are running from this project.');
        }
        throw new Error(serverMessage || 'Gemini could not answer just now. Please try again.');
      }
      if (typeof result?.text !== 'string' || !result.text.trim()) {
        throw new Error('The AI service returned an invalid response. Please try again.');
      }

      setMessages((currentMessages) => [...currentMessages, {
        id: Date.now() + 1,
        sender: 'ai',
        text: result.text.trim(),
        time: 'Just now',
      }]);
    } catch (error) {
      setMessages((currentMessages) => [...currentMessages, {
        id: Date.now() + 1,
        sender: 'ai',
        text: error instanceof TypeError
          ? 'The Carbonexa backend is unavailable. Check that the frontend and API are running, then try again.'
          : error.message || 'Gemini could not answer just now. Please try again.',
        time: 'Just now',
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInputValue(promptText);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "New chat started! How can I assist you with your mining and environmental data today?",
        time: 'Just now',
        localOnly: true,
      }
    ]);
  };

  return (
    <div className="workspace-page assistant-page" style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Breadcrumb & Header Banner */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
          Home &gt; <span style={{ color: '#0f172a', fontWeight: '500' }}>AI Assistant</span>
        </div>
        
        <div className="workspace-banner assistant-banner" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderRadius: '12px', padding: '24px 32px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.2)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>CARBONEXA AI Assistant</h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Beta</span>
            </div>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.9, maxWidth: '600px' }}>
              Search saved documents, navigate the workspace, and ask mining and field-work questions.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bot size={48} color="#e0f2fe" opacity={0.8} />
          </div>
        </div>
      </div>

      {/* Top Capability Cards */}
      <div className="assistant-capability-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
        
        <div onClick={() => handleQuickPrompt("Find a safety file")} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div className="assistant-capability-icon" style={{ background: '#e0f2fe', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <FolderSearch size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Find a File</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Search by name, category, or folder</div>
          </div>
        </div>

        <div onClick={() => handleQuickPrompt("Compare coal production of last 6 months")} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div className="assistant-capability-icon" style={{ background: '#dcfce7', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <BarChart2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Analyze Data</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Find trends, patterns and comparisons</div>
          </div>
        </div>

        <div onClick={() => handleQuickPrompt("Identify current environmental risks and opportunities")} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div className="assistant-capability-icon" style={{ background: '#fef3c7', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Lightbulb size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Generate Insights</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Identify risks, opportunities and recommendations</div>
          </div>
        </div>

        <div onClick={() => handleQuickPrompt("Create resource distribution charts and dashboards")} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div className="assistant-capability-icon" style={{ background: '#fae8ff', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
            <PieChart size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Visualize Data</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Create charts, maps and dashboards</div>
          </div>
        </div>

        <div onClick={() => handleQuickPrompt("Draft a detailed production and safety report")} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div className="assistant-capability-icon" style={{ background: '#fee2e2', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <Edit3 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Draft Report</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Generate complete reports with AI assistance</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Chat Workspace (Left) & Quick Actions/Recent Chats (Right) */}
      <div className="assistant-chat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
        {/* Chat Box */}
        <div className="assistant-chat-panel" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '620px' }}>
          
          {/* Chat Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="assistant-chat-avatar" style={{ background: '#0284c7', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Chat with CARBONEXA AI</div>
                <div style={{ fontSize: '11px', color: geminiConfigured ? '#16a34a' : '#b7791f', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: geminiConfigured ? '#16a34a' : '#d69e2e', borderRadius: '50%' }}></span>
                  {geminiConfigured ? 'Google Gemini key configured · mining and field-work assistance' : 'Add a Gemini API key for AI-generated answers'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                disabled={isSending}
                onClick={handleNewChat}
                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Plus size={14} /> New Chat
              </button>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="assistant-message-list" aria-live="polite" aria-busy={isSending} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fafbfc' }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' 
                }}
              >
                <div className={`assistant-message-bubble${msg.sender === 'user' ? ' is-user' : ''}`} style={{
                  maxWidth: '80%', 
                  padding: '12px 16px', 
                  borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0', 
                  background: msg.sender === 'user' ? '#0284c7' : '#fff', 
                  color: msg.sender === 'user' ? '#fff' : '#0f172a',
                  fontSize: '13px',
                  whiteSpace: 'pre-line',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  {msg.text}
                  {msg.destination && (
                    <Link className="assistant-result-link" to={msg.destination.path}>
                      Go to {msg.destination.label}
                    </Link>
                  )}
                  {msg.files?.map((file) => (
                    <Link
                      className="assistant-file-result"
                      key={file.id}
                      to={`/documents?search=${encodeURIComponent(file.name)}`}
                    >
                      <strong>{file.name}</strong>
                      <span>{file.folderExists ? file.folder : 'Folder no longer exists'} · {file.category} · {file.size}</span>
                    </Link>
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{msg.time}</span>
              </div>
            ))}
            {isSending && (
              <div role="status" style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '12px 12px 12px 0', color: '#64748b', background: '#fff', fontSize: '12px' }}>
                Gemini is preparing a response…
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          <div className="assistant-suggestion-buttons" style={{ padding: '10px 20px', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            <button onClick={() => handleQuickPrompt("Find a safety file")} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '5px 10px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              📁 Find safety files
            </button>
            <button onClick={() => handleQuickPrompt("Compare coal production of last 6 months")} style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0284c7', padding: '5px 10px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              📊 Compare coal production of last 6 months
            </button>
            <button onClick={() => handleQuickPrompt("Show mine-wise output trend")} style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#d97706', padding: '5px 10px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              📈 Show mine-wise output trend
            </button>
          </div>

          {/* Input Bar */}
          <form className="assistant-chat-input" onSubmit={handleSendMessage} style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Ask about mining, geology, reports, or find a saved file..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: '#0f172a' }}
              />
              <button type="submit" disabled={isSending} aria-label="Send message" style={{ background: '#0284c7', border: 'none', width: '32px', height: '32px', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isSending ? 'wait' : 'pointer', opacity: isSending ? 0.65 : 1, flexShrink: 0 }}>
                <Send size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Paperclip size={14} color="#0284c7" /> Attach</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Database size={14} color="#0284c7" /> Use Project Data</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Globe size={14} color="#0284c7" /> Web Search</span>
              </div>
            </div>
          </form>

        </div>

        {/* Right Sidebar: Quick Actions & Recent Chats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Actions Card */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              
              <div onClick={() => handleQuickPrompt("Summarize document")} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <FolderSearch size={16} color="#0284c7" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>Find a File</span>
              </div>

              <div onClick={() => handleQuickPrompt("Analyze dataset")} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <BarChart2 size={16} color="#16a34a" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>Analyze Dataset</span>
              </div>

              <div onClick={() => handleQuickPrompt("Generate visualizations")} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <PieChart size={16} color="#9333ea" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>Generate Visuals</span>
              </div>

              <div onClick={() => handleQuickPrompt("Create report")} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Edit3 size={16} color="#dc2626" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>Create Report</span>
              </div>

            </div>
          </div>

          {/* Recent Chats Card */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Recent Chats</span>
              <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '500', cursor: 'pointer' }}>View All</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentChats.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => handleQuickPrompt(`Tell me more about ${chat.title}`)}
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', overflow: 'hidden' }}>
                    <Bot size={15} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{chat.title}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{chat.desc}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', flexShrink: 0, marginLeft: '6px' }}>{chat.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AIAssistant;
