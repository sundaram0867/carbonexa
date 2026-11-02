import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bot, CheckCircle2, ClipboardList, FileText, Factory,
  Globe2, HardHat, Layers3, MapPinned, Plus, Search, ShieldCheck, Trash2,
  Users, Wallet, Pencil,
} from 'lucide-react';
import { dataMode } from '../config/api';
import { useProjectResource } from '../hooks/useProjectResource';
import { complianceService } from '../services/complianceService';
import { documentService } from '../services/documentService';
import { financeService } from '../services/financeService';
import { geologicalService } from '../services/geologicalService';
import { gisService } from '../services/gisService';
import { milestoneService, taskService } from '../services/taskService';
import { productionService } from '../services/productionService';
import { safetyService } from '../services/safetyService';
import { teamService } from '../services/teamService';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './ProjectWorkspace.css';

const modules = [
  { id: 'overview', label: 'Project overview', icon: Layers3 },
  { id: 'geology', label: 'Geological intelligence', icon: MapPinned, service: geologicalService, description: 'Boreholes, strata, seam thickness, quality and resource estimates.', fields: [
    { key: 'boreholeId', label: 'Borehole ID', required: true },
    { key: 'coordinates', label: 'Coordinates', placeholder: 'Latitude, longitude' },
    { key: 'depthM', label: 'Depth (m)', type: 'number' },
    { key: 'strata', label: 'Geological strata' },
    { key: 'seamThicknessM', label: 'Seam thickness (m)', type: 'number' },
    { key: 'gradeQuality', label: 'Mineral grade / quality' },
    { key: 'resourceMt', label: 'Resource estimate (MT)', type: 'number' },
    { key: 'reserveMt', label: 'Reserve estimate (MT)', type: 'number' },
  ] },
  { id: 'gis', label: 'GIS & mine mapping', icon: Globe2, service: gisService, description: 'Store mine coordinates, map layers and spatial survey references.', fields: [
    { key: 'layerName', label: 'Map layer / survey', required: true },
    { key: 'latitude', label: 'Latitude', type: 'number' },
    { key: 'longitude', label: 'Longitude', type: 'number' },
    { key: 'reference', label: 'Map reference / notes' },
  ] },
  { id: 'production', label: 'Production & operations', icon: Factory, service: productionService, description: 'Track production targets, actuals, achievement and dispatches.', fields: [
    { key: 'periodType', label: 'Target period', type: 'select', options: ['Annual', 'Monthly'] },
    { key: 'period', label: 'Reporting period', required: true, placeholder: 'e.g. 2025-04' },
    { key: 'targetMt', label: 'Production target (MT)', type: 'number' },
    { key: 'actualMt', label: 'Actual production (MT)', type: 'number' },
    { key: 'achievementPercent', label: 'Achievement (%)', computed: true },
    { key: 'dispatchMt', label: 'Dispatch (MT)', type: 'number' },
    { key: 'notes', label: 'Notes' },
  ] },
  { id: 'documents', label: 'Documents & reports', icon: FileText, service: documentService, description: 'Organize reports, plans, clearances and production documents.', fields: [
    { key: 'file', label: 'Select file', type: 'file', required: true },
    { key: 'category', label: 'Document category', type: 'select', required: true, options: ['DPR', 'Geological Exploration Report', 'Feasibility Report', 'Mine Plan', 'Mine Closure Plan', 'Environmental Clearance', 'Forest Clearance', 'Safety Report', 'Production Report', 'Other'] },
    { key: 'version', label: 'Version', placeholder: 'e.g. 1.0' },
    { key: 'status', label: 'Document status', type: 'select', options: ['Draft', 'Under Review', 'Approved', 'Superseded'] },
  ] },
  { id: 'environment', label: 'Environmental compliance', icon: ShieldCheck, service: complianceService, description: 'Track approvals, monitoring, conditions and compliance deadlines.', fields: [
    { key: 'recordType', label: 'Record type', type: 'select', required: true, options: ['Environmental clearance', 'Forest clearance', 'Air monitoring', 'Water monitoring', 'Compliance condition'] },
    { key: 'reference', label: 'Approval / monitoring reference' },
    { key: 'validUntil', label: 'Valid until / deadline', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['Current', 'Due soon', 'Overdue', 'Submitted'] },
    { key: 'notes', label: 'Conditions / notes' },
  ] },
  { id: 'safety', label: 'Safety management', icon: HardHat, service: safetyService, description: 'Maintain incident, inspection, risk and corrective-action records.', fields: [
    { key: 'recordType', label: 'Record type', type: 'select', required: true, options: ['Incident', 'Safety inspection', 'Risk assessment', 'Safety audit', 'Corrective action'] },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'riskLevel', label: 'Risk level', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In progress', 'Resolved'] },
    { key: 'action', label: 'Finding / corrective action' },
  ] },
  { id: 'finance', label: 'Cost & finance', icon: Wallet, service: financeService, description: 'Record estimate categories and project cost updates.', fields: [
    { key: 'category', label: 'Cost category', required: true, placeholder: 'e.g. Equipment, civil works' },
    { key: 'amountCrore', label: 'Amount (₹ crore)', type: 'number' },
    { key: 'date', label: 'As of date', type: 'date' },
    { key: 'notes', label: 'Notes' },
  ] },
  { id: 'tasks', label: 'Tasks & milestones', icon: ClipboardList, service: taskService, description: 'Assign work, priorities, deadlines and progress.', fields: [
    { key: 'title', label: 'Task title', required: true },
    { key: 'assignee', label: 'Assignee' },
    { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    { key: 'deadline', label: 'Deadline', type: 'date' },
    { key: 'completionPercent', label: 'Completion (%)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['Not started', 'In progress', 'Blocked', 'Completed'] },
  ] },
  { id: 'milestones', label: 'Milestones', icon: CheckCircle2, service: milestoneService, description: 'Track key project delivery dates and completion status.', fields: [
    { key: 'title', label: 'Milestone', required: true },
    { key: 'dueDate', label: 'Target date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'In progress', 'At risk', 'Completed'] },
    { key: 'notes', label: 'Notes' },
  ] },
  { id: 'team', label: 'Team & permissions', icon: Users, service: teamService, description: 'Keep project contacts and intended access roles together.', fields: [
    { key: 'name', label: 'Team member', required: true },
    { key: 'role', label: 'Role / designation' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'permission', label: 'Project access', type: 'select', options: ['Viewer', 'Contributor', 'Project manager', 'Administrator'] },
  ] },
  { id: 'assistant', label: 'AI mining assistant', icon: Bot },
];

const recordHasValue = (records, field) => records.some((record) => record[field] !== undefined && record[field] !== '');
const hasValue = (value) => value !== '' && value !== null && value !== undefined;
const isSafeResourceUrl = (url) => typeof url === 'string' && (url.startsWith('/') || /^https:\/\//i.test(url));

function ProjectOverview({ project, onOpenModule }) {
  const details = [
    ['Project type', project.projectType],
    ['Mine / commodity', [project.mineType, project.commodity].filter(Boolean).join(' · ')],
    ['Coalfield / block', [project.coalfield, project.miningBlock].filter(Boolean).join(' · ')],
    ['Operating company', project.operator],
    ['Project manager', project.projectManager],
    ['Location', [project.site, project.region].filter(Boolean).join(', ')],
    ['Annual target', hasValue(project.productionTarget) ? `${project.productionTarget} MT` : ''],
    ['Estimated cost', hasValue(project.estimatedCost) ? `₹${project.estimatedCost} crore` : ''],
  ];
  return (
    <>
      <div className="project-module-profile">
        <div><span className="project-module-eyebrow">PROJECT OVERVIEW</span><h2>{project.name}</h2><p>{project.projectId} · {project.status}{project.archived ? ' · Archived' : ''}</p></div>
        <span className="project-module-status">{project.status}</span>
      </div>
      <dl className="project-module-details">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl>
      <p className="project-module-description">{project.description || 'Add a project description in Project Directory to provide context for your team.'}</p>
      <div className="project-module-launch-grid">
        {modules.filter((module) => module.service).map((module) => <button key={module.id} type="button" onClick={() => onOpenModule(module.id)}><module.icon size={16} /><span>{module.label}</span><small>{module.description}</small></button>)}
      </div>
    </>
  );
}

function ProjectRecords({ project, module }) {
  const { records, loading, error, success, create, update, remove } = useProjectResource(module.service, project.id);
  const [values, setValues] = useState({});
  const [editingRecordId, setEditingRecordId] = useState('');
  const [search, setSearch] = useState('');
  const [formError, setFormError] = useState('');
  const [currentTime] = useState(() => Date.now());
  const formRef = useRef(null);
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => !query || Object.values(record).some((value) => (
      typeof value === 'string' && value.toLowerCase().includes(query)
    )));
  }, [records, search]);
  const usesTable = module.id !== 'documents';

  const submitRecord = async (event) => {
    event.preventDefault();
    setFormError('');
    if (module.id === 'documents' && values.file) {
      const extension = values.file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'jpg', 'jpeg', 'png'].includes(extension)) {
        setFormError('Choose a supported PDF, Office, CSV, JPG, or PNG document.');
        return;
      }
    }
    const missing = module.fields.find((field) => field.required && !values[field.key] && !(editingRecordId && field.type === 'file'));
    if (missing) {
      setFormError(`${missing.label} is required.`);
      return;
    }
    try {
      const record = Object.fromEntries(module.fields.filter((field) => !field.computed && (field.type !== 'file' || values.file)).map(({ key, type }) => {
        const value = values[key];
        if (type === 'file') return [key, value];
        if (type === 'number' && value !== '' && value !== undefined) return [key, Number(value)];
        return [key, value || ''];
      }));
      if (module.id === 'documents' && values.file) {
        record.fileName = values.file.name;
        record.fileSize = values.file.size;
        record.uploadedAt = new Date().toISOString();
      }
      if (module.id === 'production' && Number(record.targetMt) > 0 && Number.isFinite(Number(record.actualMt))) {
        record.achievementPercent = Number(((Number(record.actualMt) / Number(record.targetMt)) * 100).toFixed(1));
      }
      if (editingRecordId) await update(editingRecordId, record);
      else await create(record);
      setValues({});
      setEditingRecordId('');
    } catch (saveError) {
      setFormError(saveError.message || `Could not ${editingRecordId ? 'update' : 'add'} this record.`);
    }
  };

  const editRecord = (record) => {
    setValues(Object.fromEntries(module.fields
      .filter((field) => field.type !== 'file' && !field.computed)
      .map(({ key }) => [key, record[key] ?? ''])));
    setEditingRecordId(record.id);
    setFormError('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cancelRecordEdit = () => {
    setValues({});
    setEditingRecordId('');
    setFormError('');
  };

  const deleteRecord = async (record) => {
    const title = record.title || record.fileName || record.boreholeId || record.layerName || record.period || record.name || 'this record';
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await remove(record.id);
    } catch (deleteError) {
      setFormError(deleteError.message || 'Could not delete this record.');
    }
  };

  return (
    <div className="project-record-layout">
      <section className="project-record-panel">
        <div className="project-record-heading"><div><h3>{editingRecordId ? 'Edit record' : 'Add record'}</h3><p>{module.description}</p></div></div>
        <form ref={formRef} className="project-record-form" onSubmit={submitRecord}>
          <fieldset disabled={project.archived}>
            {module.fields.filter((field) => !field.computed).map((field) => (
              <label key={field.key}>
                {field.label}{field.required && !(editingRecordId && field.type === 'file') && <i aria-hidden="true"> *</i>}
                {field.type === 'select' ? (
                  <select required={field.required} value={values[field.key] || ''} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}>
                    <option value="">Select</option>{field.options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    required={field.required && !(editingRecordId && field.type === 'file')}
                    step={field.type === 'number' ? 'any' : undefined}
                    min={field.key === 'latitude' ? '-90' : field.key === 'longitude' ? '-180' : field.type === 'number' ? '0' : undefined}
                    max={field.key === 'latitude' || field.key === 'completionPercent' ? (field.key === 'latitude' ? '90' : '100') : field.key === 'longitude' ? '180' : undefined}
                    accept={field.type === 'file' ? '.pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png' : undefined}
                    placeholder={field.placeholder}
                    value={field.type === 'file' ? undefined : values[field.key] || ''}
                    onChange={(event) => setValues((current) => ({
                      ...current,
                      [field.key]: field.type === 'file' ? event.target.files?.[0] || null : event.target.value,
                    }))}
                  />
                )}
              </label>
            ))}
            <div className="project-record-form-actions">
              <button type="submit" className="project-record-submit">{editingRecordId ? <Pencil size={14} /> : <Plus size={15} />}{editingRecordId ? 'Save changes' : 'Add record'}</button>
              {editingRecordId && <button type="button" className="project-record-cancel" onClick={cancelRecordEdit}>Cancel</button>}
            </div>
          </fieldset>
          {project.archived && <p className="project-module-note">Restore this project to add or change operational records.</p>}
          {module.id === 'documents' && <p className="project-module-note">{dataMode === 'mock' ? 'Mock mode saves file metadata only on this device. Enable PHP API mode to upload the file.' : 'The selected file is uploaded to the configured project documents endpoint.'}</p>}
          {formError && <p className="project-record-error" role="alert">{formError}</p>}
          {success && <p className="project-record-success" role="status">{success}</p>}
        </form>
      </section>
      <section className="project-record-panel">
        <div className="project-record-heading"><div><h3>{module.label}</h3><p>{records.length} saved record{records.length === 1 ? '' : 's'}</p></div></div>
        <label className="project-record-search"><Search size={15} /><input type="search" aria-label={`Search ${module.label}`} placeholder="Search records" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        {error && <p className="project-record-error" role="alert">{error}</p>}
        {module.id === 'gis' && <p className="project-module-note">Spatial references are stored here. Interactive map layers require a GIS provider and backend geometry service.</p>}
        {module.id === 'production' && filteredRecords.length > 0 && (
          <div className="project-production-chart" aria-label="Production target versus actual chart">
            <h4>Target versus actual production (MT)</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredRecords.map((record) => ({ ...record, targetMt: Number(record.targetMt) || 0, actualMt: Number(record.actualMt) || 0 }))} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
                <CartesianGrid stroke="#e8eef1" strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Bar dataKey="targetMt" name="Target" fill="#9fcfc3" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualMt" name="Actual" fill="#176d69" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {loading ? <p className="project-record-empty">Loading project records…</p> : filteredRecords.length ? usesTable ? (
          <div className="project-module-table-wrap">
            <table className="project-module-table">
              <thead><tr>{module.fields.filter((field) => recordHasValue(records, field.key)).map((field) => <th key={field.key}>{field.label}</th>)}<th>Actions</th></tr></thead>
              <tbody>{filteredRecords.map((record) => (
                <tr key={record.id}>
                  {module.fields.filter((field) => recordHasValue(records, field.key)).map(({ key }) => (
                    <td key={key}>{record[key] === undefined || record[key] === '' ? '—' : ['achievementPercent', 'completionPercent'].includes(key) ? `${record[key]}%` : record[key]}</td>
                  ))}
                  <td>{module.id === 'tasks' && record.deadline && record.status !== 'Completed' && Date.parse(`${record.deadline}T23:59:59`) < currentTime && <span className="project-overdue-tag">Overdue</span>}<button type="button" className="project-record-edit" aria-label={`Edit ${record.title || record.boreholeId || record.period || 'record'}`} onClick={() => editRecord(record)}><Pencil size={13} /> Edit</button><button type="button" className="project-record-delete" aria-label={`Delete ${record.title || record.boreholeId || record.period || 'record'}`} onClick={() => deleteRecord(record)}><Trash2 size={13} /> Delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="project-record-list">
            {filteredRecords.map((record) => {
              const details = module.fields.filter(({ key, type }) => key !== 'file' && type !== 'file' && record[key] !== '' && record[key] !== undefined);
              const titleField = details.find(({ key }) => ['title', 'boreholeId', 'layerName', 'period', 'category', 'recordType', 'name'].includes(key)) || details[0];
              const isOverdue = module.id === 'tasks' && record.deadline && record.status !== 'Completed'
                && Date.parse(`${record.deadline}T23:59:59`) < currentTime;
              return (
                <article className="project-record-item" key={record.id}>
                  <div className="project-record-item-heading"><strong>{record.fileName || (titleField ? record[titleField.key] : 'Project record')}</strong><span><button type="button" aria-label={`Edit ${record.fileName || record.title || 'record'}`} onClick={() => editRecord(record)}><Pencil size={13} /></button><button type="button" aria-label={`Delete ${record.fileName || record.title || 'record'}`} onClick={() => deleteRecord(record)}><Trash2 size={14} /></button></span></div>
                  {module.id === 'documents' && <p className="project-record-file">{record.fileName}{record.fileSize ? ` · ${(record.fileSize / 1024).toFixed(0)} KB` : ''} · {record.version || 'Version not set'} · {record.status || 'Status not set'}</p>}
                  <dl>{details.filter((field) => field !== titleField).map(({ key, label }) => <div key={key}><dt>{label}</dt><dd>{['achievementPercent', 'completionPercent'].includes(key) ? `${record[key]}%` : record[key]}</dd></div>)}</dl>
                  {isOverdue && <p className="project-record-error">Overdue task</p>}
                  {isSafeResourceUrl(record.previewUrl) && <a className="project-record-download" href={record.previewUrl} target="_blank" rel="noreferrer">Preview</a>}
                  {isSafeResourceUrl(record.downloadUrl) && <a className="project-record-download" href={record.downloadUrl} target="_blank" rel="noreferrer">Open / download</a>}
                  {record.createdAt && <small>Added {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(record.createdAt))}</small>}
                </article>
              );
            })}
          </div>
        ) : <p className="project-record-empty">{records.length ? 'No records match this search.' : `No ${module.label.toLowerCase()} have been added to this project yet.`}</p>}
      </section>
    </div>
  );
}

