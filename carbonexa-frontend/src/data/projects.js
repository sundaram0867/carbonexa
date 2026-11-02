export const PROJECT_WORKSPACE_STORAGE_KEY = 'carbonexa-project-workspace';
export const PROJECT_WORKSPACE_UPDATED_EVENT = 'carbonexa-project-workspace-updated';

export const emptyProjectWorkspace = {
  projects: [],
  activeProjectId: '',
};

const isProject = (project) => (
  project
  && typeof project === 'object'
  && typeof project.id === 'string'
  && typeof project.name === 'string'
  && typeof project.site === 'string'
  && typeof project.commodity === 'string'
  && typeof project.region === 'string'
  && typeof project.operator === 'string'
  && typeof project.status === 'string'
  && typeof project.productionTarget === 'string'
  && typeof project.description === 'string'
);

export function loadProjectWorkspace() {
  try {
    const savedWorkspace = localStorage.getItem(PROJECT_WORKSPACE_STORAGE_KEY);
    if (!savedWorkspace) return { workspace: emptyProjectWorkspace, error: '' };

    const workspace = JSON.parse(savedWorkspace);
    if (
      !workspace
      || typeof workspace !== 'object'
      || !Array.isArray(workspace.projects)
      || !workspace.projects.every(isProject)
      || typeof workspace.activeProjectId !== 'string'
      || (workspace.activeProjectId && !workspace.projects.some((project) => project.id === workspace.activeProjectId))
    ) {
      throw new Error('Saved project workspace has an invalid format.');
    }

    return { workspace, error: '' };
  } catch {
    return {
      workspace: emptyProjectWorkspace,
      error: 'Project information could not be loaded from this browser. Check browser storage, then refresh the page.',
    };
  }
}

export function saveProjectWorkspace(workspace) {
  localStorage.setItem(PROJECT_WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
}
