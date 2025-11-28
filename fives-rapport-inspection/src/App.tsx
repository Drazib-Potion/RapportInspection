import React, { useState } from 'react';
import './App.css';

type Step = 'affaire' | 'productSelection' | 'productForm';

type ProductQuestion = {
  id: string;
  label: string;
  helper?: string;
  type: 'text' | 'textarea';
};

type ProductDefinition = {
  id: string;
  name: string;
  reference?: string;
  description: string;
  questions: ProductQuestion[];
};

const generateProductId = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');

const defaultQuestions: ProductQuestion[] = [
  {
    id: 'dimensions',
    label: 'Dimensions (mm)',
    helper: 'Longueur x Largeur x Profondeur',
    type: 'text'
  },
  {
    id: 'observation',
    label: 'Observation',
    helper: 'Notes, anomalies ou remarques',
    type: 'textarea'
  },
  {
    id: 'statut',
    label: 'Statut de conformité',
    helper: 'Conforme ou Non conforme',
    type: 'text'
  }
];

const PRODUCT_CATALOG: ProductDefinition[] = [
  {
    id: generateProductId('JEU EMBOUT COMPLET'),
    name: 'JEU EMBOUT COMPLET',
    description: 'Inspection du jeu d\'embout complet',
    questions: defaultQuestions
  },
  {
    id: generateProductId('STABILISATEUR'),
    name: 'STABILISATEUR',
    description: 'Inspection du stabilisateur',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ENSEMBLE STABILISATEUR'),
    name: 'ENSEMBLE STABILISATEUR',
    description: 'Inspection de l\'ensemble stabilisateur',
    questions: defaultQuestions
  },
  {
    id: generateProductId('EMBOUT CHARBON'),
    name: 'EMBOUT CHARBON',
    description: 'Inspection de l\'embout charbon',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ROSACE GAZ'),
    name: 'ROSACE GAZ',
    description: 'Inspection de la rosace gaz',
    questions: defaultQuestions
  },
  {
    id: generateProductId('SUPPORT ROSACE GAZ'),
    name: 'SUPPORT ROSACE GAZ',
    description: 'Inspection du support rosace gaz',
    questions: defaultQuestions
  },
  {
    id: generateProductId('VIROLE DE COMMANDE GAZ'),
    name: 'VIROLE DE COMMANDE GAZ',
    description: 'Inspection de la virole de commande gaz',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ROSACE AIR FIXE'),
    name: 'ROSACE AIR FIXE',
    description: 'Inspection de la rosace air fixe',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ROSACE AIR MOBILE'),
    name: 'ROSACE AIR MOBILE',
    description: 'Inspection de la rosace air mobile',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ENSEMBLE 2 ROSACES'),
    name: 'ENSEMBLE 2 ROSACES',
    description: 'Inspection de l\'ensemble 2 rosaces',
    questions: defaultQuestions
  },
  {
    id: generateProductId('PION DE COMMANDE'),
    name: 'PION DE COMMANDE',
    description: 'Inspection du pion de commande',
    questions: defaultQuestions
  },
  {
    id: generateProductId('SUPPORT ROSACE AIR'),
    name: 'SUPPORT ROSACE AIR',
    description: 'Inspection du support rosace air',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ENSEMBLE ROSACE AIR'),
    name: 'ENSEMBLE ROSACE AIR',
    description: 'Inspection de l\'ensemble rosace air',
    questions: defaultQuestions
  },
  {
    id: generateProductId('VIROLE DE COMMANDE AIR'),
    name: 'VIROLE DE COMMANDE AIR',
    description: 'Inspection de la virole de commande air',
    questions: defaultQuestions
  },
  {
    id: generateProductId('EMBOUT BI-CHANNEL'),
    name: 'EMBOUT BI-CHANNEL',
    description: 'Inspection de l\'embout bi-channel',
    questions: defaultQuestions
  },
  {
    id: generateProductId('VIROLE BI-CHANNEL'),
    name: 'VIROLE BI-CHANNEL',
    description: 'Inspection de la virole bi-channel',
    questions: defaultQuestions
  },
  {
    id: generateProductId('SEGMENT'),
    name: 'SEGMENT',
    description: 'Inspection du segment',
    questions: defaultQuestions
  },
  {
    id: generateProductId('EMBOUT AIR PERCE'),
    name: 'EMBOUT AIR PERCE',
    description: 'Inspection de l\'embout air percé',
    questions: defaultQuestions
  },
  {
    id: generateProductId('INSERT'),
    name: 'INSERT',
    description: 'Inspection de l\'insert',
    questions: defaultQuestions
  },
  {
    id: generateProductId('BOUCLIER EMBOUT AIR'),
    name: 'BOUCLIER EMBOUT AIR',
    description: 'Inspection du bouclier embout air',
    questions: defaultQuestions
  },
  {
    id: generateProductId('PION EMBOUT AIR'),
    name: 'PION EMBOUT AIR',
    description: 'Inspection du pion embout air',
    questions: defaultQuestions
  },
  {
    id: generateProductId('VIROLE AIR'),
    name: 'VIROLE AIR',
    description: 'Inspection de la virole air',
    questions: defaultQuestions
  }
];

const createQuestionDefaults = (questions: ProductQuestion[]) =>
  questions.reduce<Record<string, string>>((acc, question) => {
    acc[question.id] = '';
    return acc;
  }, {});

type CompletedEntry = {
  product: ProductDefinition;
  answers: Record<string, string>;
};

