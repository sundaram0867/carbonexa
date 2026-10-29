import { useEffect, useRef, useState } from 'react';
import { Menu, Search, Bell, Settings as SettingsIcon, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../assets/header-bg.png';
import { loadNotifications, notificationsUpdatedEvent } from '../data/notifications';

const searchablePages = [
  { label: 'Dashboard', path: '/', description: 'Overview and key metrics' },
  { label: 'Documents', path: '/documents', description: 'Browse and organize files' },
  { label: 'Reports', path: '/reports', description: 'Create and review reports' },
  { label: 'Analysis', path: '/analysis', description: 'Explore operational data' },
  { label: 'AI Assistant', path: '/ai-assistant', description: 'Ask questions about your data' },
  { label: 'Archives', path: '/archives', description: 'Find archived records' },
  { label: 'Settings', path: '/settings', description: 'Manage preferences and access' },
  { label: 'Notifications', path: '/notifications', description: 'Review recent updates' },
];

function Header({ onMenuClick, isSidebarOpen, isSidebarCollapsed }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 650px)').matches);
  const [unreadCount, setUnreadCount] = useState(() => (
    loadNotifications().notifications.filter((notification) => !notification.read).length
  ));
  const filteredPages = searchablePages.filter((page) => (
    page.label.toLowerCase().includes(query.trim().toLowerCase())
  ));
  const menuExpanded = isMobile ? isSidebarOpen : !isSidebarCollapsed;

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 650px)');
    const handleViewportChange = (event) => setIsMobile(event.matches);
    const updateUnreadCount = () => {
      setUnreadCount(loadNotifications().notifications.filter((notification) => !notification.read).length);
    };
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    window.addEventListener(notificationsUpdatedEvent, updateUnreadCount);
    window.addEventListener('storage', updateUnreadCount);
    mobileQuery.addEventListener('change', handleViewportChange);
    return () => {
      window.removeEventListener('keydown', handleShortcut);
      window.removeEventListener(notificationsUpdatedEvent, updateUnreadCount);
      window.removeEventListener('storage', updateUnreadCount);
      mobileQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  const openPage = (page) => {
    navigate(page.path);
    setQuery('');
    setSearchOpen(false);
  };

  return (
    <header className="header" style={{ position: 'relative', overflow: 'visible' }}>
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(rgba(10, 35, 51, 0.52), rgba(10, 35, 51, 0.52))'
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
            opacity: 0.28,
            pointerEvents: 'none'
          }}
        />
      </div>

      <button
        type="button"
        className="menu-button" 
        aria-label={isMobile ? (isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu') : (isSidebarCollapsed ? 'Expand navigation menu' : 'Collapse navigation menu')}
        aria-expanded={menuExpanded}
        onClick={onMenuClick}
        style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
      >
        <Menu size={20} />
      </button>

      <div
        className="header-search-wrap"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false);
        }}
      >
        <div className="search-box" style={{ position: 'relative', zIndex: 1 }}>
          <Search size={16} aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search pages..."
            aria-label="Search pages"
            aria-autocomplete="list"
            aria-controls="header-search-results"
            aria-expanded={searchOpen && query.trim().length > 0}
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && filteredPages[0]) {
                event.preventDefault();
                openPage(filteredPages[0]);
              }
            }}
          />
          {query ? (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={() => {
              setQuery('');
              setSearchOpen(true);
              searchInputRef.current?.focus();
            }}>
              <X size={14} />
            </button>
          ) : <span aria-hidden="true">⌘ / Ctrl K</span>}
        </div>
        {searchOpen && query.trim() && (
          <div className="header-search-results" id="header-search-results" role="listbox" aria-label="Matching pages">
            {filteredPages.length ? filteredPages.map((page) => (
              <button type="button" role="option" aria-selected="false" key={page.path} onClick={() => openPage(page)}>
                <strong>{page.label}</strong>
                <span>{page.description}</span>
              </button>
            )) : <p>No matching pages</p>}
          </div>
        )}
      </div>

      <div className="header-actions" style={{ position: 'relative', zIndex: 1 }}>
        <Link 
          to="/notifications" 
          className="header-icon" 
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', textDecoration: 'none', cursor: 'pointer', position: 'relative' }}
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </Link>

        <Link 
          to="/settings" 
          className="header-icon" 
          aria-label="Settings"
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