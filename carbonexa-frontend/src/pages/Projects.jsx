import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Factory,
  Grid2X2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Table2,
  Target,
  Trash2,
  Upload,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { parseCsv, parseXlsx, toProjectCsv } from '../utils/projectCsv';
import { dataMode } from '../config/api';
import './Projects.css';

const emptyDraft = {
  name: '',
  site: '',
  commodity: '',
  region: '',
  operator: '',
  projectManager: '',
  status: 'Planning',
  projectType: 'Greenfield',
  mineType: 'Opencast',
  coalfield: '',
  miningBlock: '',
  latitude: '',
  longitude: '',
  leaseAreaHa: '',
  geologicalReservesMt: '',
  miningMethod: '',
  productionTarget: '',
  estimatedCost: '',
  startDate: '',
  expectedCompletionDate: '',
  description: '',
};

const projectStatuses = ['Planning', 'Under Development', 'Operating', 'Monitoring', 'Delayed', 'Completed', 'Maintenance', 'On Hold', 'Closed'];
const projectTypes = ['Greenfield', 'Brownfield', 'Expansion'];
const mineTypes = ['Opencast', 'Underground', 'Mixed'];
const commodityOptions = ['Coal', 'Iron Ore', 'Limestone', 'Bauxite', 'Copper', 'Manganese', 'Other'];
const coalfieldsByCommodity = {
  Coal: ['Jharia Coalfield', 'Bokaro Coalfield', 'North Karanpura Coalfield', 'South Karanpura Coalfield', 'Talcher Coalfield', 'Ib Valley Coalfield', 'Other'],
  'Iron Ore': ['Bailadila Mineral Belt', 'Singhbhum Mineral Belt', 'Odisha Iron Ore Belt', 'Other'],
  Limestone: ['Satna Limestone Belt', 'Chhattisgarh Limestone Belt', 'Other'],
  default: ['Other'],
};
const blocksByCoalfield = {
  'Jharia Coalfield': ['Jharia Block I', 'Jharia Block II', 'Jharia Block III', 'Other'],
  'Bokaro Coalfield': ['Bokaro Block', 'Kargali Block', 'Other'],
  'North Karanpura Coalfield': ['North Karanpura Block', 'Other'],
  'Talcher Coalfield': ['Talcher Block', 'Other'],
  'Ib Valley Coalfield': ['Ib Valley Block', 'Other'],
};
const pageSize = 6;
const hasValue = (value) => value !== '' && value !== null && value !== undefined;

const nextProjectId = (projects, reservedIds = new Set()) => {
  const year = new Date().getFullYear();
  const currentSequence = projects.reduce((maximum, project) => {
    const match = project.projectId?.match(/^CNX-\d{4}-(\d+)$/);
    return match ? Math.max(maximum, Number(match[1])) : maximum;
  }, 0);
  let nextSequence = currentSequence + 1;
  let projectId = `CNX-${year}-${String(nextSequence).padStart(4, '0')}`;
  while (reservedIds.has(projectId.toLowerCase())) {
    nextSequence += 1;
    projectId = `CNX-${year}-${String(nextSequence).padStart(4, '0')}`;
  }
  return projectId;
};

const createProjectRecordId = () => globalThis.crypto?.randomUUID?.() || `project-${Date.now()}`;

const isValidProject = (project) => {
  const numericFields = ['latitude', 'longitude', 'leaseAreaHa', 'geologicalReservesMt', 'productionTarget', 'estimatedCost'];
  if (numericFields.some((field) => project[field] !== '' && !Number.isFinite(Number(project[field])))) {
    return 'Enter valid numbers for coordinates, area, reserves, target, and cost.';
  }
  if (['leaseAreaHa', 'geologicalReservesMt', 'productionTarget', 'estimatedCost'].some((field) => project[field] !== '' && Number(project[field]) < 0)) {
    return 'Area, reserves, production target, and cost cannot be negative.';
  }
  if (project.latitude !== '' && (Number(project.latitude) < -90 || Number(project.latitude) > 90)) {
    return 'Latitude must be between -90 and 90.';
  }
  if (project.longitude !== '' && (Number(project.longitude) < -180 || Number(project.longitude) > 180)) {
    return 'Longitude must be between -180 and 180.';
  }
  const validDate = (date) => {
    if (!date) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
  };
  if (!validDate(project.startDate) || !validDate(project.expectedCompletionDate)) {
    return 'Enter project dates in YYYY-MM-DD format.';
  }
  if (project.startDate && project.expectedCompletionDate && project.expectedCompletionDate < project.startDate) {
    return 'Expected completion date must be on or after the project start date.';
  }
  return '';
};

const getProjectStatus = (project) => {
  if (project.status === 'Completed' || project.status === 'Closed') return 'completed';
  if (project.status === 'Delayed') return 'delayed';
  if (['Planning', 'Under Development'].includes(project.status)) return 'development';
  return 'active';
};

