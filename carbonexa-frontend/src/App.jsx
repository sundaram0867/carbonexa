import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
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

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      <div className={`app${sidebarCollapsed ? ' sidebar-collapsed' : ''}${mobileSidebarOpen ? ' mobile-sidebar-open' : ''}`} style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
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
          />
          
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
              <Route path="/settings" element={<Settings />} />
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