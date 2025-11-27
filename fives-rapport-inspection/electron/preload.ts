import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  saveDraft: (affaireName: string, forms: Record<string, unknown>) =>
    ipcRenderer.invoke('save-draft', { affaireName, forms }),
  loadDraft: (affaireName: string) => ipcRenderer.invoke('load-draft', affaireName),
  exportExcel: (affaireName: string, answers: unknown[]) =>
    ipcRenderer.invoke('export-excel', { affaireName, answers })
});