function App() {
  const [step, setStep] = useState<Step>('affaire');
  const [affaireName, setAffaireName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [completedEntries, setCompletedEntries] = useState<CompletedEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const trimmedAffaire = affaireName.trim();
  const selectedProduct = PRODUCT_CATALOG.find(
    (product) => product.id === selectedProductId
  );

  const resetFormState = () => {
    setSelectedProductId(null);
    setCurrentAnswers({});
  };

  const handleStartInspection = () => {
    if (!trimmedAffaire) {
      setStatusMessage('Saisissez d’abord le nom de l’affaire pour démarrer le rapport.');
      return;
    }
    resetFormState();
    setStep('productSelection');
    setStatusMessage('Choisissez un produit pour l’inspection.');
  };

  const handleSelectProduct = (product: ProductDefinition) => {
    setSelectedProductId(product.id);
    setCurrentAnswers(createQuestionDefaults(product.questions));
    setStep('productForm');
    setStatusMessage(`Questionnaire dédié à ${product.name}.`);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setCurrentAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const saveProductAnswers = (returnToSelection: boolean) => {
    if (!selectedProduct) {
      return;
    }

    setCompletedEntries((prev) => [
      ...prev,
      {
        product: selectedProduct,
        answers: currentAnswers
      }
    ]);

    resetFormState();

    if (returnToSelection) {
      setStep('productSelection');
      setStatusMessage(`${selectedProduct.name} ajouté à ${trimmedAffaire || 'l’affaire en cours'}.`);
      return;
    }

    setStep('affaire');
    setStatusMessage(`Rapport ${trimmedAffaire || 'en cours'} prêt. Vous pouvez lancer un nouveau rapport ou revoir les produits ajoutés.`);
  };

  const handleReturnToMenu = () => {
    resetFormState();
    setStep('affaire');
    setStatusMessage('Retour au menu principal.');
  };

  const handleRestart = () => {
    setCompletedEntries([]);
    setAffaireName('');
    resetFormState();
    setStatusMessage('Nouvelle affaire prête à être saisie.');
    setStep('affaire');
  };

  const summaryForEntry = (entry: CompletedEntry) => {
    const responses = entry.product.questions
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Rapport de conformité</p>
          <h1>Création d’un rapport d’inspection</h1>
          <p className="subtitle">
            Donnez un nom d’affaire, sélectionnez le produit et répondez aux questions spécifiques demandées.
          </p>
        </div>
      </header>

      {statusMessage && <p className="status-text">{statusMessage}</p>}

      {step === 'affaire' && (
        <section className="affaire-card">
          <div>
            <h2>1. Identifiez l’affaire</h2>
            <p className="muted">Ce nom accompagnera tous les produits inspectés.</p>
          </div>
          <label className="affaire-input">
            <span>Nom de l’affaire</span>
            <input
              type="text"
              value={affaireName}
              placeholder="Ex. Chantier Îlot A"
              onChange={(event) => setAffaireName(event.target.value)}
            />
          </label>
          <div className="actions-row">
            <button
              className="primary-btn"
              onClick={handleStartInspection}
              disabled={!trimmedAffaire}
            >
              Démarrer l’inspection
            </button>
            {completedEntries.length > 0 && (
              <button className="secondary-btn" onClick={handleRestart}>
                Nouvelle affaire
              </button>
            )}
          </div>

          {completedEntries.length > 0 && (
            <div className="product-grid" style={{ marginTop: '1.5rem' }}>
              {completedEntries.map((entry, index) => (
                <article key={`${entry.product.id}-${index}`} className="product-card">
                  <div className="product-header">
                    <div>
                      <h3>{entry.product.name}</h3>
                      {entry.product.reference && (
                        <p className="product-reference">{entry.product.reference}</p>
                      )}
                    </div>
                    <span className="product-id">{entry.product.id}</span>
                  </div>
                  <p className="muted">
                    {summaryForEntry(entry)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {step === 'productSelection' && (
        <section>
          <div className="actions-row" style={{ marginBottom: '1rem' }}>
            <button className="secondary-btn" onClick={handleReturnToMenu}>
              Revenir au menu
            </button>
          </div>
          <div className="product-grid">
            {PRODUCT_CATALOG.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-header">
                  <div>
                    <h3>{product.name}</h3>
                    <p className="muted">{product.description}</p>
                    {product.reference && (
                      <p className="product-reference">{product.reference}</p>
                    )}
                  </div>
                  <span className="product-id">{product.id}</span>
                </div>
                <div className="field-group">
                  <p>
                    Questions à répondre : <strong>{product.questions.length}</strong>
                  </p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => handleSelectProduct(product)}
                >
                  Choisir ce produit
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {step === 'productForm' && selectedProduct && (
        <section className="product-card">
          <div className="product-header">
            <div>
              <h2>{selectedProduct.name}</h2>
              {selectedProduct.reference && (
                <p className="product-reference">{selectedProduct.reference}</p>
              )}
            </div>
            <span className="product-id">{selectedProduct.id}</span>
          </div>
          <p className="muted">{selectedProduct.description}</p>
          <div className="field-group">
            {selectedProduct.questions.map((question) => (
              <label key={question.id}>
                {question.label}
                {question.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={currentAnswers[question.id] ?? ''}
                    placeholder="Saisissez votre réponse"
                    onChange={(event) =>
                      handleAnswerChange(question.id, event.target.value)
                    }
                  />
                ) : (
                  <input
                    type="text"
                    value={currentAnswers[question.id] ?? ''}
                    placeholder="Saisissez votre réponse"
                    onChange={(event) =>
                      handleAnswerChange(question.id, event.target.value)
                    }
                  />
                )}
                {question.helper && <span className="muted">{question.helper}</span>}
              </label>
            ))}
          </div>
          <div className="actions-row">
            <button
              className="secondary-btn"
              onClick={() => saveProductAnswers(true)}
            >
              Ajouter un autre produit
            </button>
            <button
              className="primary-btn"
              onClick={() => saveProductAnswers(false)}
            >
              Terminer le rapport
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
