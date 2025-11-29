import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface OverwriteModalProps {
  isOpen: boolean;
  draftName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const OverwriteModal: React.FC<OverwriteModalProps> = ({
  isOpen,
  draftName,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{t('modals.overwrite.title')}</h3>
        <p className="muted">
          {t('modals.overwrite.description', { name: draftName })}
        </p>
        <div className="actions-row" style={{ marginTop: '1rem' }}>
          <button className="secondary-btn" onClick={onCancel}>
            {t('common.cancel')}
          </button>
          <button className="primary-btn" onClick={onConfirm}>
            {t('modals.overwrite.replace')}
          </button>
        </div>
      </div>
    </div>
  );
};

