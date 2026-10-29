export const documentLibraryStorageKey = 'carbonexa-document-library';

export const defaultFolders = [
  { id: 1, name: 'Geological Surveys', updated: '29 Sep 2026', year: '2026' },
  { id: 2, name: 'Environmental Compliance', updated: '24 Sep 2026', year: '2026' },
  { id: 3, name: 'Mining Operations Q3', updated: '15 Sep 2026', year: '2026' },
  { id: 4, name: 'Safety & Risk Audits', updated: '12 Aug 2025', year: '2025' },
  { id: 5, name: 'Historical Archive 2024', updated: '15 Dec 2024', year: '2024' },
];

export const defaultFiles = [
  { id: 1, name: 'Jharia_Block_Survey_Final.pdf', folder: 'Geological Surveys', category: 'Geological', size: '14.2 MB', added: '28 Sep 2026', starred: true },
  { id: 2, name: 'Mineral_Composition_Report.pdf', folder: 'Geological Surveys', category: 'Geological', size: '18.5 MB', added: '29 Sep 2026', starred: false },
  { id: 3, name: 'Core_Sample_Analysis_v2.xlsx', folder: 'Geological Surveys', category: 'Geological', size: '9.3 MB', added: '22 Sep 2026', starred: true },
  { id: 4, name: 'Water_Table_Analysis_Q3.xlsx', folder: 'Environmental Compliance', category: 'Environmental', size: '8.5 MB', added: '25 Sep 2026', starred: false },
  { id: 5, name: 'Air_Quality_Monitoring_Log.pdf', folder: 'Environmental Compliance', category: 'Environmental', size: '27.5 MB', added: '24 Sep 2026', starred: true },
  { id: 6, name: 'Bokaro_Excavation_Log.docx', folder: 'Mining Operations Q3', category: 'Mining', size: '4.1 MB', added: '22 Sep 2026', starred: false },
  { id: 7, name: 'Talcher_Safety_Inspection.pdf', folder: 'Safety & Risk Audits', category: 'Safety', size: '6.3 MB', added: '18 Aug 2025', starred: true },
  { id: 8, name: 'Carbonexa_Compliance_2024.zip', folder: 'Historical Archive 2024', category: 'Environmental', size: '45.0 MB', added: '10 Dec 2024', starred: false },
];

export function loadDocumentLibrary() {
  try {
    const savedLibrary = localStorage.getItem(documentLibraryStorageKey);
    if (!savedLibrary) return { folders: defaultFolders, files: defaultFiles, error: '' };

    const parsedLibrary = JSON.parse(savedLibrary);
    const validFolders = Array.isArray(parsedLibrary.folders)
      && parsedLibrary.folders.every((folder) => Number.isInteger(folder.id) && typeof folder.name === 'string');
    const validFiles = Array.isArray(parsedLibrary.files)
      && parsedLibrary.files.every((file) => (
        Number.isInteger(file.id)
        && typeof file.name === 'string'
        && typeof file.folder === 'string'
        && typeof file.category === 'string'
        && typeof file.size === 'string'
        && typeof file.added === 'string'
        && typeof file.starred === 'boolean'
      ));
    if (!validFolders || !validFiles) {
      throw new Error('Saved library data is invalid.');
    }

    return { folders: parsedLibrary.folders, files: parsedLibrary.files, error: '' };
  } catch {
    return {
      folders: defaultFolders,
      files: defaultFiles,
      error: 'Saved document data could not be loaded. Showing the sample library.'
    };
  }
}

export function saveDocumentLibrary(folders, files) {
  localStorage.setItem(documentLibraryStorageKey, JSON.stringify({ folders, files }));
}
