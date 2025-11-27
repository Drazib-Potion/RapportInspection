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

const PRODUCT_CATALOG: ProductDefinition[] = [
  {
    id: 'porte-rideau',
    name: 'Porte-rideau coupe-feu',
    reference: 'PR-01',
    description:
      'Structure, jointures et motorisation doivent être inspectées en phase finale.',
    questions: [
      {
        id: 'alignement',
        label: 'Alignement vertical (mm)',
        helper: 'Tolérance : ±2 mm.',
        type: 'text'
      },
      {
        id: 'joints',
        label: 'Intégrité des joints coupe-feu',
        helper: 'Rechercher fissures, manques ou adhésifs décollés.',
        type: 'textarea'
      },
      {
        id: 'commande',
        label: 'Test de la commande motorisée',
        helper: 'Vérifier réponse < 2 secondes et arrêt en cas d’obstacle.',
        type: 'textarea'
      }
    ]
  },
  {
    id: 'tapis-convoyeur',
    name: 'Tapis convoyeur modulaire',
    reference: 'TC-23',
    description:
      'Rouleaux, tensions et sécurités du convoyeur doivent être validés.',
    questions: [
      {
        id: 'rouleaux',
        label: 'État des rouleaux (usure, bruit)',
        type: 'textarea'
      },
      {
        id: 'tension',
        label: 'Tension maximale mesurée (N)',
        helper: 'Prendre la mesure après 5 minutes de montée en charge.',
        type: 'text'
      },
      {
        id: 'capteurs',
        label: 'Capteurs de présence et arrêts d’urgence',
        type: 'textarea'
      }
    ]
  },
  {
    id: 'escaliers',
    name: 'Escaliers métalliques',
    reference: 'ES-11',
    description:
      'Planéité des marches, fixations, garde-corps et ancrages sont critiques.',
    questions: [
      {
        id: 'ecart-marches',
        label: 'Écart de niveau entre marches (mm)',
        type: 'text'
      },
      {
        id: 'fixations',
        label: 'Fixations et visserie inspectées',
        type: 'textarea'
      },
      {
        id: 'garde-corps',
        label: 'Hauteur et rigidité du garde-corps',
        helper: 'Hauteur minimale 1 mètre, aucune oscillation.',
        type: 'textarea'
      }
    ]
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
