import { useState } from 'react';

function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [savedMessage, setSavedMessage] = useState('');

  // Form states
  const [profile, setProfile] = useState({ name: 'Prathamesh Tripathi', email: 'prathamesh.tripathi@carbonexa.com', role: 'Lead Mining Intelligence Analyst', phone: '+91 98765 43210' });
  const [language, setLanguage] = useState('English (India)');
  const [theme, setTheme] = useState('Light');
  const [twoFA, setTwoFA] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [aiModel, setAiModel] = useState('Gemini 2.5 Pro (Mining Enterprise)');
  const [autoArchive, setAutoArchive] = useState(true);
  const [storageLimit, setStorageLimit] = useState('500 GB');
  const [apiAccess, setApiAccess] = useState(true);

  const handleSave = (sectionName) => {
    setSavedMessage(`${sectionName} updated successfully!`);
    setTimeout(() => setSavedMessage(''), 3500);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '24px 32px', color: '#fff', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0' }}>Settings</h1>
          <p style={{ fontSize: '13px', margin: 0, opacity: 0.85 }}>
            Manage your account, preferences, system settings and team access.
          </p>
        </div>
        {savedMessage && (
          <div style={{ background: '#22c55e', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', animation: 'fadeIn 0.3s' }}>
            ✓ {savedMessage}
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        
        {/* Left Nav */}
        <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '12px', height: 'fit-content' }}>
          {['Profile', 'Account', 'Notifications', 'Appearance', 'Project Settings', 'AI Assistant', 'Storage & Data', 'Team & Access', 'Integrations', 'System'].map((tab) => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: '10px 12px', 
                borderRadius: '6px', 
                background: activeTab === tab ? '#e0f2fe' : 'transparent', 
                color: activeTab === tab ? '#0369a1' : '#334155', 
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === tab ? '600' : '500',
                marginBottom: '4px',
                transition: 'background 0.15s'
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Right Content Dynamic Views */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'Profile' && (
            <>
              <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Profile Information</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#0284c7', color: '#fff', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    PT
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{profile.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{profile.email}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Full Name</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Email Address</label>
                    <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Role / Title</label>
                    <input type="text" value={profile.role} onChange={(e) => setProfile({...profile, role: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                    <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                  </div>
                </div>
                <button onClick={() => handleSave('Profile')} style={{ marginTop: '20px', background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  Save Changes
                </button>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Two-Factor Authentication</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Add an extra layer of security to your mining intelligence account.</p>
                </div>
                <input type="checkbox" checked={twoFA} onChange={() => setTwoFA(!twoFA)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              </div>
            </>
          )}

          {/* TAB 2: ACCOUNT */}
          {activeTab === 'Account' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Account Security & Credentials</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '450px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Current Password</label>
                  <input type="password" placeholder="••••••••••••" style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>New Password</label>
                  <input type="password" placeholder="At least 8 characters" style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
                  <input type="password" placeholder="Re-enter password" style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                </div>
                <button onClick={() => handleSave('Password')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', width: 'fit-content' }}>
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'Notifications' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Notification Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}>
                  <input type="checkbox" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} style={{ width: '16px', height: '16px' }} />
                  Receive instant Email alerts for environmental compliance breaches and critical mine alerts.
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}>
                  <input type="checkbox" checked={smsAlerts} onChange={() => setSmsAlerts(!smsAlerts)} style={{ width: '16px', height: '16px' }} />
                  Receive SMS alerts on registered mobile for high-priority safety hazards.
                </label>
                <button onClick={() => handleSave('Notifications')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', width: 'fit-content', marginTop: '10px' }}>
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCE */}
          {activeTab === 'Appearance' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Appearance & Regional Preferences</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }}>
                    <option value="English (India)">English (India)</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Theme</label>
                  <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }}>
                    <option value="Light">Light (Glass Frosted)</option>
                    <option value="Dark">Dark Mode</option>
                  </select>
                </div>
              </div>
              <button onClick={() => handleSave('Appearance')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginTop: '20px' }}>
                Apply Settings
              </button>
            </div>
          )}

          {/* TAB 5: PROJECT SETTINGS */}
          {activeTab === 'Project Settings' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Active Mining Project Parameters</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Configure default benchmark thresholds for coal and mineral extraction units.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Default Production Target (Tonnes)</label>
                  <input type="text" defaultValue="6,200" style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Water Quality PPM Limit</label>
                  <input type="text" defaultValue="120 PPM" style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                </div>
              </div>
              <button onClick={() => handleSave('Project parameters')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginTop: '20px' }}>
                Save Parameters
              </button>
            </div>
          )}

          {/* TAB 6: AI ASSISTANT */}
          {activeTab === 'AI Assistant' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Gemini AI Assistant Integration</h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Active LLM Model</label>
                <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} style={{ width: '100%', maxWidth: '400px', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }}>
                  <option value="Gemini 2.5 Pro (Mining Enterprise)">Gemini 2.5 Pro (Mining Enterprise)</option>
                  <option value="Gemini Flash 1.5">Gemini Flash 1.5 (Fast Analysis)</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                Enable automated report summarization and predictive safety insights.
              </label>
              <button onClick={() => handleSave('AI settings')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginTop: '20px', display: 'block' }}>
                Save AI Config
              </button>
            </div>
          )}

          {/* TAB 7: STORAGE & DATA */}
          {activeTab === 'Storage & Data' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Cloud Storage & Data Retention</h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Allocated Cloud Tier</label>
                <select value={storageLimit} onChange={(e) => setStorageLimit(e.target.value)} style={{ width: '100%', maxWidth: '400px', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }}>
                  <option value="500 GB">500 GB Enterprise Cloud</option>
                  <option value="1 TB">1 TB Enterprise Cloud</option>
                  <option value="Unlimited">Unlimited Dedicated Node</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '13px', color: '#334155', marginBottom: '20px' }}>
                <input type="checkbox" checked={autoArchive} onChange={() => setAutoArchive(!autoArchive)} style={{ width: '16px', height: '16px' }} />
                Automatically archive compliance reports older than 12 months.
              </label>
              <button onClick={() => handleSave('Storage settings')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Save Storage Config
              </button>
            </div>
          )}

          {/* TAB 8: TEAM & ACCESS */}
          {activeTab === 'Team & Access' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Team Members & Role Control</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>Prathamesh Tripathi</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>prathamesh.tripathi@carbonexa.com (Admin)</div>
                  </div>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Owner</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>Rakesh Tripathi</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>rakesh.tripathi@carbonexa.com</div>
                  </div>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Compliance Auditor</span>
                </div>
              </div>
              <button onClick={() => alert('Invite member modal triggered!')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                + Invite Team Member
              </button>
            </div>
          )}

          {/* TAB 9: INTEGRATIONS */}
          {activeTab === 'Integrations' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Third-Party Integrations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong>Google Cloud IoT Sensor Feed</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Real-time particulate & air quality telemetry</div>
                  </div>
                  <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '12px' }}>● Connected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong>SAP ERP Mining Logistics</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Vehicle dispatch & output tracking</div>
                  </div>
                  <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '12px' }}>● Connected</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SYSTEM */}
          {activeTab === 'System' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>System Diagnostics & API Access</h3>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong>Developer REST API Key</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Used for querying remote mining telemetry endpoints</div>
                </div>
                <input type="checkbox" checked={apiAccess} onChange={() => setApiAccess(!apiAccess)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'monospace', color: '#334155', marginBottom: '16px' }}>
                cx_live_9983a71b2e409c85df7701
              </div>
              <button onClick={() => handleSave('System diagnostics')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Regenerate API Key
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Settings;