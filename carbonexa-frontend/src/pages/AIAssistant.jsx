import { useState } from 'react';
import { 
  Bot, Send, Paperclip, Database, Globe, Plus, 
  FileText, BarChart2, PieChart, Edit3, Lightbulb, 
  MoreVertical 
} from 'lucide-react';

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm CARBONEXA AI Assistant.\n\nI can help you with:\n• Analyzing mining and geological data\n• Summarizing reports and documents\n• Generating insights and visualizations\n• Creating project-specific reports\n\nWhat would you like to know or analyze today?",
      time: '10:24 AM'
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const [recentChats] = useState([
    { id: 1, title: 'Coal Production Analysis', desc: 'Compare production data of last 6...', date: '30 Sep 2026' },
    { id: 2, title: 'Geological Survey Summary', desc: 'Summarize the latest geological r...', date: '28 Sep 2026' },
    { id: 3, title: 'Environmental Impact', desc: 'Generate EIA summary for North...', date: '28 Sep 2026' },
    { id: 4, title: 'Mine-wise Comparison', desc: 'Show output trend for all mines', date: '26 Sep 2026' },
    { id: 5, title: 'Report Draft - Bokaro Project', desc: 'Create a detailed production report', date: '24 Sep 2026' },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      time: 'Just now'
    };

    const aiReply = {
      id: Date.now() + 1,
      sender: 'ai',
      text: `I've analyzed your request regarding "${inputValue}". Based on the current geological and production database, all parameters for Jharia and Bokaro blocks are within optimal compliance thresholds. Let me know if you need a detailed export!`,
      time: 'Just now'
    };

    setMessages([...messages, userMsg, aiReply]);
    setInputValue('');
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
        time: 'Just now'
      }
    ]);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Breadcrumb & Header Banner */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
          Home &gt; <span style={{ color: '#0f172a', fontWeight: '500' }}>AI Assistant</span>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderRadius: '12px', padding: '24px 32px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.2)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>CARBONEXA AI Assistant</h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Beta</span>
            </div>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.9, maxWidth: '600px' }}>
              Ask, analyze and generate insights from your mining, geological and operational data.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bot size={48} color="#e0f2fe" opacity={0.8} />
          </div>
        </div>
      </div>

      {/* Top Capability Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
        
        <div onClick={() => handleQuickPrompt("Summarize the latest geological report")} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div style={{ background: '#e0f2fe', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Summarize Document</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Get key insights from reports and documents</div>
          </div>
        </div>

        <div onClick={() => handleQuickPrompt("Compare coal production of last 6 months")} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div style={{ background: '#dcfce7', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <BarChart2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Analyze Data</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Find trends, patterns and comparisons</div>
          </div>
        </div>

        <div onClick={() => handleQuickPrompt("Identify current environmental risks and opportunities")} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div style={{ background: '#fef3c7', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Lightbulb size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Generate Insights</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Identify risks, opportunities and recommendations</div>
          </div>
        </div>

        <div onClick={() => handleQuickPrompt("Create resource distribution charts and dashboards")} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div style={{ background: '#fae8ff', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
            <PieChart size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Visualize Data</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Create charts, maps and dashboards</div>
          </div>
        </div>

        <div onClick={() => handleQuickPrompt("Draft a detailed production and safety report")} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
          <div style={{ background: '#fee2e2', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <Edit3 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Draft Report</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Generate complete reports with AI assistance</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Chat Workspace (Left) & Quick Actions/Recent Chats (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
        {/* Chat Box */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '620px' }}>
          
          {/* Chat Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#0284c7', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Chat with CARBONEXA AI</div>
                <div style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: '#16a34a', borderRadius: '50%' }}></span> Powered by advanced AI for mining and geological analysis
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
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
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fafbfc' }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' 
                }}
              >
                <div style={{ 
                  maxWidth: '80%', 
                  padding: '12px 16px', 
                  borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0', 
                  background: msg.sender === 'user' ? '#0284c7' : '#fff', 
                  color: msg.sender === 'user' ? '#fff' : '#0f172a',
                  border: msg.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
                  fontSize: '13px',
                  whiteSpace: 'pre-line',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Suggestion Chips */}
          <div style={{ padding: '10px 20px', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            <button onClick={() => handleQuickPrompt("Summarize the latest geological report")} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '5px 10px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              📄 Summarize the latest geological report
            </button>
            <button onClick={() => handleQuickPrompt("Compare coal production of last 6 months")} style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0284c7', padding: '5px 10px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              📊 Compare coal production of last 6 months
            </button>
            <button onClick={() => handleQuickPrompt("Show mine-wise output trend")} style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#d97706', padding: '5px 10px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              📈 Show mine-wise output trend
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Ask anything about your documents, data, reports or mining operations..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: '#0f172a' }}
              />
              <button type="submit" style={{ background: '#0284c7', border: 'none', width: '32px', height: '32px', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
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
                <FileText size={16} color="#0284c7" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>Summarize Document</span>
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