function ProjectWorkspace({ projects }) {
  const { projectId } = useParams();
  const [activeModuleId, setActiveModuleId] = useState('overview');
  const project = projects.find((item) => item.id === projectId);
  if (!project) return <Navigate to="/projects" replace />;
  const activeModule = modules.find((item) => item.id === activeModuleId) || modules[0];

  return (
    <main className="workspace-page project-workspace-page">
      <Link to="/projects" className="project-workspace-back"><ArrowLeft size={15} /> Project directory</Link>
      <header className="project-workspace-header">
        <div><span className="project-module-eyebrow">PROJECT WORKSPACE · {project.projectId}</span><h1>{project.name}</h1><p>{[project.site, project.region, project.operator].filter(Boolean).join(' · ') || 'Project details and operational modules'}</p></div>
        <Link className="project-workspace-edit" to="/projects" state={{ editProjectId: project.id }}>Edit project profile</Link>
      </header>
      {project.archived && <p className="project-module-note">This project is archived. Restore it from the project directory before continuing operational updates.</p>}
      <div className="project-workspace-layout">
        <nav className="project-workspace-nav" aria-label="Project modules">
          {modules.map((module) => <button key={module.id} type="button" className={module.id === activeModuleId ? 'is-selected' : ''} aria-current={module.id === activeModuleId ? 'page' : undefined} onClick={() => setActiveModuleId(module.id)}><module.icon size={16} /><span>{module.label}</span></button>)}
        </nav>
        <section className="project-workspace-content">
          {activeModuleId === 'overview' ? <ProjectOverview project={project} onOpenModule={setActiveModuleId} /> : null}
          {activeModule.service ? <><div className="project-module-title"><activeModule.icon size={20} /><div><h2>{activeModule.label}</h2><p>{activeModule.description}</p></div></div><ProjectRecords key={`${project.id}:${activeModule.id}`} project={project} module={activeModule} /></> : null}
          {activeModuleId === 'assistant' && <div className="project-assistant-placeholder"><Bot size={28} /><h2>AI Mining Assistant</h2><p>Use the Carbonexa assistant for mining and geological questions. Project-specific context and document retrieval require backend integration.</p><Link to="/ai-assistant">Open AI Assistant</Link></div>}
        </section>
      </div>
    </main>
  );
}

export default ProjectWorkspace;
