import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Search, Bell, Settings as SettingsIcon, X, Moon, Sun, Plus, Clock3, FolderOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loadNotifications, notificationsUpdatedEvent } from '../data/notifications';
import { loadRecentSearches, saveRecentSearch, searchWorkspace } from '../services/searchService';
import { loadRecentActivity, recentActivityUpdatedEvent, recordRecentActivity } from '../services/activityService';

const searchablePages = [
  { label: 'Dashboard', path: '/', description: 'Overview and key metrics' },
  { label: 'Projects', path: '/projects', description: 'Create and manage project profiles' },
  { label: 'Documents', path: '/documents', description: 'Browse and organize files' },
  { label: 'Reports', path: '/reports', description: 'Create and review reports' },
  { label: 'Analysis', path: '/analysis', description: 'Explore operational data' },
  { label: 'AI Assistant', path: '/ai-assistant', description: 'Ask questions about your data' },
  { label: 'Archives', path: '/archives', description: 'Find archived records' },
  { label: 'Settings', path: '/settings', description: 'Manage preferences and access' },
  { label: 'Notifications', path: '/notifications', description: 'Review recent updates' },
];

function Header({
  onMenuClick,
  isSidebarOpen,
  isSidebarCollapsed,
  theme,
  onThemeChange,
  projects,
  activeProjectId,
  onProjectChange,
}) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ query: '', results: [], error: '', loading: false });
  const [recentSearches, setRecentSearches] = useState(() => loadRecentSearches().searches);
  const [recentActivity, setRecentActivity] = useState(() => loadRecentActivity().items);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 650px)').matches);
  const [unreadCount, setUnreadCount] = useState(() => (
    loadNotifications().notifications.filter((notification) => !notification.read).length
  ));
  const filteredPages = searchablePages.filter((page) => (
    page.label.toLowerCase().includes(query.trim().toLowerCase())
  ));
  const entityResults = useMemo(() => (
    searchState.query === query.trim() ? searchState.results : []
  ), [query, searchState.query, searchState.results]);
  const searchError = searchState.query === query.trim() ? searchState.error : '';
  const isSearching = searchState.query === query.trim() && searchState.loading;
  const searchableResults = useMemo(() => ([
    ...filteredPages.map((page) => ({ ...page, type: 'Page' })),
    ...entityResults,
  ]), [entityResults, filteredPages]);
  const groupedResults = useMemo(() => searchableResults.reduce((groups, result) => {
    groups[result.type] = [...(groups[result.type] || []), result];
    return groups;
  }, {}), [searchableResults]);
  const recentItems = useMemo(() => recentActivity.slice(0, 4), [recentActivity]);
  const menuExpanded = isMobile ? isSidebarOpen : !isSidebarCollapsed;

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 650px)');
    const handleViewportChange = (event) => setIsMobile(event.matches);
    const updateUnreadCount = () => {
      setUnreadCount(loadNotifications().notifications.filter((notification) => !notification.read).length);
    };
    const updateRecentActivity = () => setRecentActivity(loadRecentActivity().items);
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
        setQuickActionsOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    window.addEventListener(notificationsUpdatedEvent, updateUnreadCount);
    window.addEventListener(recentActivityUpdatedEvent, updateRecentActivity);
    window.addEventListener('storage', updateUnreadCount);
    window.addEventListener('storage', updateRecentActivity);
    mobileQuery.addEventListener('change', handleViewportChange);
    return () => {
      window.removeEventListener('keydown', handleShortcut);
      window.removeEventListener(notificationsUpdatedEvent, updateUnreadCount);
      window.removeEventListener(recentActivityUpdatedEvent, updateRecentActivity);
      window.removeEventListener('storage', updateUnreadCount);
      window.removeEventListener('storage', updateRecentActivity);
      mobileQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    const searchTerm = query.trim();
    if (!searchTerm) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchState({ query: searchTerm, results: [], error: '', loading: true });
      try {
        const results = await searchWorkspace(searchTerm, projects, { signal: controller.signal });
        setSearchState({ query: searchTerm, results, error: '', loading: false });
        setActiveResultIndex(0);
      } catch (error) {
        if (error?.name !== 'AbortError') {
          setSearchState({ query: searchTerm, results: [], error: error.message || 'Search is temporarily unavailable.', loading: false });
        }
      }
    }, 140);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [projects, query]);

  const openResult = (result) => {
    const searchTerm = query.trim();
    if (searchTerm) {
      try {
        saveRecentSearch(searchTerm);
        setRecentSearches(loadRecentSearches().searches);
        if (result.type !== 'Page') {
          recordRecentActivity({
            id: result.id,
            type: result.type,
            title: result.title,
            path: result.path,
          });
        }
      } catch (error) {
        setSearchState((current) => ({
          ...current,
          error: error.message || 'The search could not be saved to recent searches.',
        }));
      }
    }
    navigate(result.path);
    setQuery('');
    setSearchOpen(false);
  };

  const openQuickAction = (path) => {
    navigate(path);
    setQuickActionsOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'ArrowDown' && searchableResults.length) {
      event.preventDefault();
      setActiveResultIndex((index) => (index + 1) % searchableResults.length);
    } else if (event.key === 'ArrowUp' && searchableResults.length) {
      event.preventDefault();
      setActiveResultIndex((index) => (index - 1 + searchableResults.length) % searchableResults.length);
    } else if (event.key === 'Enter') {
      if (searchableResults[activeResultIndex]) {
        event.preventDefault();
        openResult(searchableResults[activeResultIndex]);
      }
    }
  };

  return (
    <header className="header" style={{ position: 'relative', overflow: 'visible' }}>
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

      <div className="header-project-context">
        <label htmlFor="active-project-select">Workspace project</label>
        {projects.length ? (
          <select
            id="active-project-select"
            aria-label="Select workspace project"
            value={activeProjectId}
            onChange={(event) => onProjectChange(event.target.value)}
          >
            {!activeProjectId && <option value="">Select a project</option>}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        ) : (
          <Link className="header-project-empty" to="/projects">Add a project</Link>
        )}
      </div>

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
            placeholder="Search projects, mines, documents..."
            aria-label="Search projects, mines, documents, reports, and archives"
            aria-autocomplete="list"
            aria-controls="header-search-results"
            aria-activedescendant={query.trim() && searchableResults[activeResultIndex] ? `header-search-result-${activeResultIndex}` : undefined}
            aria-expanded={searchOpen && query.trim().length > 0}
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveResultIndex(0);
              setSearchOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
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
        {searchOpen && (
          <div className="header-search-results" id="header-search-results" role="listbox" aria-label="Workspace search results">
            {query.trim() ? (
              <>
                {isSearching && <p role="status">Searching workspace…</p>}
                {searchError && <p role="alert">{searchError}</p>}
                {Object.entries(groupedResults).map(([group, results]) => (
                  <section key={group} className="header-search-group" aria-label={`${group} results`}>
                    <h3>{group}s</h3>
                    {results.map((result) => {
                      const resultIndex = searchableResults.indexOf(result);
                      return (
                        <button
                          type="button"
                          role="option"
                          id={`header-search-result-${resultIndex}`}
                          aria-selected={resultIndex === activeResultIndex}
                          key={`${result.type}-${result.id || result.path}`}
                          onMouseEnter={() => setActiveResultIndex(resultIndex)}
                          onClick={() => openResult(result)}
                        >
                          <strong>{result.title || result.label}</strong>
                          <span>{result.description}</span>
                        </button>
                      );
                    })}
                  </section>
                ))}
                {!isSearching && !searchError && !searchableResults.length && <p>No matching projects, mines, documents, reports, or archives.</p>}
              </>
            ) : (
              <section className="header-search-group" aria-label="Recent searches">
                <h3><Clock3 size={12} /> Recent searches</h3>
                {recentSearches.length ? recentSearches.map((search) => (
                  <button type="button" key={search} onClick={() => setQuery(search)}>
                    <strong>{search}</strong><span>Search again</span>
                  </button>
                )) : <p>Your recent searches will appear here.</p>}
              </section>
            )}
          </div>
        )}
      </div>

      <div className="header-actions" style={{ position: 'relative', zIndex: 1 }}>
        <div
          className="header-quick-actions"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setQuickActionsOpen(false);
          }}
        >
          <button
            type="button"
            className="header-icon"
            aria-label="Open quick actions"
            aria-expanded={quickActionsOpen}
            aria-haspopup="menu"
            onClick={() => setQuickActionsOpen((open) => !open)}
          >
            <Plus size={19} />
          </button>
          {quickActionsOpen && (
            <div className="header-quick-actions-menu" role="menu" aria-label="Quick actions">
              <strong>Quick actions</strong>
              <button type="button" role="menuitem" onClick={() => openQuickAction('/projects?action=create')}>Create project</button>
              <button type="button" role="menuitem" onClick={() => openQuickAction('/documents?action=upload')}>Upload document</button>
              <button type="button" role="menuitem" onClick={() => openQuickAction('/reports?action=generate')}>Generate report</button>
              <button type="button" role="menuitem" onClick={() => openQuickAction('/analysis?action=generate')}>Start analysis</button>
              {recentItems.length > 0 && (
                <section className="header-recent-projects" aria-label="Recent activity">
                  <strong><FolderOpen size={13} /> Recent activity</strong>
                  {recentItems.map((item) => (
                    <button
                      type="button"
                      role="menuitem"
                      key={`${item.type}-${item.id}`}
                      onClick={() => openQuickAction(item.path)}
                    >
                      <span className="header-recent-type">{item.type}</span>{item.title}
                    </button>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className="header-icon theme-toggle"
          aria-label={`Switch to ${theme === 'Dark' ? 'light' : 'dark'} mode`}
          aria-pressed={theme === 'Dark'}
          title={`Switch to ${theme === 'Dark' ? 'light' : 'dark'} mode`}
          onClick={() => {
            const nextTheme = theme === 'Dark' ? 'Light' : 'Dark';
            onThemeChange(nextTheme);
          }}
        >
          {theme === 'Dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
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