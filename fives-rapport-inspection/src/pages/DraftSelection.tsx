import React from 'react';
import type { DraftSelectionProps, CompletedEntry } from '../utils/types';

// Helper pour obtenir le label d'une question de type choice
const getChoiceLabel = (entry: CompletedEntry, questionId: string): string | null => {
  const question = entry.product.normalQuestions?.find(q => q.id === questionId);
  if (!question || question.type !== 'choice' || !question.options) {
    return null;
  }
  
  const answerValue = entry.answers[questionId];
  if (!answerValue) {
    return null;
  }
  
  const option = question.options.find(opt => opt.value === answerValue);
  return option ? option.label : null;
};

// Helper pour obtenir la couleur de bordure selon l'avancement
const getAvancementColor = (entry: CompletedEntry): { border: string; dot: string } | null => {
  const avancementValue = entry.answers['avancement_fabrication'];
  if (!avancementValue) {
    return null;
  }
  
  switch (avancementValue) {
    case 'conforme_plans':
      return { border: '#4CAF50', dot: '#4CAF50' }; // Vert
    case 'en_retard':
      return { border: '#FFC107', dot: '#FFC107' }; // Jaune
    case 'critique':
      return { border: '#F44336', dot: '#F44336' }; // Rouge
    default:
      return null;
  }
};

