import { dataMode, endpointPaths, requestJson } from './api';
import { mockStore } from '../mocks/mockStore';

const mockWorkspaceStorageKey = 'carbonexa-mock:projects';
const activeProjectStorageKey = 'carbonexa-active-project-id';
const projectResources = ['geology', 'gis', 'documents', 'production', 'environmental', 'safety', 'finance', 'tasks', 'milestones', 'team'];

const clearMockProjectResources = (projectId) => {
  projectResources.forEach((resource) => mockStore.clear(`${projectId}:${resource}`));
};

const migrateLegacyProjects = () => {
  try {
    const savedWorkspace = localStorage.getItem('carbonexa-project-workspace');
    if (!savedWorkspace) return { projects: [], activeProjectId: '' };
    const workspace = JSON.parse(savedWorkspace);
    if (!workspace || !Array.isArray(workspace.projects) || typeof workspace.activeProjectId !== 'string') {
      throw new Error('Saved project workspace has an invalid format.');
    }
    return {
      projects: workspace.projects.map((project, index) => ({
        ...project,
        projectId: project.projectId || `CNX-${String(index + 1).padStart(5, '0')}`,
        status: project.status || 'Planning',
        projectType: project.projectType || 'Greenfield',
        mineType: project.mineType || 'Opencast',
        coalfield: project.coalfield || '',
        miningBlock: project.miningBlock || '',
        latitude: project.latitude ?? '',
        longitude: project.longitude ?? '',
        leaseAreaHa: project.leaseAreaHa ?? '',
        geologicalReservesMt: project.geologicalReservesMt ?? '',
        miningMethod: project.miningMethod || '',
        projectManager: project.projectManager || '',
        productionTarget: project.productionTarget ?? '',
        estimatedCost: project.estimatedCost ?? '',
        startDate: project.startDate || '',
        expectedCompletionDate: project.expectedCompletionDate || '',
        archived: Boolean(project.archived),
        createdAt: project.createdAt || project.updatedAt || new Date().toISOString(),
        updatedAt: project.updatedAt || project.createdAt || new Date().toISOString(),
      })),
      activeProjectId: workspace.activeProjectId,
    };
  } catch {
    throw new Error('Could not migrate project profiles saved by the previous workspace version.');
  }
};

const readMockProjects = () => {
  try {
    const savedProjects = localStorage.getItem(mockWorkspaceStorageKey);
    if (!savedProjects) {
      const workspace = migrateLegacyProjects();
      localStorage.setItem(mockWorkspaceStorageKey, JSON.stringify(workspace));
      return workspace;
    }
    const workspace = JSON.parse(savedProjects);
    if (!workspace || !Array.isArray(workspace.projects) || typeof workspace.activeProjectId !== 'string') {
      throw new Error('Saved mock project data has an invalid format.');
    }
    return {
      projects: workspace.projects.map((project, index) => ({
        ...project,
        projectId: project.projectId || `CNX-${String(index + 1).padStart(5, '0')}`,
        status: project.status || 'Planning',
        projectType: project.projectType || 'Greenfield',
        mineType: project.mineType || 'Opencast',
        coalfield: project.coalfield || '',
        miningBlock: project.miningBlock || '',
        latitude: project.latitude ?? '',
        longitude: project.longitude ?? '',
        leaseAreaHa: project.leaseAreaHa ?? '',
        geologicalReservesMt: project.geologicalReservesMt ?? '',
        miningMethod: project.miningMethod || '',
        projectManager: project.projectManager || '',
        productionTarget: project.productionTarget ?? '',
        estimatedCost: project.estimatedCost ?? '',
        startDate: project.startDate || '',
        expectedCompletionDate: project.expectedCompletionDate || '',
        archived: Boolean(project.archived),
        createdAt: project.createdAt || project.updatedAt || new Date().toISOString(),
        updatedAt: project.updatedAt || project.createdAt || new Date().toISOString(),
      })),
      activeProjectId: workspace.activeProjectId,
    };
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error('Saved mock project data is not valid JSON.', { cause: error });
    throw error;
  }
};

const writeMockProjects = (workspace) => {
  localStorage.setItem(mockWorkspaceStorageKey, JSON.stringify(workspace));
  localStorage.setItem('carbonexa-project-workspace', JSON.stringify(workspace));
};

