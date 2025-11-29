import { useState, useCallback, useEffect } from 'react';
import type { DraftSummary, DraftPayload, ElectronBridge } from '../utils/types';

declare global {
  interface Window {
    electron?: ElectronBridge;
  }
}

export const useDrafts = () => {
  const [draftsDirectory, setDraftsDirectory] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [draftsError, setDraftsError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const refreshDrafts = useCallback(async (directory: string) => {
    if (!directory || !window.electron?.listDrafts) {
      setDrafts([]);
      return;
    }

    setDraftsLoading(true);
    setDraftsError(null);

    try {
      const result = await window.electron.listDrafts(directory);
      setDrafts(result ?? []);
    } catch (error) {
      console.error('Erreur lors du chargement des brouillons', error);
      setDraftsError('Impossible de charger les brouillons.');
    } finally {
      setDraftsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!draftsDirectory) {
      setDrafts([]);
      return;
    }
    void refreshDrafts(draftsDirectory);
  }, [draftsDirectory, refreshDrafts]);

  const chooseDraftsFolder = useCallback(async () => {
    if (!window.electron?.chooseDraftsFolder) {
      throw new Error('La sauvegarde locale nécessite l\'application desktop.');
    }
    const directory = await window.electron.chooseDraftsFolder();
    if (directory) {
      setDraftsDirectory(directory);
    }
    return directory;
  }, []);

  const saveDraft = useCallback(async (
    directory: string,
    payload: DraftPayload,
    overwrite = false
  ) => {
    if (!window.electron?.saveDraft) {
      throw new Error('Sélectionnez un dossier de brouillons avant de sauvegarder.');
    }
    setIsSavingDraft(true);
    try {
      await window.electron.saveDraft(directory, payload, overwrite);
      await refreshDrafts(directory);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon', error);
      throw error;
    } finally {
      setIsSavingDraft(false);
    }
  }, [refreshDrafts]);

  const loadDraft = useCallback(async (draftId: string) => {
    if (!window.electron?.loadDraft) {
      throw new Error('Chargement des brouillons indisponible hors application desktop.');
    }
    return await window.electron.loadDraft(draftId);
  }, []);

  const deleteDraft = useCallback(async (draftId: string) => {
    if (!window.electron?.deleteDraft) {
      throw new Error('Suppression des brouillons indisponible hors application desktop.');
    }
    await window.electron.deleteDraft(draftId);
    if (draftsDirectory) {
      await refreshDrafts(draftsDirectory);
    }
  }, [draftsDirectory, refreshDrafts]);

  const electronAvailable = typeof window !== 'undefined' && Boolean(window.electron);
  const canPersistDrafts = Boolean(draftsDirectory && electronAvailable && window.electron?.saveDraft);

  return {
    draftsDirectory,
    setDraftsDirectory,
    drafts,
    draftsLoading,
    draftsError,
    isSavingDraft,
    canPersistDrafts,
    electronAvailable,
    refreshDrafts,
    chooseDraftsFolder,
    saveDraft,
    loadDraft,
    deleteDraft,
  };
};