const createImportedProject = (project, index, projects, reservedIds) => ({
  ...emptyDraft,
  ...project,
  id: globalThis.crypto?.randomUUID?.() || `project-${Date.now()}-${index}`,
  projectId: project.projectId?.trim() || nextProjectId(projects, reservedIds),
  name: String(project.name || '').trim(),
  status: project.status || emptyDraft.status,
  archived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const formatDate = (date) => {
  if (!date) return 'Not updated yet';
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? 'Not updated yet'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parsedDate);
};

function ProjectDetailsDialog({ project, onClose }) {
  const closeButtonRef = useRef(null);
  useEffect(() => {
    if (!project) return undefined;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, project]);
  if (!project) return null;
  const fields = [
    ['Project ID', project.projectId],
    ['Project type', project.projectType],
    ['Mine type', project.mineType],
    ['Commodity', project.commodity],
    ['Coalfield / mineral belt', project.coalfield],
    ['Mining block', project.miningBlock],
    ['Mine location', project.site],
    ['Latitude / longitude', [project.latitude, project.longitude].filter(hasValue).join(', ')],
    ['Lease area', hasValue(project.leaseAreaHa) ? `${project.leaseAreaHa} ha` : ''],
    ['Geological reserves', hasValue(project.geologicalReservesMt) ? `${project.geologicalReservesMt} MT` : ''],
    ['Mining method', project.miningMethod],
    ['Operating company', project.operator],
    ['Project manager', project.projectManager],
    ['Project status', project.status],
    ['Annual production target', hasValue(project.productionTarget) ? `${project.productionTarget} MT` : ''],
    ['Estimated cost', hasValue(project.estimatedCost) ? `₹${project.estimatedCost} crore` : ''],
    ['Start date', project.startDate],
    ['Expected completion', project.expectedCompletionDate],
  ];

  return (
    <div className="project-dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="project-details-dialog" role="dialog" aria-modal="true" aria-labelledby="project-details-heading">
        <div className="project-dialog-heading">
          <div><span className="project-panel-eyebrow">PROJECT PROFILE · {project.projectId}</span><h2 id="project-details-heading">{project.name}</h2></div>
          <button ref={closeButtonRef} type="button" className="project-dialog-close" aria-label="Close project details" onClick={onClose}>×</button>
        </div>
        <dl className="project-detail-grid">
          {fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{hasValue(value) ? value : 'Not provided'}</dd></div>)}
          <div className="project-detail-description"><dt>Project description</dt><dd>{project.description || 'No project description has been added.'}</dd></div>
        </dl>
        <div className="project-dialog-actions">
          <Link className="project-primary-button" to={`/projects/${encodeURIComponent(project.id)}`} onClick={onClose}>Open project workspace <ChevronRight size={15} /></Link>
          <Link className="project-secondary-button" to="/projects" state={{ editProjectId: project.id }} onClick={onClose}><Pencil size={14} /> Edit profile</Link>
          <button type="button" className="project-secondary-button" onClick={onClose}>Close</button>
        </div>
      </section>
    </div>
  );
}