export const projectService = {
  loadWorkspace() {
    return readMockProjects();
  },
  async saveWorkspace(workspace) {
    if (dataMode === 'mock') {
      const currentWorkspace = readMockProjects();
      const nextProjectIds = new Set(workspace.projects.map((project) => project.id));
      currentWorkspace.projects
        .filter((project) => !nextProjectIds.has(project.id))
        .forEach((project) => clearMockProjectResources(project.id));
      writeMockProjects(workspace);
      return workspace;
    }

    const currentProjects = await this.list();
    const nextProjects = [];
    for (const project of workspace.projects) {
      const current = currentProjects.find((item) => item.id === project.id);
      if (!current) {
        nextProjects.push(await this.create(project));
      } else if (Boolean(current.archived) !== Boolean(project.archived)) {
        nextProjects.push(await this.archive(project.id, Boolean(project.archived)));
      } else if (JSON.stringify(current) !== JSON.stringify(project)) {
        nextProjects.push(await this.update(project.id, project));
      } else {
        nextProjects.push(current);
      }
    }
    const desiredIds = new Set(workspace.projects.map((project) => project.id));
    for (const project of currentProjects) {
      if (!desiredIds.has(project.id)) await this.remove(project.id);
    }
    const activeProjectId = nextProjects.some((project) => project.id === workspace.activeProjectId && !project.archived)
      ? workspace.activeProjectId
      : (nextProjects.find((project) => !project.archived)?.id || '');
    if (activeProjectId) localStorage.setItem(activeProjectStorageKey, activeProjectId);
    else localStorage.removeItem(activeProjectStorageKey);
    return { projects: nextProjects, activeProjectId };
  },
  async list({ signal } = {}) {
    if (dataMode === 'mock') return readMockProjects().projects;
    const payload = await requestJson(endpointPaths.projects, { signal });
    if (!Array.isArray(payload?.data)) throw new Error('The projects API response must contain a data array.');
    return payload.data;
  },
  async create(project) {
    if (dataMode === 'mock') {
      const workspace = readMockProjects();
      const createdProject = {
        ...project,
        id: project.id || globalThis.crypto?.randomUUID?.() || `project-${Date.now()}`,
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const nextWorkspace = {
        projects: [...workspace.projects.filter((item) => item.id !== createdProject.id), createdProject],
        activeProjectId: workspace.activeProjectId || createdProject.id,
      };
      writeMockProjects(nextWorkspace);
      return createdProject;
    }
    const payload = await requestJson(endpointPaths.projects, {
      method: 'POST',
      body: JSON.stringify(project),
    });
    if (!payload?.data) throw new Error('The projects API response must contain the created project.');
    return payload.data;
  },
  async update(projectId, changes) {
    if (dataMode === 'mock') {
      const workspace = readMockProjects();
      const existingProject = workspace.projects.find((item) => item.id === projectId);
      if (!existingProject) throw new Error('The project could not be found in mock storage.');
      const updatedProject = { ...existingProject, ...changes, updatedAt: new Date().toISOString() };
      writeMockProjects({
        ...workspace,
        projects: workspace.projects.map((item) => item.id === projectId ? updatedProject : item),
      });
      return updatedProject;
    }
    const payload = await requestJson(`${endpointPaths.projects}/${encodeURIComponent(projectId)}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
    });
    if (!payload?.data) throw new Error('The projects API response must contain the updated project.');
    return payload.data;
  },
  async archive(projectId, archived = true) {
    if (dataMode === 'mock') {
      const workspace = readMockProjects();
      const existingProject = workspace.projects.find((item) => item.id === projectId);
      if (!existingProject) throw new Error('The project could not be found in mock storage.');
      const updatedProject = { ...existingProject, archived, updatedAt: new Date().toISOString() };
      writeMockProjects({
        ...workspace,
        projects: workspace.projects.map((item) => item.id === projectId ? updatedProject : item),
        activeProjectId: archived && workspace.activeProjectId === projectId ? '' : workspace.activeProjectId,
      });
      return updatedProject;
    }
    const payload = await requestJson(`${endpointPaths.projects}/${encodeURIComponent(projectId)}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ archived }),
    });
    if (!payload?.data) throw new Error('The projects API response must contain the updated project.');
    return payload.data;
  },
  async remove(projectId) {
    if (dataMode === 'mock') {
      const workspace = readMockProjects();
      if (!workspace.projects.some((item) => item.id === projectId)) {
        throw new Error('The project could not be found in mock storage.');
      }
      clearMockProjectResources(projectId);
      writeMockProjects({
        ...workspace,
        projects: workspace.projects.filter((item) => item.id !== projectId),
        activeProjectId: workspace.activeProjectId === projectId ? '' : workspace.activeProjectId,
      });
      return;
    }
    await requestJson(`${endpointPaths.projects}/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
  },
};
