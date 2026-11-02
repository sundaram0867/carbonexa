import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectWorkspace from './pages/ProjectWorkspace';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Analysis from './pages/Analysis';
import AIAssistant from './pages/AIAssistant';
import Archives from './pages/Archives';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import { dataMode } from './config/api';
import {
  PROJECT_WORKSPACE_UPDATED_EVENT,
} from './data/projects';
import { projectService } from './services/projectService';
import { recordRecentActivity } from './services/activityService';

import './index.css';
import './App.css';
import './Workspace.css';

const settingsStorageKey = 'carbonexa-settings';
const activeProjectStorageKey = 'carbonexa-active-project-id';
const emptyProjectWorkspace = { projects: [], activeProjectId: '' };

const initialProjectWorkspaceState = () => {
  if (dataMode !== 'mock') return { workspace: emptyProjectWorkspace, error: '' };
  try {
    return { workspace: projectService.loadWorkspace(), error: '' };
  } catch (error) {
    return { workspace: emptyProjectWorkspace, error: error.message || 'Project data could not be loaded.' };
  }
};

const workspaceFromApiProjects = (projects) => {
  const savedActiveProjectId = localStorage.getItem(activeProjectStorageKey) || '';
  const activeProjectId = projects.some((project) => project.id === savedActiveProjectId && !project.archived)
    ? savedActiveProjectId
    : (projects.find((project) => !project.archived)?.id || '');
  return { projects, activeProjectId };
};

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

function Workspace() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(loadTheme);
  const [themeStorageError, setThemeStorageError] = useState('');
  const [projectWorkspaceState, setProjectWorkspaceState] = useState(initialProjectWorkspaceState);
  const [projectsLoading, setProjectsLoading] = useState(dataMode === 'php');
  const [activityStorageError, setActivityStorageError] = useState('');
  const { workspace: projectWorkspace, error: projectStorageError } = projectWorkspaceState;
  const activeProject = projectWorkspace.projects.find(
    (project) => project.id === projectWorkspace.activeProjectId
  ) || null;

  useEffect(() => {
    const projectMatch = location.pathname.match(/^\/projects\/([^/]+)$/);
    if (!projectMatch) return undefined;
    const timer = window.setTimeout(() => {
      try {
        const projectId = decodeURIComponent(projectMatch[1]);
        const project = projectWorkspace.projects.find((item) => item.id === projectId && !item.archived);
        if (!project) return;
        recordRecentActivity({
          id: project.id,
          type: 'Project',
          title: project.name,
          path: `/projects/${encodeURIComponent(project.id)}`,
        });
        setActivityStorageError('');
      } catch (error) {
        setActivityStorageError(error.message || 'Recent activity could not be saved in this browser.');
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname, projectWorkspace.projects]);

  const updateProjectWorkspace = async (nextWorkspace) => {
    try {
      const savedWorkspace = await projectService.saveWorkspace(nextWorkspace);
      setProjectWorkspaceState({ workspace: savedWorkspace, error: '' });
      window.dispatchEvent(new Event(PROJECT_WORKSPACE_UPDATED_EVENT));
      return true;
    } catch (error) {
      setProjectWorkspaceState((current) => ({
        ...current,
        error: error.message || (dataMode === 'php'
          ? 'Project information could not be saved by the API.'
          : 'Project information could not be saved in this browser. Check available storage and try again.'),
      }));
      return false;
    }
  };

  useEffect(() => {
    const refreshProjectWorkspace = async () => {
      if (dataMode === 'mock') {
        try {
          setProjectWorkspaceState({ workspace: projectService.loadWorkspace(), error: '' });
        } catch (error) {
          setProjectWorkspaceState((current) => ({ ...current, error: error.message }));
        }
        return;
      }
      try {
        const workspace = workspaceFromApiProjects(await projectService.list());
        setProjectWorkspaceState({ workspace, error: '' });
      } catch (error) {
        setProjectWorkspaceState((current) => ({ ...current, error: error.message || 'Projects could not be loaded from the API.' }));
      } finally {
        setProjectsLoading(false);
      }
    };
    window.addEventListener(PROJECT_WORKSPACE_UPDATED_EVENT, refreshProjectWorkspace);
    window.addEventListener('storage', refreshProjectWorkspace);
    if (dataMode === 'php') refreshProjectWorkspace();
    return () => {
      window.removeEventListener(PROJECT_WORKSPACE_UPDATED_EVENT, refreshProjectWorkspace);
      window.removeEventListener('storage', refreshProjectWorkspace);
    };
  }, []);

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
            projects={projectWorkspace.projects}
            activeProjectId={projectWorkspace.activeProjectId}
            onProjectChange={(activeProjectId) => updateProjectWorkspace({
              ...projectWorkspace,
              activeProjectId,
            })}
          />
          {themeStorageError && <div className="theme-storage-error" role="alert">{themeStorageError}</div>}
          {projectStorageError && <div className="theme-storage-error" role="alert">{projectStorageError}</div>}
          {activityStorageError && <div className="theme-storage-error" role="alert">{activityStorageError}</div>}
          
          <div 
            className="page-container" 
            style={{ 
              flex: 1, 
              background: 'transparent', // Allows global background image to show through
              overflowY: 'auto' 
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard activeProject={activeProject} projects={projectWorkspace.projects} />} />
              <Route
                path="/projects"
                element={(
                  <Projects
                    projects={projectWorkspace.projects}
                    activeProjectId={projectWorkspace.activeProjectId}
                    onWorkspaceChange={updateProjectWorkspace}
                    projectsLoading={projectsLoading}
                  />
                )}
              />
              <Route
                path="/projects/:projectId"
                element={<ProjectWorkspace projects={projectWorkspace.projects} />}
              />
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
