import { dataMode } from '../config/api';
import { requestJson } from './api';
import { loadDocumentLibrary } from '../data/documentLibrary';

const recentSearchesKey = 'carbonexa-recent-searches';
const searchableText = (values) => values.filter((value) => typeof value === 'string').join(' ').toLowerCase();

function readStoredArray(key, label) {
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  const parsed = JSON.parse(stored);
  if (!Array.isArray(parsed)) throw new Error(`Saved ${label} data has an invalid format.`);
  return parsed;
}

function createResult({ id, type, title, description, path }) {
  return { id: String(id), type, title, description, path };
}

export async function searchWorkspace(query, projects, { signal } = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  if (dataMode === 'php') {
    const response = await requestJson(`/search?q=${encodeURIComponent(query.trim())}`, { signal });
    const results = response?.data;
    if (!Array.isArray(results) || !results.every((result) => (
      result
      && ['id', 'type', 'title', 'description', 'path'].every((key) => typeof result[key] === 'string')
    ))) {
      throw new Error('The search API returned an invalid response. Expected { data: [{ id, type, title, description, path }] }.');
    }
    return results.slice(0, 20);
  }

  const results = [];
  for (const project of projects) {
    const fields = [project.name, project.projectId, project.site, project.commodity, project.region, project.operator, project.miningBlock];
    if (searchableText(fields).includes(normalizedQuery)) {
      const isMineMatch = searchableText([project.site, project.miningBlock, project.region]).includes(normalizedQuery);
      results.push(createResult({
        id: project.id,
        type: isMineMatch ? 'Mine' : 'Project',
        title: project.name,
        description: [project.projectId, project.site, project.operator].filter(Boolean).join(' · ') || 'Project profile',
        path: `/projects/${encodeURIComponent(project.id)}`,
      }));
    }
  }

  const library = loadDocumentLibrary();
  if (library.error) throw new Error(library.error);
  for (const file of library.files) {
    if (searchableText([file.name, file.folder, file.category, file.projectId, file.description]).includes(normalizedQuery)) {
      results.push(createResult({
        id: file.id,
        type: 'Document',
        title: file.name,
        description: [file.category, file.folder].filter(Boolean).join(' · '),
        path: `/documents?search=${encodeURIComponent(file.name)}`,
      }));
    }
  }

  const reports = readStoredArray('carbonexa-reports', 'report');
  for (const report of reports) {
    if (searchableText([report.name, report.desc, report.project, report.category, report.owner]).includes(normalizedQuery)) {
      results.push(createResult({
        id: report.id,
        type: 'Report',
        title: report.name,
        description: [report.project, report.category, report.status].filter(Boolean).join(' · '),
        path: `/reports?search=${encodeURIComponent(report.name)}`,
      }));
    }
  }

  const archives = readStoredArray('carbonexa-archives', 'archive');
  for (const archive of archives) {
    if (searchableText([archive.name, archive.desc, archive.type, archive.project, archive.folder, archive.owner]).includes(normalizedQuery)) {
      results.push(createResult({
        id: archive.id,
        type: 'Archive',
        title: archive.name,
        description: [archive.project, archive.folder, archive.type].filter(Boolean).join(' · '),
        path: `/archives?search=${encodeURIComponent(archive.name)}`,
      }));
    }
  }

  return results.slice(0, 20);
}

export function loadRecentSearches() {
  try {
    const saved = localStorage.getItem(recentSearchesKey);
    if (!saved) return { searches: [], error: '' };
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
      throw new Error('Recent search data has an invalid format.');
    }
    return { searches: parsed.slice(0, 5), error: '' };
  } catch {
    return { searches: [], error: 'Recent searches could not be loaded from this browser.' };
  }
}

export function saveRecentSearch(search) {
  const normalizedSearch = search.trim();
  if (!normalizedSearch) return;
  const { searches, error } = loadRecentSearches();
  if (error) throw new Error(error);
  const nextSearches = [normalizedSearch, ...searches.filter((item) => item.toLowerCase() !== normalizedSearch.toLowerCase())].slice(0, 5);
  localStorage.setItem(recentSearchesKey, JSON.stringify(nextSearches));
}