const DraftSelection: React.FC<DraftSelectionProps> = ({
  affaireName,
  onAffaireNameChange,
  canStart,
  startButtonLabel,
  onStartInspection,
  onRestart,
  onSaveDraft,
  completedEntries,
  onEditEntry,
  summaryForEntry,
  draftsDirectory,
  drafts,
  draftsLoading,
  draftsError,
  electronAvailable,
  onChooseDraftsFolder,
  onClearDraftsDirectory,
  onLoadDraft,
  onDeleteDraft
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredDrafts = drafts.filter((draft) =>
    draft.affaireName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
  
  <section className="drafts-panel">
      <div className="drafts-header">
        <div>
          <h3>Brouillons locaux</h3>
          <p className="muted">
            {draftsDirectory
              ? `Dossier sélectionné : ${draftsDirectory}`
              : '⚠️ Sélectionnez un dossier de brouillons pour commencer. Cette étape est obligatoire.'}
          </p>
          {!electronAvailable && (
            <p className="warning-text">Fonction disponible uniquement dans l’application desktop.</p>
          )}
        </div>
        <div className="drafts-actions">
          <button className="ghost-btn" onClick={onChooseDraftsFolder}>
            Choisir un dossier
          </button>
          {draftsDirectory && (
            <button className="ghost-btn" onClick={onClearDraftsDirectory}>
              Effacer
            </button>
          )}
        </div>
      </div>
      {draftsError && <p className="warning-text">{draftsError}</p>}
      <div className="draft-search">
        <input
          type="text"
          placeholder="Rechercher un brouillon"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        {searchTerm && (
          <button
            className="ghost-btn"
            type="button"
            onClick={() => setSearchTerm('')}
          >
            Effacer
          </button>
        )}
      </div>
      {draftsLoading ? (
        <p className="muted">Chargement des brouillons…</p>
      ) : filteredDrafts.length === 0 ? (
        <p className="muted">
          {draftsDirectory
            ? 'Aucun brouillon dans ce dossier pour le moment.'
            : 'Choisissez un dossier pour voir vos brouillons.'}
        </p>
      ) : (
        <div className="drafts-list scrollable">
          {filteredDrafts.map((draft) => (
            <article key={draft.id} className="draft-card">
              <div>
                <h3>{draft.affaireName}</h3>
                <p className="muted">
                  {draft.productCount} produit(s) · {new Date(draft.updatedAt).toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="primary-btn" onClick={() => onLoadDraft(draft.id)}>
                  Charger
                </button>
                <button className="ghost-btn" onClick={() => onDeleteDraft(draft.id)}>
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
    <br />
    <br />
    {draftsDirectory && <section className="affaire-card">
      <div>
        <h2>1. Identifiez l'affaire</h2>
        <p className="muted">Ce nom accompagnera tous les produits inspectés.</p>
        {completedEntries.length > 0 && (
          <button className="ghost-btn" onClick={onRestart}>
            Nouvelle affaire
          </button>
        )}
      </div>
      {!draftsDirectory && (
        <div className="warning-text" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
          ⚠️ Vous devez d'abord sélectionner un dossier de brouillons pour pouvoir démarrer une inspection.
        </div>
      )}
      <label className="affaire-input">
        <span>Nom de l'affaire</span>
        <input
          type="text"
          value={affaireName}
          placeholder={draftsDirectory ? "Ex. Chantier Îlot A" : "Sélectionnez d'abord un dossier de brouillons"}
          onChange={(event) => onAffaireNameChange(event.target.value)}
          disabled={!draftsDirectory}
          style={{ opacity: draftsDirectory ? 1 : 0.5 }}
        />
      </label>
      <div className="actions-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
        <button className="primary-btn" disabled={!canStart}>
          <img 
            src="/excel-icon.png" 
            alt="Excel" 
            style={{ 
              width: '20px', 
              height: '20px', 
              marginRight: '0.5rem',
              verticalAlign: 'middle'
            }} 
          />
          Export Excel
        </button>
        {!draftsDirectory && (
          <p className="warning-text" style={{ fontSize: '0.9rem', color: '#856404', textAlign: 'center' }}>
            Sélectionnez d'abord un dossier de brouillons
          </p>
        )}
        {completedEntries.length > 0 && (
          <button className="ghost-btn" onClick={onSaveDraft}>
            Enregistrer le brouillon
          </button>
        )}
        <button className="ghost-btn" onClick={onStartInspection} disabled={!canStart}>
          {startButtonLabel}
        </button>
      </div>

      {completedEntries.length > 0 && (
        <section className="products-section" style={{ gridColumn: '1 / -1' }}>
          <h2>Produits saisis</h2>
          <div className="legend" style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            marginTop: '0.75rem', 
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#F9F9F9',
            borderRadius: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: '#4CAF50',
                border: '2px solid #4CAF50'
              }} />
              <span><strong>CONFORME AUX PLANS</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: '#FFC107',
                border: '2px solid #FFC107'
              }} />
              <span><strong>EN RETARD</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: '#F44336',
                border: '2px solid #F44336'
              }} />
              <span><strong>CRITIQUE</strong></span>
            </div>
          </div>
          <div className="product-grid products-list" style={{ marginTop: '1rem' }}>
            {completedEntries.map((entry, index) => {
              const avancementColor = getAvancementColor(entry);
              return (
                <article 
                  key={`${entry.product.id}-${index}`} 
                  className="product-card"
                  style={{
                    border: avancementColor ? `2px solid ${avancementColor.border}` : undefined,
                    position: 'relative'
                  }}
                >
                  {avancementColor && (
                    <div 
                      className="status-dot"
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: avancementColor.dot
                      }}
                    />
                  )}
                  <div className="product-header">
                    <div>
                      <h3>{entry.product.name}</h3>
                      {entry.product.reference && (
                        <p className="product-reference">{entry.product.reference}</p>
                      )}
                    </div>
                    {/* <span className="product-id">{entry.product.id}</span> */}
                  </div>
                  <div className="product-choices" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                    {getChoiceLabel(entry, 'etat_visuel') && (
                      <p style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>
                        <strong>État visuel :</strong> {getChoiceLabel(entry, 'etat_visuel')}
                      </p>
                    )}
                    {getChoiceLabel(entry, 'avancement_fabrication') && (
                      <p style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>
                        <strong>Avancement :</strong> {getChoiceLabel(entry, 'avancement_fabrication')}
                      </p>
                    )}
                  </div>
                  {/* <p className="muted">{summaryForEntry(entry)}</p> */}
                  <button className="ghost-btn" onClick={() => onEditEntry(index)}>
                    Modifier ce produit
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </section>}
  </>
  );
};

export default DraftSelection;
