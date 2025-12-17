import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonClass?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  confirmButtonClass = 'primary-btn',
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{title}</h3>
        <p className="muted">
          {description}
        </p>
        <div className="actions-row" style={{ marginTop: '1rem' }}>
          <button className="secondary-btn" onClick={onCancel}>
            {cancelLabel || t('common.cancel')}
          </button>
          <button className={confirmButtonClass} onClick={onConfirm}>
            {confirmLabel || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

