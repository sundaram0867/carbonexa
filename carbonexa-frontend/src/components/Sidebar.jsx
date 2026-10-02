import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart2, 
  Activity, 
  Bot, 
  Archive, 
  Settings,
  LifeBuoy
} from 'lucide-react';

// Import your vertical sidebar background image from the assets folder
import sidebarBg from '../assets/sidebar-bg.png';

function Sidebar() {
  const navClass = ({ isActive }) => (isActive ? "nav-item active" : "nav-item");

  return (
    <aside 
      className="sidebar"
      style={{
        // Semi-transparent white overlay so your menu text and icons stay sharp and readable
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.50), rgba(255, 255, 255, 0.50)), url(${sidebarBg})`,
        backgroundSize: 'cover',
        // 'center bottom' aligns the image so the dumper and excavators at the bottom are visible
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="sidebar-logo">
        <div className="logo-mark">C</div>
        <span>CARBONEXA</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={navClass}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/documents" className={navClass}>
          <FileText size={18} />
          <span>Documents</span>
        </NavLink>
        <NavLink to="/reports" className={navClass}>
          <BarChart2 size={18} />
          <span>Reports</span>
        </NavLink>
        <NavLink to="/analysis" className={navClass}>
          <Activity size={18} />
          <span>Analysis</span>
        </NavLink>
        <NavLink to="/ai-assistant" className={navClass}>
          <Bot size={18} />
          <span>AI Assistant</span>
        </NavLink>
        <NavLink to="/archives" className={navClass}>
          <Archive size={18} />
          <span>Archives</span>
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <LifeBuoy size={24} />
          <strong>Need Help?</strong>
          <p>Check our docs for guidance on generating mining reports.</p>
          <a href="#">Documentation</a>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