function Projects({ projects, activeProjectId, onWorkspaceChange, projectsLoading = false }) {
  const location = useLocation();
  const requestedEditProject = projects.find((project) => project.id === location.state?.editProjectId);
  const [draft, setDraft] = useState(() => requestedEditProject ? { ...emptyDraft, ...requestedEditProject } : emptyDraft);
  const [editingProjectId, setEditingProjectId] = useState(() => requestedEditProject?.id || '');
  const [savedMessage, setSavedMessage] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');
  const [mineTypeFilter, setMineTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [archiveFilter, setArchiveFilter] = useState('active');
  const [sortBy, setSortBy] = useState('updated');
  const [directoryView, setDirectoryView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [importMessage, setImportMessage] = useState('');
  const importInputRef = useRef(null);
  const [detailsProject, setDetailsProject] = useState(null);
  const projectFormRef = useRef(null);
  const projectNameRef = useRef(null);
  const activeProject = projects.find((project) => project.id === activeProjectId);
  const liveProjects = projects.filter((project) => !project.archived);
  const operatingCount = liveProjects.filter((project) => getProjectStatus(project) === 'active').length;
  const developmentCount = liveProjects.filter((project) => getProjectStatus(project) === 'development').length;
  const completedCount = liveProjects.filter((project) => getProjectStatus(project) === 'completed').length;
  const delayedCount = liveProjects.filter((project) => getProjectStatus(project) === 'delayed').length;
  const totalTargets = liveProjects.reduce((total, project) => total + (Number(project.productionTarget) || 0), 0);
  const totalCost = liveProjects.reduce((total, project) => total + (Number(project.estimatedCost) || 0), 0);
  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesQuery = !query || [
        project.name,
        project.projectId,
        project.site,
        project.commodity,
        project.region,
        project.operator,
        project.miningBlock,
      ].some((value) => value?.toLowerCase().includes(query));
      const matchesCompany = !companyFilter || project.operator === companyFilter;
      const matchesCommodity = !commodityFilter || project.commodity === commodityFilter;
      const matchesMineType = !mineTypeFilter || project.mineType === mineTypeFilter;
      const matchesStatus = !statusFilter || project.status === statusFilter;
      const matchesArchive = archiveFilter === 'all'
        || (archiveFilter === 'archived' ? project.archived : !project.archived);
      return matchesQuery && matchesCompany && matchesCommodity && matchesMineType && matchesStatus && matchesArchive;
    }).sort((first, second) => {
      if (sortBy === 'name') return first.name.localeCompare(second.name);
      if (sortBy === 'target') return Number(second.productionTarget || 0) - Number(first.productionTarget || 0);
      return (Date.parse(second.updatedAt || '') || 0) - (Date.parse(first.updatedAt || '') || 0);
    });
  }, [archiveFilter, companyFilter, commodityFilter, mineTypeFilter, projectSearch, projects, sortBy, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const displayPage = Math.min(currentPage, pageCount);
  const paginatedProjects = filteredProjects.slice((displayPage - 1) * pageSize, displayPage * pageSize);

  const focusProjectForm = () => {
    projectFormRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    });
    window.setTimeout(() => projectNameRef.current?.focus(), 150);
  };

  useEffect(() => {
    if (!requestedEditProject) return;
    projectFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    projectNameRef.current?.focus();
  }, [requestedEditProject]);

  const startNewProject = (focusForm = true) => {
    setDraft(emptyDraft);
    setEditingProjectId('');
    setSavedMessage('');
    if (focusForm) focusProjectForm();
  };

  useEffect(() => {
    if (new URLSearchParams(location.search).get('action') !== 'create') return;
    const timer = window.setTimeout(() => {
      setDraft(emptyDraft);
      setEditingProjectId('');
      setSavedMessage('');
      projectFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => projectNameRef.current?.focus(), 150);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [location.search]);

  const editProject = (project) => {
    setDraft({
      ...emptyDraft,
      name: project.name,
      site: project.site,
      commodity: project.commodity,
      region: project.region,
      operator: project.operator,
      projectManager: project.projectManager || '',
      status: project.status,
      projectType: project.projectType || emptyDraft.projectType,
      mineType: project.mineType || emptyDraft.mineType,
      coalfield: project.coalfield || '',
      miningBlock: project.miningBlock || '',
      latitude: project.latitude ?? '',
      longitude: project.longitude ?? '',
      leaseAreaHa: project.leaseAreaHa ?? '',
      geologicalReservesMt: project.geologicalReservesMt ?? '',
      miningMethod: project.miningMethod || '',
      productionTarget: project.productionTarget ?? '',
      estimatedCost: project.estimatedCost ?? '',
      startDate: project.startDate || '',
      expectedCompletionDate: project.expectedCompletionDate || '',
      description: project.description || '',
    });
    setEditingProjectId(project.id);
    setSavedMessage('');
    focusProjectForm();
  };

  const submitProject = async (event) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setSavedMessage('Enter a project name before saving.');
      return;
    }
    const validationMessage = isValidProject(draft);
    if (validationMessage) {
      setSavedMessage(validationMessage);
      return;
    }

    const wasEditing = Boolean(editingProjectId);
    const now = new Date().toISOString();
    const project = {
      ...draft,
      projectId: editingProjectId
        ? projects.find((item) => item.id === editingProjectId)?.projectId || nextProjectId(projects)
        : nextProjectId(projects),
      name: draft.name.trim(),
      site: draft.site.trim(),
      commodity: draft.commodity.trim(),
      region: draft.region.trim(),
      operator: draft.operator.trim(),
      projectManager: draft.projectManager.trim(),
      coalfield: draft.coalfield.trim(),
      miningBlock: draft.miningBlock.trim(),
      miningMethod: draft.miningMethod.trim(),
      latitude: draft.latitude === '' ? '' : Number(draft.latitude),
      longitude: draft.longitude === '' ? '' : Number(draft.longitude),
      leaseAreaHa: draft.leaseAreaHa === '' ? '' : Number(draft.leaseAreaHa),
      geologicalReservesMt: draft.geologicalReservesMt === '' ? '' : Number(draft.geologicalReservesMt),
      productionTarget: draft.productionTarget.trim(),
      estimatedCost: draft.estimatedCost.trim(),
      description: draft.description.trim(),
      updatedAt: now,
      createdAt: editingProjectId
        ? projects.find((item) => item.id === editingProjectId)?.createdAt || now
        : now,
      archived: editingProjectId
        ? Boolean(projects.find((item) => item.id === editingProjectId)?.archived)
        : false,
      id: editingProjectId || createProjectRecordId(),
    };
    const nextProjects = editingProjectId
      ? projects.map((savedProject) => savedProject.id === editingProjectId ? project : savedProject)
      : [...projects, project];
    const nextWorkspace = {
      projects: nextProjects,
      activeProjectId: editingProjectId ? activeProjectId : project.id,
    };

    if (!await onWorkspaceChange(nextWorkspace)) return;
    startNewProject(false);
    setSavedMessage(wasEditing ? 'Project details updated.' : 'Project created and set as active.');
  };

  const setActiveProject = async (projectId) => {
    if (projectId === activeProjectId) return;
    if (await onWorkspaceChange({ projects, activeProjectId: projectId })) {
      setSavedMessage('Active workspace project updated.');
    }
  };

  const toggleArchiveProject = async (project) => {
    const archived = !project.archived;
    if (archived && !window.confirm(`Archive "${project.name}"? You can restore it later.`)) return;
    const nextProjects = projects.map((item) => item.id === project.id
      ? { ...item, archived, updatedAt: new Date().toISOString() }
      : item);
    const nextActiveProjectId = archived && activeProjectId === project.id
      ? (nextProjects.find((item) => !item.archived)?.id || '')
      : (!archived && !activeProjectId ? project.id : activeProjectId);
    if (!await onWorkspaceChange({ projects: nextProjects, activeProjectId: nextActiveProjectId })) return;
    setSavedMessage(archived ? `${project.name} archived.` : `${project.name} restored.`);
  };

  const deleteProject = async (project) => {
    if (!window.confirm(`Delete "${project.name}" and its project records? This cannot be undone.`)) return;
    const nextProjects = projects.filter((savedProject) => savedProject.id !== project.id);
    const nextWorkspace = {
      projects: nextProjects,
      activeProjectId: activeProjectId === project.id ? (nextProjects.find((item) => !item.archived)?.id || '') : activeProjectId,
    };

    if (!await onWorkspaceChange(nextWorkspace)) return;
    if (editingProjectId === project.id) startNewProject();
    setSavedMessage('Project deleted from this browser.');
  };

  const exportProjects = () => {
    const csv = toProjectCsv(filteredProjects);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'carbonexa-projects.csv';
    link.click();
    URL.revokeObjectURL(url);
    setSavedMessage(`${filteredProjects.length} project${filteredProjects.length === 1 ? '' : 's'} exported.`);
  };

  const importProjects = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImportMessage('');
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Import files up to 10 MB.');
      const importedRecords = file.name.toLowerCase().endsWith('.xlsx')
        ? await parseXlsx(file)
        : file.name.toLowerCase().endsWith('.csv')
          ? parseCsv(await file.text())
          : (() => { throw new Error('Choose a .csv or .xlsx file.'); })();
      const existingIds = new Set(projects.map((project) => project.projectId?.toLowerCase()).filter(Boolean));
      const reservedIds = new Set([
        ...existingIds,
        ...importedRecords.map((project) => project.projectId?.trim().toLowerCase()).filter(Boolean),
      ]);
      const validProjects = [];
      importedRecords.forEach((project, index) => {
        const imported = createImportedProject(project, index, [...projects, ...validProjects], reservedIds);
        if (!imported.name) throw new Error(`Row ${index + 2} is missing a project name.`);
        const validationMessage = isValidProject(imported);
        if (validationMessage) throw new Error(`Row ${index + 2}: ${validationMessage}`);
        if (existingIds.has(imported.projectId.toLowerCase())) {
          throw new Error(`Project ID "${imported.projectId}" already exists. Remove it from the file or leave the ID blank to generate one.`);
        }
        existingIds.add(imported.projectId.toLowerCase());
        reservedIds.add(imported.projectId.toLowerCase());
        validProjects.push(imported);
      });
      if (!validProjects.length) throw new Error('No projects were found in the selected file.');
      const nextProjects = [...projects, ...validProjects];
      if (!await onWorkspaceChange({
        projects: nextProjects,
        activeProjectId: projects.some((project) => project.id === activeProjectId && !project.archived)
          ? activeProjectId
          : validProjects[0].id,
      })) {
        throw new Error('Could not save imported projects. Check available browser storage.');
      }
      setImportMessage(`${validProjects.length} project${validProjects.length === 1 ? '' : 's'} imported successfully.`);
      setSavedMessage('');
    } catch (error) {
      setImportMessage(error.message || 'The selected file could not be imported.');
    }
  };

  const setDirectoryFilter = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  return (
    <main className="workspace-page project-management-page">
      <header className="project-page-heading">
        <div>
          <span className="project-page-eyebrow"><BriefcaseBusiness size={15} /> WORKSPACE MANAGEMENT</span>
          <h1>Your projects, in one place.</h1>
          <p>Set up project profiles, switch your active workspace, and keep site details easy to find.</p>
        </div>
        <button type="button" className="project-primary-button" onClick={startNewProject}>
          <Plus size={16} /> New project
        </button>
      </header>

      <section className="project-overview" aria-label="Project workspace summary">
        <article className="project-overview-card">
          <span className="project-overview-icon"><BriefcaseBusiness size={17} /></span>
          <div><span>Total projects</span><strong>{liveProjects.length}</strong></div>
          <small>Excludes archived</small>
        </article>
        <article className="project-overview-card">
          <span className="project-overview-icon operating"><Activity size={17} /></span>
          <div><span>Active</span><strong>{operatingCount}</strong></div>
          <small>Operating or monitoring</small>
        </article>
        <article className="project-overview-card">
          <span className="project-overview-icon target"><Factory size={17} /></span>
          <div><span>Under development</span><strong>{developmentCount}</strong></div>
          <small>Planning or development</small>
        </article>
        <article className="project-overview-card project-overview-active">
          <span className="project-overview-icon active"><Check size={17} /></span>
          <div><span>Completed</span><strong>{completedCount}</strong></div>
          <small>Completed or closed</small>
        </article>
        <article className="project-overview-card">
          <span className="project-overview-icon delayed"><Activity size={17} /></span>
          <div><span>Delayed</span><strong>{delayedCount}</strong></div>
          <small>Marked as delayed</small>
        </article>
        <article className="project-overview-card">
          <span className="project-overview-icon target"><Target size={17} /></span>
          <div><span>Combined target</span><strong>{totalTargets ? new Intl.NumberFormat().format(totalTargets) : '—'}</strong></div>
          <small>Annual target · MT</small>
        </article>
        <article className="project-overview-card">
          <span className="project-overview-icon cost"><Factory size={17} /></span>
          <div><span>Estimated cost (₹ crore)</span><strong>{totalCost ? new Intl.NumberFormat().format(totalCost) : '—'}</strong></div>
          <small>Combined project estimate</small>
        </article>
        <article className="project-overview-card project-overview-active">
          <span className="project-overview-icon active"><BriefcaseBusiness size={17} /></span>
          <div><span>Active workspace</span><strong title={activeProject?.name || 'Not set'}>{activeProject?.name || 'Not set'}</strong></div>
          <small>{activeProject ? 'Shown in your dashboard context' : 'Create a project to get started'}</small>
        </article>
      </section>

      <div className="project-storage-notice" role="note">
        <span className="project-storage-notice-icon"><BriefcaseBusiness size={15} /></span>
        <span><strong>{dataMode === 'mock' ? 'Saved on this device' : 'Using the configured PHP API'}</strong><small>{dataMode === 'mock' ? 'These profiles are not shared across browsers or team members yet.' : 'Project profile changes are sent to the configured backend. Verify authentication and permissions before production use.'}</small></span>
      </div>

      {savedMessage && <p className="project-save-message" role="status">{savedMessage}</p>}

      <div className="project-management-grid">
        <section className="project-list-panel" aria-labelledby="project-list-heading">
          <div className="project-panel-heading">
            <div>
              <span className="project-panel-eyebrow">PROJECT DIRECTORY</span>
              <h2 id="project-list-heading">Project directory <span>{filteredProjects.length}</span></h2>
            </div>
            {projects.length > 0 && <span className="project-active-indicator"><i /> {projects.find((project) => project.id === activeProjectId)?.name || 'Choose a project'}</span>}
          </div>

          <div className="project-directory-toolbar">
            <label className="project-search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                aria-label="Search projects"
                placeholder="Search project name, ID, site..."
                value={projectSearch}
                onChange={(event) => {
                  setProjectSearch(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </label>
            <div className="project-directory-actions">
              <button type="button" className="project-secondary-button" onClick={exportProjects} disabled={!filteredProjects.length}>
                <Download size={14} /> Export
              </button>
              <button type="button" className="project-secondary-button" onClick={() => importInputRef.current?.click()}>
                <Upload size={14} /> Import
              </button>
              <input
                ref={importInputRef}
                className="project-import-input"
                type="file"
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                aria-label="Import project CSV or Excel file"
                onChange={importProjects}
              />
            </div>
          </div>
          <p className="project-import-hint">Import .csv or .xlsx (first worksheet, up to 10 MB). Use the exported CSV template for column names.</p>
          {importMessage && <p className={`project-import-message${importMessage.includes('successfully') ? ' is-success' : ''}`} role={importMessage.includes('successfully') ? 'status' : 'alert'}>{importMessage}</p>}

          <div className="project-directory-filters">
            <label><span>Company</span><select aria-label="Filter by company" value={companyFilter} onChange={setDirectoryFilter(setCompanyFilter)}><option value="">All companies</option>{[...new Set(projects.map((project) => project.operator).filter(Boolean))].sort().map((operator) => <option key={operator}>{operator}</option>)}</select></label>
            <label><span>Commodity</span><select aria-label="Filter by commodity" value={commodityFilter} onChange={setDirectoryFilter(setCommodityFilter)}><option value="">All commodities</option>{[...new Set(projects.map((project) => project.commodity).filter(Boolean))].sort().map((commodity) => <option key={commodity}>{commodity}</option>)}</select></label>
            <label><span>Mine type</span><select aria-label="Filter by mine type" value={mineTypeFilter} onChange={setDirectoryFilter(setMineTypeFilter)}><option value="">All mine types</option>{mineTypes.map((mineType) => <option key={mineType}>{mineType}</option>)}</select></label>
            <label><span>Status</span><select aria-label="Filter by status" value={statusFilter} onChange={setDirectoryFilter(setStatusFilter)}><option value="">All statuses</option>{projectStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label><span>Directory</span><select aria-label="Show active or archived projects" value={archiveFilter} onChange={setDirectoryFilter(setArchiveFilter)}><option value="active">Active projects</option><option value="archived">Archived</option><option value="all">All projects</option></select></label>
            <label><span>Sort by</span><select aria-label="Sort projects" value={sortBy} onChange={setDirectoryFilter(setSortBy)}><option value="updated">Recently updated</option><option value="name">Project name</option><option value="target">Production target</option></select></label>
          </div>
          <div className="project-directory-viewbar">
            <span>Showing {filteredProjects.length ? (displayPage - 1) * pageSize + 1 : 0}–{Math.min(displayPage * pageSize, filteredProjects.length)} of {filteredProjects.length}</span>
            <div role="group" aria-label="Project directory view">
              <button type="button" aria-label="Grid view" aria-pressed={directoryView === 'grid'} className={directoryView === 'grid' ? 'is-selected' : ''} onClick={() => setDirectoryView('grid')}><Grid2X2 size={15} /></button>
              <button type="button" aria-label="Table view" aria-pressed={directoryView === 'table'} className={directoryView === 'table' ? 'is-selected' : ''} onClick={() => setDirectoryView('table')}><Table2 size={15} /></button>
            </div>
          </div>

          {projectsLoading ? (
            <div className="project-search-empty" role="status"><strong>Loading project directory…</strong></div>
          ) : projects.length ? (
            filteredProjects.length ? (
              directoryView === 'grid' ? <div className="project-card-list">
              {paginatedProjects.map((project) => {
                const isActive = project.id === activeProjectId;
                return (
                  <article className={`project-card${isActive ? ' is-active' : ''}${project.archived ? ' is-archived' : ''}`} key={project.id}>
                    <div className="project-card-heading">
                      <div className="project-card-icon"><BriefcaseBusiness size={18} /></div>
                      <div className="project-card-title">
                        <div className="project-card-title-row">
                          <h3>{project.name}</h3>
                          {isActive && <span className="project-active-tag"><Check size={12} /> Active</span>}
                        </div>
                        <p><MapPin size={13} /> {[project.site, project.region].filter(Boolean).join(' · ') || 'Site details not provided'}</p>
                        <span className="project-card-id">{project.projectId}</span>
                      </div>
                      <span className={`project-status status-${project.status.toLowerCase()}`}>{project.status}</span>
                    </div>
                    {project.description && <p className="project-card-description">{project.description}</p>}
                    <dl className="project-card-details">
                      <div><dt>Mine type</dt><dd>{project.mineType || 'Not specified'}</dd></div>
                      <div><dt>Commodity</dt><dd>{project.commodity || 'Not specified'}</dd></div>
                      <div><dt>Operator</dt><dd>{project.operator || 'Not specified'}</dd></div>
                      <div><dt>Production target</dt><dd>{hasValue(project.productionTarget) ? `${project.productionTarget} MT` : 'Not set'}</dd></div>
                    </dl>
                    <div className="project-card-actions">
                      <button type="button" className="project-text-button" onClick={() => setDetailsProject(project)}><Eye size={14} /> View</button>
                      {!isActive && !project.archived && <button type="button" className="project-secondary-button" onClick={() => setActiveProject(project.id)}>Set as active</button>}
                      <button type="button" className="project-text-button" onClick={() => editProject(project)}><Pencil size={14} /> Edit</button>
                      <button type="button" className="project-text-button" onClick={() => toggleArchiveProject(project)}>{project.archived ? 'Restore' : 'Archive'}</button>
                      <button type="button" className="project-delete-button" onClick={() => deleteProject(project)} aria-label={`Delete ${project.name}`}><Trash2 size={14} /> Delete</button>
                    </div>
                    <p className="project-updated">Updated {formatDate(project.updatedAt)}</p>
                  </article>
                );
              })}
              </div>
              : <div className="project-table-wrap"><table className="project-table"><thead><tr><th>Project</th><th>Project ID</th><th>Company</th><th>Commodity</th><th>Mine type</th><th>Status</th><th>Target (MT)</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{paginatedProjects.map((project) => <tr key={project.id}><td><button className="project-table-link" type="button" onClick={() => setDetailsProject(project)}>{project.name}</button></td><td>{project.projectId}</td><td>{project.operator || '—'}</td><td>{project.commodity || '—'}</td><td>{project.mineType || '—'}</td><td><span className={`project-status status-${project.status.toLowerCase()}`}>{project.status}</span></td><td>{project.productionTarget || '—'}</td><td>{formatDate(project.updatedAt)}</td><td><button type="button" className="project-text-button" onClick={() => editProject(project)}><Pencil size={13} /> Edit</button> {!project.archived && project.id !== activeProjectId && <button type="button" className="project-text-button" onClick={() => setActiveProject(project.id)}>Set active</button>} <button type="button" className="project-text-button" onClick={() => toggleArchiveProject(project)}>{project.archived ? 'Restore' : 'Archive'}</button> <button type="button" className="project-delete-button" onClick={() => deleteProject(project)} aria-label={`Delete ${project.name}`}><Trash2 size={13} /> Delete</button></td></tr>)}</tbody></table></div>
            ) : (
              <div className="project-search-empty">
                <Search size={19} />
                <strong>No matching projects</strong>
                <span>Try another search or clear the current directory filters.</span>
                <button type="button" onClick={() => {
                  setProjectSearch('');
                  setCompanyFilter('');
                  setCommodityFilter('');
                  setMineTypeFilter('');
                  setStatusFilter('');
                  setArchiveFilter('active');
                  setCurrentPage(1);
                }}>Clear filters</button>
              </div>
            )
          ) : (
            <div className="project-empty-state">
              <span className="project-empty-icon"><BriefcaseBusiness size={24} /></span>
              <span className="project-empty-step">FIRST STEP · CREATE A PROFILE</span>
              <h3>Start with your first project</h3>
              <p>Add a name and a few site details. You can fill in the rest later and switch projects from the header.</p>
              <button type="button" className="project-primary-button" onClick={startNewProject}><Plus size={15} /> Add project details</button>
              <small>Your dashboard will identify this project; its charts remain demo data.</small>
            </div>
          )}
          {filteredProjects.length > pageSize && (
            <nav className="project-pagination" aria-label="Project directory pages">
              <button type="button" className="project-secondary-button" disabled={displayPage === 1} onClick={() => setCurrentPage(displayPage - 1)}><ChevronLeft size={14} /> Previous</button>
              <span>Page {displayPage} of {pageCount}</span>
              <button type="button" className="project-secondary-button" disabled={displayPage === pageCount} onClick={() => setCurrentPage(displayPage + 1)}>Next <ChevronRight size={14} /></button>
            </nav>
          )}
        </section>

        <section className="project-form-panel" aria-labelledby="project-form-heading" ref={projectFormRef}>
          <div className="project-panel-heading">
            <div>
              <span className="project-panel-eyebrow">{editingProjectId ? 'UPDATE YOUR DIRECTORY' : 'QUICK SETUP'}</span>
              <h2 id="project-form-heading">{editingProjectId ? 'Edit project details' : 'Add a project'}</h2>
              <p className="project-form-intro">Start with the essentials. You can update these details at any time.</p>
            </div>
            {editingProjectId && <button className="project-cancel-edit" type="button" onClick={startNewProject}>Cancel</button>}
          </div>
          <form className="project-form" onSubmit={submitProject}>
            <label>
              <span className="project-label-text">Project ID</span>
              <input value={projects.find((project) => project.id === editingProjectId)?.projectId || nextProjectId(projects)} readOnly aria-describedby="project-id-help" />
              <small id="project-id-help" className="project-field-help">Generated automatically and retained when edited.</small>
            </label>
            <label>
              <span className="project-label-text">Project name <i aria-hidden="true">*</i></span>
              <input ref={projectNameRef} autoComplete="organization-title" required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. North Ridge Expansion" />
            </label>
            <div className="project-form-row">
              <label>Project type<select value={draft.projectType} onChange={(event) => setDraft({ ...draft, projectType: event.target.value })}>{projectTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label>Mine type<select value={draft.mineType} onChange={(event) => setDraft({ ...draft, mineType: event.target.value })}>{mineTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            </div>
            <div className="project-form-row">
              <label>Commodity<select value={draft.commodity} onChange={(event) => setDraft({ ...draft, commodity: event.target.value, coalfield: '', miningBlock: '' })}><option value="">Select commodity</option>{commodityOptions.map((commodity) => <option key={commodity}>{commodity}</option>)}</select></label>
              <label>Coalfield / mineral belt<select value={draft.coalfield} onChange={(event) => setDraft({ ...draft, coalfield: event.target.value, miningBlock: '' })}><option value="">Select belt</option>{(coalfieldsByCommodity[draft.commodity] || coalfieldsByCommodity.default).map((field) => <option key={field}>{field}</option>)}</select></label>
            </div>
            <div className="project-form-row">
              <label>Mining block<select value={draft.miningBlock} disabled={!draft.coalfield} onChange={(event) => setDraft({ ...draft, miningBlock: event.target.value })}><option value="">Select block</option>{(blocksByCoalfield[draft.coalfield] || (draft.coalfield ? ['Other'] : [])).map((block) => <option key={block}>{block}</option>)}</select></label>
              <label>Mining method<input maxLength={100} value={draft.miningMethod} onChange={(event) => setDraft({ ...draft, miningMethod: event.target.value })} placeholder="e.g. Longwall, opencast" /></label>
            </div>
            <label>Mine location<input maxLength={100} value={draft.site} onChange={(event) => setDraft({ ...draft, site: event.target.value })} placeholder="Mine, district, or site name" /></label>
            <div className="project-form-row">
              <label>Region / state<input maxLength={80} value={draft.region} onChange={(event) => setDraft({ ...draft, region: event.target.value })} placeholder="e.g. Jharkhand" /></label>
              <label>Operating company / subsidiary<input autoComplete="organization" maxLength={100} value={draft.operator} onChange={(event) => setDraft({ ...draft, operator: event.target.value })} placeholder="Company or license holder" /></label>
            </div>
            <label>Project manager<input maxLength={100} value={draft.projectManager} onChange={(event) => setDraft({ ...draft, projectManager: event.target.value })} placeholder="Name of project manager" /></label>
            <div className="project-form-row">
              <label>Latitude<input type="number" min="-90" max="90" step="any" value={draft.latitude} onChange={(event) => setDraft({ ...draft, latitude: event.target.value })} placeholder="e.g. 23.7957" /></label>
              <label>Longitude<input type="number" min="-180" max="180" step="any" value={draft.longitude} onChange={(event) => setDraft({ ...draft, longitude: event.target.value })} placeholder="e.g. 86.4304" /></label>
            </div>
            <div className="project-form-row">
              <label>Mining lease area (ha)<input type="number" min="0" step="any" value={draft.leaseAreaHa} onChange={(event) => setDraft({ ...draft, leaseAreaHa: event.target.value })} placeholder="Optional" /></label>
              <label>Geological reserves (MT)<input type="number" min="0" step="any" value={draft.geologicalReservesMt} onChange={(event) => setDraft({ ...draft, geologicalReservesMt: event.target.value })} placeholder="Optional" /></label>
            </div>
            <div className="project-form-row">
              <label>Project status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>{projectStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label>Annual production target (MT)<input type="number" min="0" step="any" value={draft.productionTarget} onChange={(event) => setDraft({ ...draft, productionTarget: event.target.value })} placeholder="Optional" /></label>
            </div>
            <label>Estimated project cost (₹ crore)<input type="number" min="0" step="any" value={draft.estimatedCost} onChange={(event) => setDraft({ ...draft, estimatedCost: event.target.value })} placeholder="Optional" /></label>
            <div className="project-form-row">
              <label>Project start date<input type="date" value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} /></label>
              <label>Expected completion<input type="date" value={draft.expectedCompletionDate} onChange={(event) => setDraft({ ...draft, expectedCompletionDate: event.target.value })} /></label>
            </div>
            <label>Project description<textarea rows="4" maxLength={1000} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Purpose, scope, or other useful context" /></label>
            <div className="project-form-actions">
              <button type="submit" className="project-primary-button">{editingProjectId ? 'Save changes' : 'Create project'}</button>
              {editingProjectId && <button type="button" className="project-secondary-button" onClick={startNewProject}>New instead</button>}
            </div>
          </form>
          <p className="project-form-footnote">{dataMode === 'mock' ? 'Project profiles are stored locally in this browser and are not shared with other users.' : 'Project profiles are sent to the configured project API. Backend persistence and access controls must be provided by your PHP service.'}</p>
          {projects.length > 0 && <Link className="project-dashboard-link" to="/">View dashboard context <span aria-hidden="true">→</span></Link>}
        </section>
      </div>
      <ProjectDetailsDialog project={detailsProject} onClose={() => setDetailsProject(null)} />
    </main>
  );
}

export default Projects;
