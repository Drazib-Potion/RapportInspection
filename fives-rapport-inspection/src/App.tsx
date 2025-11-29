import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import MainMenu from './pages/MainMenu';
import ProductSelection from './pages/ProductSelection';
import FormEdit from './pages/FormEdit';
import { generateProductId, PRODUCT_CATALOG } from './utils/productData';
import type {
  ProductDefinition,
  CompletedEntry,
  DraftSummary,
  ElectronBridge,
  OverwritePrompt,
  DraftNamePrompt
} from './utils/types';

const createQuestionDefaults = (product: ProductDefinition) => {
  const allQuestions = [
    ...(product.tableQuestions ?? []),
    ...(product.normalQuestions ?? [])
  ];
  return allQuestions.reduce<Record<string, string>>((acc, question) => {
    acc[question.id] = '';
    return acc;
  }, {});
};

declare global {
  interface Window {
    electron?: ElectronBridge;
  }
}

function AppContent() {
  const navigate = useNavigate();
  const [affaireName, setAffaireName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [completedEntries, setCompletedEntries] = useState<CompletedEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeEntryIndex, setActiveEntryIndex] = useState<number | null>(null);
  const [draftsDirectory, setDraftsDirectory] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [draftsError, setDraftsError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [overwritePrompt, setOverwritePrompt] = useState<OverwritePrompt | null>(null);
  const [draftNamePrompt, setDraftNamePrompt] = useState<DraftNamePrompt | null>(null);
  const [draftNameInput, setDraftNameInput] = useState('');

  const trimmedAffaire = affaireName.trim();
  const selectedProduct = PRODUCT_CATALOG.find(
    (product) => product.id === selectedProductId
  );

  const refreshDrafts = useCallback(
    async (directory: string) => {
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
    },
    []
  );

  useEffect(() => {
    if (!draftsDirectory) {
      setDrafts([]);
      return;
    }

    void refreshDrafts(draftsDirectory);
  }, [draftsDirectory, refreshDrafts]);

  const resetFormState = () => {
    setSelectedProductId(null);
    setCurrentAnswers({});
    setActiveEntryIndex(null);
  };

  const handleStartInspection = () => {
    if (!trimmedAffaire) {
      setStatusMessage("Saisissez d'abord le nom de l'affaire pour démarrer le rapport.");
      return;
    }
    resetFormState();
    navigate('/form');
    setStatusMessage("Choisissez un produit pour l'inspection.");
  };

  const handleSelectProduct = (product: ProductDefinition) => {
    setSelectedProductId(product.id);
    setCurrentAnswers(createQuestionDefaults(product));
    setActiveEntryIndex(null);
    navigate(`/form/${product.id}`);
    setStatusMessage(`Questionnaire dédié à ${product.name}.`);
  };

  const electronAvailable = typeof window !== 'undefined' && Boolean(window.electron);
  const canPersistDrafts = Boolean(draftsDirectory && electronAvailable && window.electron?.saveDraft);

  const handleChooseDraftsFolder = async () => {
    if (!window.electron?.chooseDraftsFolder) {
      setStatusMessage('La sauvegarde locale nécessite l’application desktop.');
      return;
    }

    const directory = await window.electron.chooseDraftsFolder();
    if (!directory) {
      setStatusMessage('Sélection du dossier annulée.');
      return;
    }

    setDraftsDirectory(directory);
    setStatusMessage(`Dossier des brouillons sélectionné : ${directory}`);
  };

  const handleClearDraftsDirectory = () => {
    setDraftsDirectory(null);
    setDrafts([]);
    setStatusMessage('Dossier de brouillons désélectionné.');
  };

  const persistDraft = async (entries: CompletedEntry[], draftName: string, overwrite = false) => {
    if (!draftsDirectory || !window.electron?.saveDraft) {
      const error = new Error('Sélectionnez un dossier de brouillons avant de sauvegarder.');
      setStatusMessage(error.message);
      throw error;
    }

    setIsSavingDraft(true);
    try {
      await window.electron.saveDraft(draftsDirectory, {
        affaireName: trimmedAffaire || '',
        draftName: draftName,
        entries
      }, overwrite);
      await refreshDrafts(draftsDirectory);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon', error);
      setStatusMessage("Impossible d'enregistrer le brouillon.");
      throw error;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleEditEntry = (index: number) => {
    const entry = completedEntries[index];
    setSelectedProductId(entry.product.id);
    setCurrentAnswers({ ...entry.answers });
    setActiveEntryIndex(index);
    navigate(`/form/${entry.product.id}`);
    setStatusMessage(`Modification de ${entry.product.name}.`);
  };

  const handleDeleteEntry = (index: number) => {
    setCompletedEntries((prev) => prev.filter((_, idx) => idx !== index));
    resetFormState();
    setStatusMessage('Produit supprimé du brouillon.');
    navigate('/');
  };

  const handleEditEntryFromDrafts = (index: number) => {
    handleEditEntry(index);
  };

  const handleLoadDraft = async (draftId: string) => {
    if (!window.electron?.loadDraft) {
      setStatusMessage('Chargement des brouillons indisponible hors application desktop.');
      return;
    }

    try {
      const data = await window.electron.loadDraft(draftId);
      // Charger le nom d'affaire depuis le brouillon (pas le nom du brouillon)
      const loadedAffaireName = typeof data.affaireName === 'string' ? data.affaireName : '';
      const draftName = typeof (data as { draftName?: string }).draftName === 'string' 
        ? (data as { draftName: string }).draftName 
        : (typeof data.affaireName === 'string' ? data.affaireName : 'Sans nom');
      setAffaireName(loadedAffaireName);
      setCompletedEntries(Array.isArray(data.entries) ? data.entries : []);
      resetFormState();
      navigate('/');
      setStatusMessage(`Brouillon « ${draftName} » chargé.`);
    } catch (error) {
      console.error('Erreur lors du chargement du brouillon', error);
      setStatusMessage('Impossible de charger ce brouillon.');
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!window.electron?.deleteDraft) {
      setStatusMessage('Suppression des brouillons indisponible hors application desktop.');
      return;
    }

    if (!draftsDirectory) {
      setStatusMessage('Aucun dossier de brouillons sélectionné.');
      return;
    }

    const draft = drafts.find((d) => d.id === draftId);
    const draftName = draft?.affaireName || 'ce brouillon';

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le brouillon « ${draftName} » ?`)) {
      return;
    }

    try {
      await window.electron.deleteDraft(draftId);
      await refreshDrafts(draftsDirectory);
      setStatusMessage(`Brouillon « ${draftName} » supprimé avec succès.`);
    } catch (error) {
      console.error('Erreur lors de la suppression du brouillon', error);
      setStatusMessage('Impossible de supprimer ce brouillon.');
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setCurrentAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const buildEntriesWithCurrent = (): CompletedEntry[] => {
    if (!selectedProduct) {
      return completedEntries;
    }

    const entry: CompletedEntry = {
      product: selectedProduct,
      answers: currentAnswers
    };

    if (activeEntryIndex === null) {
      return [...completedEntries, entry];
    }

    return completedEntries.map((existingEntry, index) =>
      index === activeEntryIndex ? entry : existingEntry
    );
  };

  const saveProductAnswers = async (returnToSelection: boolean) => {
    if (!selectedProduct) {
      return;
    }

    const currentProduct = selectedProduct;
    const wasEditing = activeEntryIndex !== null;
    const nextEntries = buildEntriesWithCurrent();

    setCompletedEntries(nextEntries);
    resetFormState();

    if (returnToSelection) {
      navigate('/form');
      setStatusMessage(
        `${currentProduct.name} ${wasEditing ? 'mis à jour' : 'ajouté'} à ${
          trimmedAffaire || "l'affaire en cours"
        }.`
      );
      return;
    }

    navigate('/');
    setStatusMessage(
      wasEditing
        ? `${currentProduct.name} mis à jour. Cliquez sur « Enregistrer le brouillon » pour conserver vos changements.`
        : `Rapport ${trimmedAffaire || 'en cours'} prêt. Cliquez sur « Enregistrer le brouillon » pour le sauvegarder.`
    );
  };

  const handleSaveDraftClick = async (forceOverwrite = false) => {
    try {
      const entriesToPersist = buildEntriesWithCurrent();

      if (!entriesToPersist.length) {
        setStatusMessage("Ajoutez au moins un produit avant d'enregistrer le brouillon.");
        return;
      }

      // Afficher la modale pour demander le nom du brouillon
      const defaultName = trimmedAffaire || 'Brouillon sans nom';
      setDraftNameInput(defaultName);
      setDraftNamePrompt({ entries: entriesToPersist, defaultName });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon', error);
    }
  };

  const confirmDraftNameSave = async () => {
    if (!draftNamePrompt) {
      return;
    }

    const trimmedDraftName = draftNameInput.trim();
    if (!trimmedDraftName) {
      setStatusMessage('Le nom du brouillon ne peut pas être vide.');
      return;
    }

    try {
      const entriesToPersist = draftNamePrompt.entries;
      setCompletedEntries(entriesToPersist);
      resetFormState();

      const slug = generateProductId(trimmedDraftName);
      const existingDraft = drafts.some(
        (draft) => {
          // Comparer avec le nom du brouillon (affaireName dans DraftSummary contient le draftName)
          return generateProductId(draft.affaireName) === slug;
        }
      );

      if (existingDraft) {
        setOverwritePrompt({ entries: entriesToPersist, draftName: trimmedDraftName });
        setDraftNamePrompt(null);
        return;
      }

      await persistDraft(entriesToPersist, trimmedDraftName, false);
      navigate('/');
      setStatusMessage('Brouillon enregistré avec succès.');
      setDraftNamePrompt(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon', error);
    }
  };

  const confirmOverwriteSave = async () => {
    if (!overwritePrompt) {
      return;
    }
    try {
      await persistDraft(overwritePrompt.entries, overwritePrompt.draftName, true);
      navigate('/');
      setStatusMessage(`Brouillon « ${overwritePrompt.draftName} » remplacé avec succès.`);
    } catch (error) {
      console.error('Erreur lors du remplacement du brouillon', error);
    } finally {
      setOverwritePrompt(null);
    }
  };

  const handleReturnToMenu = () => {
    // Sauvegarder le produit actuel s'il y en a un avant de réinitialiser
    const hasCurrentProduct = Boolean(selectedProduct);
    const currentProduct = selectedProduct;
    const wasEditing = activeEntryIndex !== null;
    
    if (hasCurrentProduct && currentProduct) {
      const nextEntries = buildEntriesWithCurrent();
      setCompletedEntries(nextEntries);
      setStatusMessage(
        `${currentProduct.name} ${wasEditing ? 'mis à jour' : 'ajouté'} avant de revenir au menu.`
      );
    } else {
      setStatusMessage('Retour au menu principal.');
    }
    
    resetFormState();
    navigate('/');
  };

  const handleRestart = () => {
    setCompletedEntries([]);
    setAffaireName('');
    resetFormState();
    setStatusMessage('Nouvelle affaire prête à être saisie.');
    navigate('/');
  };

  const summaryForEntry = (entry: CompletedEntry) => {
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

    return responses.length > 0 ? responses.join(' · ') : 'Aucune réponse fournie.';
  };

  // Wrapper component pour accéder aux params de route
  const FormEditWrapper = () => {
    const { productId } = useParams<{ productId: string }>();
    
    // Récupérer le produit depuis le catalogue ou le state
    const productFromUrl = productId ? PRODUCT_CATALOG.find(p => p.id === productId) : null;
    const productFromState = selectedProduct;
    
    // Utiliser le produit de l'URL si disponible, sinon celui du state
    const currentProduct = productFromUrl || productFromState || null;
    
    // Si le produit de l'URL existe mais n'est pas dans le state, l'initialiser
    React.useEffect(() => {
      if (productFromUrl && selectedProductId !== productFromUrl.id) {
        setSelectedProductId(productFromUrl.id);
        setCurrentAnswers(createQuestionDefaults(productFromUrl));
        setActiveEntryIndex(null);
      }
    }, [productFromUrl]);
    
    // Si le produit n'existe pas, rediriger
    React.useEffect(() => {
      if (productId && !currentProduct) {
        navigate('/form');
      }
    }, [productId, currentProduct]);

    return (
      <FormEdit
        selectedProduct={currentProduct}
        onReturnToDrafts={handleReturnToMenu}
        currentAnswers={currentAnswers}
        onAnswerChange={handleAnswerChange}
        activeEntryIndex={activeEntryIndex}
        onDeleteEntry={handleDeleteEntry}
      />
    );
  };

  return (
    <div className="app-shell">
      <Routes>
        <Route
          path="/"
          element={
            <MainMenu
              affaireName={affaireName}
              onAffaireNameChange={setAffaireName}
              canStart={Boolean(trimmedAffaire && draftsDirectory)}
              startButtonLabel={
                completedEntries.length > 0 ? 'Ajouter un autre produit' : "Démarrer l'inspection"
              }
              onStartInspection={handleStartInspection}
              onRestart={handleRestart}
              onSaveDraft={() => handleSaveDraftClick(false)}
              completedEntries={completedEntries}
              onEditEntry={handleEditEntryFromDrafts}
              summaryForEntry={summaryForEntry}
              draftsDirectory={draftsDirectory}
              drafts={drafts}
              draftsLoading={draftsLoading}
              draftsError={draftsError}
              electronAvailable={electronAvailable}
              onChooseDraftsFolder={handleChooseDraftsFolder}
              onClearDraftsDirectory={handleClearDraftsDirectory}
              onLoadDraft={handleLoadDraft}
              onDeleteDraft={handleDeleteDraft}
            />
          }
        />
        <Route
          path="/form"
          element={
            <ProductSelection
              products={PRODUCT_CATALOG}
              onSelectProduct={handleSelectProduct}
              onReturnToDrafts={handleReturnToMenu}
            />
          }
        />
        <Route
          path="/form/:productId"
          element={<FormEditWrapper />}
        />
      </Routes>
      {draftNamePrompt && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Nom du brouillon</h3>
            <p className="muted">Donnez un nom à ce brouillon :</p>
            <input
              type="text"
              value={draftNameInput}
              onChange={(e) => setDraftNameInput(e.target.value)}
              placeholder="Ex. Chantier Îlot A"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '1rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void confirmDraftNameSave();
                }
              }}
              autoFocus
            />
            <div className="actions-row" style={{ marginTop: '1rem' }}>
              <button
                className="secondary-btn"
                onClick={() => {
                  setDraftNamePrompt(null);
                  setDraftNameInput('');
                }}
              >
                Annuler
              </button>
              <button
                className="primary-btn"
                onClick={confirmDraftNameSave}
                disabled={!draftNameInput.trim()}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
      {overwritePrompt && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Remplacer le brouillon ?</h3>
            <p className="muted">
              Un brouillon nommé « {overwritePrompt.draftName} » existe déjà. Souhaitez-vous le
              remplacer ?
            </p>
            <div className="actions-row" style={{ marginTop: '1rem' }}>
              <button className="secondary-btn" onClick={() => setOverwritePrompt(null)}>
                Annuler
              </button>
              <button className="primary-btn" onClick={confirmOverwriteSave}>
                Remplacer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
