import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Analysis from './pages/Analysis';
import AIAssistant from './pages/AIAssistant';
import Archives from './pages/Archives';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

import './index.css';
import './App.css';
import './Workspace.css';

const settingsStorageKey = 'carbonexa-settings';

const loadTheme = () => {
  try {
    const savedSettings = localStorage.getItem(settingsStorageKey);
    if (!savedSettings) return 'Light';
    const settings = JSON.parse(savedSettings);
    return settings?.theme === 'Dark' ? 'Dark' : 'Light';
  } catch {
    return 'Light';
  }
};

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(loadTheme);
  const [themeStorageError, setThemeStorageError] = useState('');

  const handleThemeChange = (nextTheme) => {
    if (nextTheme !== 'Light' && nextTheme !== 'Dark') return;

    setTheme(nextTheme);
    try {
      const savedSettings = localStorage.getItem(settingsStorageKey);
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        throw new Error('Saved settings have an invalid format.');
      }
      localStorage.setItem(settingsStorageKey, JSON.stringify({ ...settings, theme: nextTheme }));
      setThemeStorageError('');
    } catch {
      setThemeStorageError('Theme changed for this session but could not be saved in this browser.');
    }
  };

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== settingsStorageKey || !event.newValue) return;
      try {
        const settings = JSON.parse(event.newValue);
        if (settings?.theme === 'Light' || settings?.theme === 'Dark') setTheme(settings.theme);
      } catch {
        // Keep the current theme if another tab writes invalid settings.
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === 'Dark' ? 'dark' : 'light';
    document.body.style.backgroundColor = theme === 'Dark' ? '#12191d' : '#f8fafc';
  }, [theme]);

  const handleMenuToggle = () => {
    if (window.matchMedia('(max-width: 650px)').matches) {
      setMobileSidebarOpen((open) => !open);
      return;
    }

    setSidebarCollapsed((collapsed) => !collapsed);
  };

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <BrowserRouter>
      <div className={`app${sidebarCollapsed ? ' sidebar-collapsed' : ''}${mobileSidebarOpen ? ' mobile-sidebar-open' : ''}${theme === 'Dark' ? ' dark-mode' : ''}`} data-theme={theme.toLowerCase()} style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        {mobileSidebarOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Close navigation menu"
            onClick={closeMobileSidebar}
          />
        )}
        <Sidebar collapsed={sidebarCollapsed} onNavigate={closeMobileSidebar} />
        
        <div className="app-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <Header
            onMenuClick={handleMenuToggle}
            isSidebarOpen={mobileSidebarOpen}
            isSidebarCollapsed={sidebarCollapsed}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
          {themeStorageError && <div className="theme-storage-error" role="alert">{themeStorageError}</div>}
          
          <div 
            className="page-container" 
            style={{ 
              flex: 1, 
              background: 'transparent', // Allows global background image to show through
              overflowY: 'auto' 
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/archives" element={<Archives />} />
              <Route path="/settings" element={<Settings theme={theme} onThemeChange={handleThemeChange} />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </div>
          
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
