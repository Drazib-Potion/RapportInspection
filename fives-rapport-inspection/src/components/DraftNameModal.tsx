import React from 'react';

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
        <h3>Nom du brouillon</h3>
        <p className="muted">Donnez un nom à ce brouillon :</p>
        <input
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Ex. Chantier Îlot A"
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
            Annuler
          </button>
          <button
            className="primary-btn"
            onClick={() => onConfirm(draftName.trim())}
            disabled={!draftName.trim()}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

