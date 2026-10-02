import { Menu, Search, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/header-bg.png';

function Header() {
  return (
    <header className="header" style={{ position: 'relative', overflow: 'hidden' }}>
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(rgba(10, 25, 47, 0.20), rgba(10, 25, 47, 0.20))'
        }}
      >
        <img 
          src={bgImage} 
          alt="Header Background" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // Shifted slightly lower to bring the upper truck/machinery into view
            objectPosition: 'right 20%', 
            opacity: 0.45,
            pointerEvents: 'none'
          }}
        />
      </div>

      <Link 
        to="/" 
        className="menu-button" 
        style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
      >
        <Menu size={20} />
      </Link>

      <div className="search-box" style={{ position: 'relative', zIndex: 1 }}>
        <Search size={16} />
        <input type="text" placeholder="Search reports, active mines, alerts..." />
        <span>⌘K</span>
      </div>

      <div className="header-actions" style={{ position: 'relative', zIndex: 1 }}>
        <Link 
          to="/notifications" 
          className="header-icon" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', textDecoration: 'none', cursor: 'pointer', position: 'relative' }}
        >
          <Bell size={20} />
          <span className="notification-dot">3</span>
        </Link>

        <Link 
          to="/settings" 
          className="header-icon" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
        >
          <SettingsIcon size={20} />
        </Link>
      </div>

      <Link 
        to="/settings" 
        className="profile" 
        style={{ position: 'relative', zIndex: '1', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
      >
        <div className="profile-avatar">PT</div>
        <div className="profile-info">
          <strong>Prathamesh Tripathi</strong>
          <span>Admin</span>
        </div>
      </Link>
    </header>
  );
}

export default Header;