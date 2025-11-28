import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  chooseDraftsFolder: () => ipcRenderer.invoke('choose-drafts-folder'),
  saveDraft: (
    directory: string,
    payload: { affaireName: string; entries: unknown },
    overwrite?: boolean
  ) => ipcRenderer.invoke('save-draft', { directory, payload, overwrite }),
  listDrafts: (directory: string) => ipcRenderer.invoke('list-drafts', directory),
  loadDraft: (filePath: string) => ipcRenderer.invoke('load-draft', filePath),
  deleteDraft: (filePath: string) => ipcRenderer.invoke('delete-draft', filePath),
  exportExcel: (affaireName: string, answers: unknown[]) =>
    ipcRenderer.invoke('export-excel', { affaireName, answers })
});

