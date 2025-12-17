import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonClass?: string;
  inputField?: {
    defaultValue: string;
    placeholder: string;
    validate?: (value: string) => boolean;
  };
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
  inputField,
}) => {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState(inputField?.defaultValue || '');

  useEffect(() => {
    if (isOpen && inputField) {
      setInputValue(inputField.defaultValue);
    }
  }, [isOpen, inputField]);

  if (!isOpen) return null;

  const isValid = inputField 
    ? (inputField.validate ? inputField.validate(inputValue) : inputValue.trim().length > 0)
    : true;

  const handleConfirm = () => {
    if (inputField) {
      onConfirm(inputValue.trim());
    } else {
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleConfirm();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{title}</h3>
        <p className="muted">
          {description}
        </p>
        {inputField && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputField.placeholder}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '1rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        )}
        <div className="actions-row" style={{ marginTop: '1rem' }}>
          <button className="secondary-btn" onClick={onCancel}>
            {cancelLabel || t('common.cancel')}
          </button>
          <button 
            className={confirmButtonClass} 
            onClick={handleConfirm}
            disabled={!isValid}
          >
            {confirmLabel || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

