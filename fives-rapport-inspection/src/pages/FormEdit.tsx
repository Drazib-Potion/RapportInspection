import React from 'react';
import type { FormEditProps } from '../utils/types';

const FormEdit: React.FC<FormEditProps> = ({
  step,
  products,
  selectedProduct,
  onSelectProduct,
  onReturnToDrafts,
  currentAnswers,
  onAnswerChange,
  saveProductAnswers,
  onSaveDraft,
  activeEntryIndex,
  completedEntries,
  onEditEntry,
  onDeleteEntry,
  canPersistDrafts,
  hasPendingEntry,
  isSavingDraft
}) => (
  <>
    {step === 'productSelection' && (
      <section>
        <div className="product-grid">
          {products.map((product) => (
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
              <button className="primary-btn" onClick={() => onSelectProduct(product)}>
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
                  onChange={(event) => onAnswerChange(question.id, event.target.value)}
                />
              ) : (
                <input
                  type="text"
                  value={currentAnswers[question.id] ?? ''}
                  placeholder="Saisissez votre réponse"
                  onChange={(event) => onAnswerChange(question.id, event.target.value)}
                />
              )}
              {question.helper && <span className="muted">{question.helper}</span>}
            </label>
          ))}
        </div>
        <div className="actions-row">
          {activeEntryIndex !== null && (
            <button
              className="ghost-btn"
              onClick={() => onDeleteEntry(activeEntryIndex)}
              style={{ marginRight: 'auto' }}
            >
              Supprimer ce produit
            </button>
          )}
          {/* <button className="secondary-btn" onClick={() => void saveProductAnswers(true)}>
            {activeEntryIndex !== null ? 'Enregistrer et ajouter' : 'Ajouter un autre produit'}
          </button> */}
          <button
            className="primary-btn"
            onClick={onReturnToDrafts}
          >
            Retour au menu
          </button>
        </div>
        {!canPersistDrafts && (
          <p className="warning-text">
            Sélectionnez un dossier de brouillons dans le menu principal pour activer « Terminer le
            rapport ».
          </p>
        )}
      </section>
    )}
  </>
);

export default FormEdit;
