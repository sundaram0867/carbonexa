import { Link, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart2, 
  Activity, 
  Bot, 
  Archive, 
  Settings,
  Sparkles,
  Bell
} from 'lucide-react';

// Import your vertical sidebar background image from the assets folder
import sidebarBg from '../assets/sidebar-bg.png';
import carbonexaLogo from '../assets/carbonexa-logo.png';

function Sidebar({ collapsed, onNavigate }) {
  const navClass = ({ isActive }) => (isActive ? "nav-item active" : "nav-item");

  return (
    <aside 
      className={`sidebar${collapsed ? ' is-collapsed' : ''}`}
      aria-label="Main navigation"
      style={{
        // Semi-transparent white overlay so your menu text and icons stay sharp and readable
        backgroundImage: `linear-gradient(rgba(248, 251, 253, 0.91), rgba(248, 251, 253, 0.91)), url(${sidebarBg})`,
        backgroundSize: 'cover',
        // 'center bottom' aligns the image so the dumper and excavators at the bottom are visible
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="sidebar-logo" title={collapsed ? 'Carbonexa' : undefined}>
        <img className="logo-mark" src={carbonexaLogo} alt="Carbonexa logo" />
        <span>CARBONEXA</span>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-nav-label">WORKSPACE</span>
        <NavLink to="/" className={navClass} title={collapsed ? 'Dashboard' : undefined} onClick={onNavigate}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/documents" className={navClass} title={collapsed ? 'Documents' : undefined} onClick={onNavigate}>
          <FileText size={18} />
          <span>Documents</span>
        </NavLink>
        <NavLink to="/reports" className={navClass} title={collapsed ? 'Reports' : undefined} onClick={onNavigate}>
          <BarChart2 size={18} />
          <span>Reports</span>
        </NavLink>
        <NavLink to="/analysis" className={navClass} title={collapsed ? 'Analysis' : undefined} onClick={onNavigate}>
          <Activity size={18} />
          <span>Analysis</span>
        </NavLink>
        <NavLink to="/ai-assistant" className={navClass} title={collapsed ? 'AI Assistant' : undefined} onClick={onNavigate}>
          <Bot size={18} />
          <span>AI Assistant</span>
        </NavLink>
        <NavLink to="/archives" className={navClass} title={collapsed ? 'Archives' : undefined} onClick={onNavigate}>
          <Archive size={18} />
          <span>Archives</span>
        </NavLink>
        <NavLink to="/notifications" className={navClass} title={collapsed ? 'Notifications' : undefined} onClick={onNavigate}>
          <Bell size={18} />
          <span>Notifications</span>
        </NavLink>
        <NavLink to="/settings" className={navClass} title={collapsed ? 'Settings' : undefined} onClick={onNavigate}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {!collapsed && <div className="sidebar-bottom">
        <Link to="/ai-assistant" className="carbonexa-bot-card" onClick={onNavigate}>
          <span className="carbonexa-bot-icon"><Sparkles size={20} /></span>
          <strong>Carbonexa Bot</strong>
          <p>Your mining intelligence assistant is ready to help with data, reports, and insights.</p>
          <span className="carbonexa-bot-action">Start a conversation <span aria-hidden="true">→</span></span>
        </Link>
      </div>}
    </aside>
  );
}

export default Sidebar;
