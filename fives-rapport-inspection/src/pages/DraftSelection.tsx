import React from 'react';
import type { DraftSelectionProps } from '../utils/types';

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
        <button className="primary-btn" onClick={onStartInspection} disabled={!canStart}>
          {startButtonLabel}
        </button>
        {!draftsDirectory && (
          <p className="warning-text" style={{ fontSize: '0.9rem', color: '#856404', textAlign: 'center' }}>
            Sélectionnez d'abord un dossier de brouillons
          </p>
        )}
        {completedEntries.length > 0 && (
          <button className="ghost-btn" onClick={onRestart}>
            Nouvelle affaire
          </button>
        )}
        {completedEntries.length > 0 && (
          <button className="ghost-btn" onClick={onSaveDraft}>
            Enregistrer le brouillon
          </button>
        )}
      </div>

      {completedEntries.length > 0 && (
        <section className="products-section" style={{ gridColumn: '1 / -1' }}>
          <h2>Produits saisis</h2>
          <div className="product-grid products-list" style={{ marginTop: '1rem' }}>
            {completedEntries.map((entry, index) => (
              <article key={`${entry.product.id}-${index}`} className="product-card">
                <div className="product-header">
                  <div>
                    <h3>{entry.product.name}</h3>
                    {entry.product.reference && (
                      <p className="product-reference">{entry.product.reference}</p>
                    )}
                  </div>
                  {/* <span className="product-id">{entry.product.id}</span> */}
                </div>
                <p className="muted">{summaryForEntry(entry)}</p>
                <button className="ghost-btn" onClick={() => onEditEntry(index)}>
                  Modifier ce produit
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>}
  </>
  );
};

export default DraftSelection;
