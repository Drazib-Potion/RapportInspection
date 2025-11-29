import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Remplacer le brouillon ?</h3>
        <p className="muted">
          Un brouillon nommé « {draftName} » existe déjà. Souhaitez-vous le
          remplacer ?
        </p>
        <div className="actions-row" style={{ marginTop: '1rem' }}>
          <button className="secondary-btn" onClick={onCancel}>
            Annuler
          </button>
          <button className="primary-btn" onClick={onConfirm}>
            Remplacer
          </button>
        </div>
      </div>
    </div>
  );
};

