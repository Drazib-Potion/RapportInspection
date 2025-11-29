import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDrafts } from '../hooks/useDrafts';
import { useProductForm } from '../hooks/useProductForm';
import { generateProductId } from '../utils/productData';
import type { CompletedEntry, DraftPayload, ProductDefinition, DraftSummary, DraftData } from '../utils/types';

interface AppContextType {
  // Affaire
  affaireName: string;
  setAffaireName: (name: string) => void;
  
  // Produits et réponses (depuis useProductForm)
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedProduct: ProductDefinition | null;
  currentAnswers: Record<string, string>;
  setCurrentAnswers: (answers: Record<string, string>) => void;
  activeEntryIndex: number | null;
  setActiveEntryIndex: (index: number | null) => void;
  completedEntries: CompletedEntry[];
  setCompletedEntries: React.Dispatch<React.SetStateAction<CompletedEntry[]>>;
  resetFormState: () => void;
  selectProduct: (product: ProductDefinition) => void;
  buildEntriesWithCurrent: () => CompletedEntry[];
  editEntry: (index: number) => void;
  deleteEntry: (index: number) => void;
  answerChange: (questionId: string, value: string) => void;
  
  // Brouillons (depuis useDrafts)
  draftsDirectory: string | null;
  setDraftsDirectory: (dir: string | null) => void;
  drafts: DraftSummary[];
  draftsLoading: boolean;
  draftsError: string | null;
  isSavingDraft: boolean;
  canPersistDrafts: boolean;
  electronAvailable: boolean;
  refreshDrafts: (directory: string) => Promise<void>;
  chooseDraftsFolder: () => Promise<string | null>;
  saveDraft: (directory: string, payload: DraftPayload, overwrite?: boolean) => Promise<void>;
  loadDraft: (draftId: string) => Promise<DraftData>;
  deleteDraft: (draftId: string) => Promise<void>;
  
  // Navigation et actions
  navigate: ReturnType<typeof useNavigate>;
  handleStartInspection: () => void;
  handleRestart: () => void;
  handleReturnToMenu: () => void;
  handleDeleteEntry: (index: number) => void;
  handleSaveDraftClick: () => void;
  handleLoadDraft: (draftId: string) => Promise<void>;
  handleDeleteDraft: (draftId: string) => Promise<void>;
  
  // Modales
  draftNamePrompt: { entries: CompletedEntry[]; defaultName: string } | null;
  setDraftNamePrompt: (prompt: { entries: CompletedEntry[]; defaultName: string } | null) => void;
  draftNameInput: string;
  setDraftNameInput: (input: string) => void;
  overwritePrompt: { entries: CompletedEntry[]; draftName: string } | null;
  setOverwritePrompt: (prompt: { entries: CompletedEntry[]; draftName: string } | null) => void;
  confirmDraftNameSave: (draftName?: string) => Promise<void>;
  confirmOverwriteSave: () => Promise<void>;
  
  // Helpers
  summaryForEntry: (entry: CompletedEntry) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [affaireName, setAffaireName] = useState('');
  const [draftNamePrompt, setDraftNamePrompt] = useState<{ entries: CompletedEntry[]; defaultName: string } | null>(null);
  const [draftNameInput, setDraftNameInput] = useState('');
  const [overwritePrompt, setOverwritePrompt] = useState<{ entries: CompletedEntry[]; draftName: string } | null>(null);

  const drafts = useDrafts();
  const productForm = useProductForm();

  const trimmedAffaire = affaireName.trim();

  const handleStartInspection = useCallback(() => {
    if (!trimmedAffaire) {
      return;
    }
    productForm.resetFormState();
    navigate('/form');
  }, [trimmedAffaire, productForm, navigate]);

  const handleRestart = useCallback(() => {
    productForm.setCompletedEntries([]);
    setAffaireName('');
    productForm.resetFormState();
    navigate('/');
  }, [productForm, navigate]);

  const handleReturnToMenu = useCallback(() => {
    const hasCurrentProduct = Boolean(productForm.selectedProduct);
    const currentProduct = productForm.selectedProduct;
    
    if (hasCurrentProduct && currentProduct) {
      const nextEntries = productForm.buildEntriesWithCurrent();
      productForm.setCompletedEntries(nextEntries);
    }
    
    productForm.resetFormState();
    navigate('/');
  }, [productForm, navigate]);

  const handleDeleteEntry = useCallback((index: number) => {
    productForm.deleteEntry(index);
    productForm.resetFormState();
    navigate('/');
  }, [productForm, navigate]);

  const handleSaveDraftClick = useCallback(() => {
    const entriesToPersist = productForm.buildEntriesWithCurrent();

    if (!entriesToPersist.length) {
      return;
    }

    const defaultName = trimmedAffaire ? `draft-${trimmedAffaire}` : `draft-${t('mainMenu.affaireNameLabel')}`;
    setDraftNameInput(defaultName);
    setDraftNamePrompt({ entries: entriesToPersist, defaultName });
  }, [productForm, trimmedAffaire, t]);

