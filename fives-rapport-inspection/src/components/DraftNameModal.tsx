import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface DraftNameModalProps {
  isOpen: boolean;
  defaultName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const DraftNameModal: React.FC<DraftNameModalProps> = ({
  isOpen,
  defaultName,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();
  const [draftName, setDraftName] = React.useState(defaultName);

  React.useEffect(() => {
    if (isOpen) {
      setDraftName(defaultName);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{t('modals.draftName.title')}</h3>
        <p className="muted">{t('modals.draftName.description')}</p>
        <input
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder={t('modals.draftName.placeholder')}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginTop: '1rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draftName.trim()) {
              onConfirm(draftName.trim());
            }
          }}
          autoFocus
        />
        <div className="actions-row" style={{ marginTop: '1rem' }}>
          <button
            className="secondary-btn"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </button>
          <button
            className="primary-btn"
            onClick={() => onConfirm(draftName.trim())}
            disabled={!draftName.trim()}
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

