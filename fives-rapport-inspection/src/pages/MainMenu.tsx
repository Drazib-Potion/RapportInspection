import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { CompletedEntry } from '../utils/types';

// Helper pour obtenir le label d'une question de type choice traduit avec i18n
const getChoiceLabel = (entry: CompletedEntry, questionId: string, t: (key: string) => string): string | null => {
  const answerValue = entry.answers[questionId];
  if (!answerValue) {
    return null;
  }
  
  // Mapping des valeurs vers les clés de traduction
  const valueToTranslationKey: Record<string, string> = {
    'bon': 'products.options.good',
    'moyen': 'products.options.average',
    'mauvais': 'products.options.bad',
    'conforme_plans': 'products.options.conformePlans',
    'en_retard': 'products.options.late',
    'critique': 'products.options.critical',
  };
  
  const translationKey = valueToTranslationKey[answerValue];
  return translationKey ? t(translationKey) : answerValue;
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

const MainMenu: React.FC = () => {
  const {
    affaireName,
    setAffaireName,
    controleIntermediaire,
    setControleIntermediaire,
    controleFinal,
    setControleFinal,
    completedEntries,
    draftsDirectory,
    drafts,
    draftsLoading,
    draftsError,
    electronAvailable,
    chooseDraftsFolder,
    setDraftsDirectory,
    handleStartInspection,
    handleRestart,
    handleSaveDraftClick,
    handleLoadDraft,
    handleDeleteDraft,
    editEntry,
  } = useAppContext();

  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredDrafts = drafts.filter((draft) =>
    draft.affaireName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trimmedAffaire = affaireName.trim();
  const canStart = Boolean(trimmedAffaire && draftsDirectory);
  const canExport = Boolean(trimmedAffaire && draftsDirectory && completedEntries.length > 0);
  const startButtonLabel = completedEntries.length > 0 
    ? t('mainMenu.addAnotherProduct') 
    : t('mainMenu.startInspection');

  const handleChooseDraftsFolder = async () => {
    try {
      await chooseDraftsFolder();
    } catch (error) {
      console.error('Erreur lors de la sélection du dossier', error);
    }
  };

  const handleClearDraftsDirectory = () => {
    setDraftsDirectory(null);
  };

  const handleEditEntry = (index: number) => {
    editEntry(index);
    navigate(`/form/${completedEntries[index].product.id}`);
  };

  const handleExportPDF = async () => {
    if (!electronAvailable || !window.electron?.exportPDF) {
      alert(t('mainMenu.desktopOnly'));
      return;
    }

    if (!canExport) {
      return;
    }

    try {
      await window.electron.exportPDF({
        affaireName,
        controleIntermediaire,
        controleFinal,
        entries: completedEntries
      });
    } catch (error) {
      console.error('Erreur lors de l\'export PDF', error);
      alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
    }
  };

  return (
    <>
      <section className="drafts-panel">
        <div className="drafts-header">
          <div>
            <h3>{t('mainMenu.title')}</h3>
            <p className="muted">
              {draftsDirectory
                ? t('mainMenu.folderSelected', { folder: draftsDirectory })
                : t('mainMenu.selectFolderWarning')}
            </p>
            {!electronAvailable && (
              <p className="warning-text">{t('mainMenu.desktopOnly')}</p>
            )}
          </div>
          <div className="drafts-actions">
            <button className="ghost-btn" onClick={handleChooseDraftsFolder}>
              {t('mainMenu.chooseFolder')}
            </button>
            {draftsDirectory && (
              <button className="ghost-btn" onClick={handleClearDraftsDirectory}>
                {t('mainMenu.clearFolder')}
              </button>
            )}
          </div>
        </div>
        {draftsError && <p className="warning-text">{draftsError}</p>}
        <div className="draft-search">
          <input
            type="text"
            placeholder={t('mainMenu.searchPlaceholder')}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm && (
            <button
              className="ghost-btn"
              type="button"
              onClick={() => setSearchTerm('')}
            >
              {t('common.clear')}
            </button>
          )}
        </div>
        {draftsLoading ? (
          <p className="muted">{t('mainMenu.loadingDrafts')}</p>
        ) : filteredDrafts.length === 0 ? (
          <p className="muted">
            {draftsDirectory
              ? t('mainMenu.noDraftsInFolder')
              : t('mainMenu.chooseFolderToSeeDrafts')}
          </p>
        ) : (
          <div className="drafts-list scrollable">
            {filteredDrafts.map((draft) => (
              <article key={draft.id} className="draft-card">
                <div>
                  <h3>{draft.affaireName}</h3>
                  <p className="muted">
                    {t('mainMenu.productsCount', { count: draft.productCount })} · {new Date(draft.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="primary-btn" onClick={() => handleLoadDraft(draft.id)}>
                    {t('common.load')}
                  </button>
                  <button className="ghost-btn" onClick={() => handleDeleteDraft(draft.id)}>
                    {t('common.delete')}
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
          <h2>{t('mainMenu.identifyAffaire')}</h2>
          <p className="muted">{t('mainMenu.affaireDescription')}</p>
          {completedEntries.length > 0 && (
            <button className="ghost-btn" onClick={handleRestart}>
              {t('mainMenu.newAffaire')}
            </button>
          )}
        </div>
        {!draftsDirectory && (
          <div className="warning-text" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
            {t('mainMenu.selectFolderWarning')}
          </div>
        )}
        <div>
          <label className="affaire-input">
            <span>{t('mainMenu.affaireNameLabel')}</span>
            <input
              type="text"
              value={affaireName}
              placeholder={draftsDirectory ? t('mainMenu.affaireNamePlaceholder') : t('mainMenu.affaireNamePlaceholderDisabled')}
              onChange={(event) => setAffaireName(event.target.value)}
              disabled={!draftsDirectory}
              style={{ opacity: draftsDirectory ? 1 : 0.5 }}
            />
          </label>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: draftsDirectory ? 'pointer' : 'not-allowed', opacity: draftsDirectory ? 1 : 0.5 }}>
              <input
                type="checkbox"
                checked={controleIntermediaire}
                onChange={(event) => {
                  if (draftsDirectory) {
                    setControleIntermediaire(event.target.checked);
                    if (event.target.checked) {
                      setControleFinal(false);
                    }
                  }
                }}
                disabled={!draftsDirectory}
              />
              <span>{t('mainMenu.controleIntermediaire')}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: draftsDirectory ? 'pointer' : 'not-allowed', opacity: draftsDirectory ? 1 : 0.5 }}>
              <input
                type="checkbox"
                checked={controleFinal}
                onChange={(event) => {
                  if (draftsDirectory) {
                    setControleFinal(event.target.checked);
                    if (event.target.checked) {
                      setControleIntermediaire(false);
                    }
                  }
                }}
                disabled={!draftsDirectory}
              />
              <span>{t('mainMenu.controleFinal')}</span>
            </label>
          </div>
        </div>
        <div className="actions-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
          <button className="primary-btn" onClick={handleExportPDF} disabled={!canExport}>
            <span style={{ marginRight: '0.5rem' }}>📄</span>
            {t('mainMenu.exportPDF')}
          </button>
          {!draftsDirectory && (
            <p className="warning-text" style={{ fontSize: '0.9rem', color: '#856404', textAlign: 'center' }}>
              {t('mainMenu.selectFolderFirst')}
            </p>
          )}
          {completedEntries.length > 0 && (
            <button className="ghost-btn" onClick={handleSaveDraftClick}>
              {t('mainMenu.saveDraft')}
            </button>
          )}
          <button className="ghost-btn" onClick={handleStartInspection} disabled={!canStart}>
            {startButtonLabel}
          </button>
        </div>

        {completedEntries.length > 0 && (
          <section className="products-section" style={{ gridColumn: '1 / -1' }}>
            <h2>{t('mainMenu.completedProducts')}</h2>
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
                <span><strong>{t('mainMenu.conformePlans')}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: '#FFC107',
                  border: '2px solid #FFC107'
                }} />
                <span><strong>{t('mainMenu.enRetard')}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: '#F44336',
                  border: '2px solid #F44336'
                }} />
                <span><strong>{t('mainMenu.critique')}</strong></span>
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
                    </div>
                    <div className="product-choices" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                      {getChoiceLabel(entry, 'etat_visuel', t) && (
                        <p style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>
                          <strong>{t('mainMenu.visualState')}</strong> {getChoiceLabel(entry, 'etat_visuel', t)}
                        </p>
                      )}
                      {getChoiceLabel(entry, 'avancement_fabrication', t) && (
                        <p style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>
                          <strong>{t('mainMenu.progress')}</strong> {getChoiceLabel(entry, 'avancement_fabrication', t)}
                        </p>
                      )}
                    </div>
                    <button className="ghost-btn" onClick={() => handleEditEntry(index)}>
                      {t('mainMenu.modifyProduct')}
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

export default MainMenu;
