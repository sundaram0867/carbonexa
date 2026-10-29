import { useState } from 'react';

const SETTINGS_STORAGE_KEY = 'carbonexa-settings';
const settingsTabs = ['Profile', 'Account', 'Notifications', 'Appearance', 'Project Settings', 'AI Assistant', 'Storage & Data', 'Team & Access', 'Integrations', 'System'];

const loadStoredSettings = () => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      throw new Error('Stored settings have an invalid format.');
    }

    return { settings, error: '' };
  } catch {
    return {
      settings: {},
      error: 'Saved settings could not be read. Changes can still be saved again.'
    };
  }
};

function Settings() {
  const [storedSettings] = useState(loadStoredSettings);
  const getSavedSetting = (key, fallback) => (
    typeof storedSettings.settings[key] === typeof fallback ? storedSettings.settings[key] : fallback
  );
  const [activeTab, setActiveTab] = useState('Profile');
  const [savedMessage, setSavedMessage] = useState('');
  const [storageMessage, setStorageMessage] = useState(storedSettings.error);

  // Form states
  const [profile, setProfile] = useState(() => {
    const defaultProfile = { name: 'Prathamesh Tripathi', email: 'prathamesh.tripathi@carbonexa.com', role: 'Lead Mining Intelligence Analyst', phone: '+91 98765 43210' };
    const savedProfile = storedSettings.settings.profile;
    return savedProfile && typeof savedProfile === 'object' && !Array.isArray(savedProfile)
      ? { ...defaultProfile, ...savedProfile }
      : defaultProfile;
  });
  const [language, setLanguage] = useState(() => getSavedSetting('language', 'English (India)'));
  const [theme, setTheme] = useState(() => getSavedSetting('theme', 'Light'));
  const [twoFA, setTwoFA] = useState(() => getSavedSetting('twoFA', true));
  const [emailAlerts, setEmailAlerts] = useState(() => getSavedSetting('emailAlerts', true));
  const [smsAlerts, setSmsAlerts] = useState(() => getSavedSetting('smsAlerts', false));
  const [aiModel, setAiModel] = useState(() => getSavedSetting('aiModel', 'Gemini 2.5 Pro (Mining Enterprise)'));
  const [autoArchive, setAutoArchive] = useState(() => getSavedSetting('autoArchive', true));
  const [storageLimit, setStorageLimit] = useState(() => getSavedSetting('storageLimit', '500 GB'));
  const [retentionPeriod, setRetentionPeriod] = useState(() => getSavedSetting('retentionPeriod', '12 months'));
  const [apiAccess, setApiAccess] = useState(() => getSavedSetting('apiAccess', true));
  const [pushAlerts, setPushAlerts] = useState(() => getSavedSetting('pushAlerts', true));
  const [weeklyDigest, setWeeklyDigest] = useState(() => getSavedSetting('weeklyDigest', false));
  const [sessionTimeout, setSessionTimeout] = useState(() => getSavedSetting('sessionTimeout', '30 minutes'));
  const [defaultProject, setDefaultProject] = useState(() => getSavedSetting('defaultProject', 'Jharia Block'));
  const [productionTarget, setProductionTarget] = useState(() => getSavedSetting('productionTarget', '6200'));
  const [waterQualityLimit, setWaterQualityLimit] = useState(() => getSavedSetting('waterQualityLimit', '120'));
  const [autoSummaries, setAutoSummaries] = useState(() => getSavedSetting('autoSummaries', true));
  const [includeArchivedData, setIncludeArchivedData] = useState(() => getSavedSetting('includeArchivedData', false));
  const [dateFormat, setDateFormat] = useState(() => getSavedSetting('dateFormat', 'DD MMM YYYY'));
  const [settingsSearch, setSettingsSearch] = useState('');

  const handleSave = (sectionName) => {
    const settings = {
      profile,
      language,
      theme,
      twoFA,
      emailAlerts,
      smsAlerts,
      pushAlerts,
      weeklyDigest,
      sessionTimeout,
      defaultProject,
      productionTarget,
      waterQualityLimit,
      aiModel,
      autoSummaries,
      includeArchivedData,
      autoArchive,
      storageLimit,
      retentionPeriod,
      apiAccess,
      dateFormat
    };

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setStorageMessage('');
      setSavedMessage(`${sectionName} saved on this device.`);
      setTimeout(() => setSavedMessage(''), 3500);
    } catch {
      setSavedMessage('');
      setStorageMessage('Could not save settings in this browser. Check available storage and try again.');
    }
  };

  const storageUsagePercent = storageLimit === '500 GB' ? 9 : storageLimit === '1 TB' ? 4 : null;
  const visibleTabs = settingsTabs.filter((tab) => tab.toLowerCase().includes(settingsSearch.trim().toLowerCase()));

  return (
    <div className="workspace-page settings-page" style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Header Banner */}
      <div className="workspace-banner settings-banner" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '24px 32px', color: '#fff', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      {storageMessage && <div className="settings-storage-message" role="alert">{storageMessage}</div>}

      {/* Main Layout */}
      <div className="settings-main-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        
        {/* Left Nav */}
        <div className="settings-tabs-panel" style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '12px', height: 'fit-content' }}>
          <label className="settings-search-label" htmlFor="settings-search">Find a setting</label>
          <input
            id="settings-search"
            className="settings-search"
            type="search"
            placeholder="Search settings..."
            value={settingsSearch}
            onChange={(event) => setSettingsSearch(event.target.value)}
          />
          <nav className="settings-tab-list" aria-label="Settings categories">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                aria-current={activeTab === tab ? 'page' : undefined}
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
              </button>
            ))}
            {visibleTabs.length === 0 && (
              <p className="settings-search-empty">No settings categories match.</p>
            )}
          </nav>
        </div>

        {/* Right Content Dynamic Views */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'Profile' && (
            <>
              <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Profile Information</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div className="settings-profile-avatar" style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#0284c7', color: '#fff', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    PT
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{profile.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{profile.email}</div>
                  </div>
                </div>
                <div className="settings-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Preferred session duration</label>
                  <select value={sessionTimeout} onChange={(event) => setSessionTimeout(event.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }}>
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>Never</option>
                  </select>
                </div>
                <button onClick={() => handleSave('Password')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', width: 'fit-content' }}>
                  Save Security Settings
                </button>
              </div>
              <p className="settings-note">Session duration is stored as a preference. Enforcing sign-out and changing passwords require a connected account service.</p>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}>
                  <input type="checkbox" checked={pushAlerts} onChange={() => setPushAlerts(!pushAlerts)} style={{ width: '16px', height: '16px' }} />
                  Show in-app alerts for production milestones and system updates.
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}>
                  <input type="checkbox" checked={weeklyDigest} onChange={() => setWeeklyDigest(!weeklyDigest)} style={{ width: '16px', height: '16px' }} />
                  Send a weekly summary of reports, project activity, and outstanding reviews.
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
              <div className="settings-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Date format</label>
                  <select value={dateFormat} onChange={(event) => setDateFormat(event.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }}>
                    <option>DD MMM YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
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
              <div className="settings-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Default Production Target (Tonnes)</label>
                  <input type="number" min="0" value={productionTarget} onChange={(event) => setProductionTarget(event.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Water Quality PPM Limit</label>
                  <input type="number" min="0" value={waterQualityLimit} onChange={(event) => setWaterQualityLimit(event.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Default project</label>
                  <select value={defaultProject} onChange={(event) => setDefaultProject(event.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.9)' }}>
                    <option>Jharia Block</option>
                    <option>Bokaro Project</option>
                    <option>North Karanpura</option>
                    <option>Talcher Coalfield</option>
                    <option>Ib Valley</option>
                  </select>
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
                <input type="checkbox" checked={autoSummaries} onChange={(event) => setAutoSummaries(event.target.checked)} style={{ width: '16px', height: '16px' }} />
                Enable automated report summarization and predictive safety insights.
              </label>
              <label className="settings-option-row">
                <input type="checkbox" checked={includeArchivedData} onChange={(event) => setIncludeArchivedData(event.target.checked)} />
                Allow the assistant to use archived documents when answering questions.
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
              <div className="settings-retention-control">
                <label htmlFor="settings-retention">Archive compliance reports after</label>
                <select id="settings-retention" value={retentionPeriod} onChange={(event) => setRetentionPeriod(event.target.value)}>
                  <option>6 months</option>
                  <option>12 months</option>
                  <option>24 months</option>
                  <option>36 months</option>
                </select>
              </div>
              <label className="settings-option-row">
                <input type="checkbox" checked={autoArchive} onChange={(event) => setAutoArchive(event.target.checked)} />
                Automatically archive reports after the selected retention period.
              </label>
              <div className="settings-storage-summary">
                <strong>Storage overview</strong>
                <span>42.8 GB used · {storageLimit} allocated</span>
                {storageUsagePercent === null
                  ? <span>Usage percentage is not available for an unlimited plan.</span>
                  : (
                    <div className="settings-storage-meter" role="progressbar" aria-label="Storage used" aria-valuenow={storageUsagePercent} aria-valuemin="0" aria-valuemax="100">
                      <span style={{ width: `${storageUsagePercent}%` }} />
                    </div>
                  )}
              </div>
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
              <div className="settings-note">
                API credentials are managed by the connected backend and are not displayed in this demo.
              </div>
              <button onClick={() => handleSave('System diagnostics')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Save Access Preference
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Settings;