  const confirmDraftNameSave = useCallback(async (draftNameParam?: string) => {
    if (!draftNamePrompt) {
      return;
    }

    const trimmedDraftName = (draftNameParam || draftNameInput).trim();
    if (!trimmedDraftName) {
      return;
    }

    try {
      const entriesToPersist = draftNamePrompt.entries;
      productForm.setCompletedEntries(entriesToPersist);
      productForm.resetFormState();

      const slug = generateProductId(trimmedDraftName);
      const existingDraft = drafts.drafts.some(
        (draft) => generateProductId(draft.affaireName) === slug
      );

      if (existingDraft) {
        setOverwritePrompt({ entries: entriesToPersist, draftName: trimmedDraftName });
        setDraftNamePrompt(null);
        return;
      }

      if (!drafts.draftsDirectory) {
        return;
      }

      await drafts.saveDraft(drafts.draftsDirectory, {
        affaireName: trimmedAffaire || '',
        draftName: trimmedDraftName,
        entries: entriesToPersist
      }, false);
      navigate('/');
      setDraftNamePrompt(null);
    } catch (error) {
      console.error(t('errors.saveDraftError'), error);
    }
  }, [draftNamePrompt, draftNameInput, productForm, drafts, trimmedAffaire, navigate, t]);

  const confirmOverwriteSave = useCallback(async () => {
    if (!overwritePrompt || !drafts.draftsDirectory) {
      return;
    }
    try {
      await drafts.saveDraft(drafts.draftsDirectory, {
        affaireName: trimmedAffaire || '',
        draftName: overwritePrompt.draftName,
        entries: overwritePrompt.entries
      }, true);
      navigate('/');
    } catch (error) {
      console.error(t('errors.overwriteError'), error);
    } finally {
      setOverwritePrompt(null);
    }
  }, [overwritePrompt, drafts, trimmedAffaire, navigate, t]);

  const handleLoadDraft = useCallback(async (draftId: string) => {
    try {
      const data = await drafts.loadDraft(draftId);
      const loadedAffaireName = typeof data.affaireName === 'string' ? data.affaireName : '';
      setAffaireName(loadedAffaireName);
      productForm.setCompletedEntries(Array.isArray(data.entries) ? data.entries : []);
      productForm.resetFormState();
      navigate('/');
    } catch (error) {
      console.error(t('errors.loadDraftError'), error);
    }
  }, [drafts, productForm, navigate, t]);

  const handleDeleteDraft = useCallback(async (draftId: string) => {
    const draft = drafts.drafts.find((d) => d.id === draftId);
    const draftName = draft?.affaireName || '';

    if (!window.confirm(t('confirmations.deleteDraft', { name: draftName }))) {
      return;
    }

    try {
      await drafts.deleteDraft(draftId);
    } catch (error) {
      console.error(t('errors.deleteDraftError'), error);
    }
  }, [drafts, t]);

  const summaryForEntry = useCallback((entry: CompletedEntry) => {
    const allQuestions = [
      ...(entry.product.tableQuestions ?? []),
      ...(entry.product.normalQuestions ?? [])
    ];
    const responses = allQuestions
      .map((question) => {
        const answer = entry.answers[question.id]?.trim();
        if (!answer) {
          return null;
        }
        return `${question.label}: ${answer}`;
      })
      .filter(Boolean);

    return responses.length > 0 ? responses.join(' · ') : t('confirmations.noResponse');
  }, [t]);

  const contextValue: AppContextType = {
    affaireName,
    setAffaireName,
    selectedProductId: productForm.selectedProductId,
    setSelectedProductId: productForm.setSelectedProductId,
    selectedProduct: productForm.selectedProduct,
    currentAnswers: productForm.currentAnswers,
    setCurrentAnswers: productForm.setCurrentAnswers,
    activeEntryIndex: productForm.activeEntryIndex,
    setActiveEntryIndex: productForm.setActiveEntryIndex,
    completedEntries: productForm.completedEntries,
    setCompletedEntries: productForm.setCompletedEntries,
    resetFormState: productForm.resetFormState,
    selectProduct: productForm.selectProduct,
    buildEntriesWithCurrent: productForm.buildEntriesWithCurrent,
    editEntry: productForm.editEntry,
    deleteEntry: productForm.deleteEntry,
    answerChange: productForm.answerChange,
    draftsDirectory: drafts.draftsDirectory,
    setDraftsDirectory: drafts.setDraftsDirectory,
    drafts: drafts.drafts,
    draftsLoading: drafts.draftsLoading,
    draftsError: drafts.draftsError,
    isSavingDraft: drafts.isSavingDraft,
    canPersistDrafts: drafts.canPersistDrafts,
    electronAvailable: drafts.electronAvailable,
    refreshDrafts: drafts.refreshDrafts,
    chooseDraftsFolder: drafts.chooseDraftsFolder,
    saveDraft: drafts.saveDraft,
    loadDraft: drafts.loadDraft,
    deleteDraft: drafts.deleteDraft,
    navigate,
    handleStartInspection,
    handleRestart,
    handleReturnToMenu,
    handleDeleteEntry,
    handleSaveDraftClick,
    handleLoadDraft,
    handleDeleteDraft,
    draftNamePrompt,
    setDraftNamePrompt,
    draftNameInput,
    setDraftNameInput,
    overwritePrompt,
    setOverwritePrompt,
    confirmDraftNameSave,
    confirmOverwriteSave,
    summaryForEntry,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

