import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { ProductQuestion, TableRow } from '../utils/types';

// Champs attendus pour le format tableau
const TABLE_FIELDS = [
  'valeur',
  'nombre_mesure',
  'tolerance_plus',
  'tolerance_moins',
  'cote_nominal',
  'deviation',
  'type',
  'ref',
  'date_etalonnage'
];

const parseTableQuestions = (questions: ProductQuestion[]): TableRow[] => {
  const rowsMap = new Map<string, Partial<TableRow>>();
  
  questions.forEach(question => {
    const parts = question.id.split('_');
    if (parts.length < 2) return;
    
    const field = parts.slice(1).join('_');
    if (!TABLE_FIELDS.includes(field)) return;
    
    const identifier = parts[0];
    
    if (!rowsMap.has(identifier)) {
      rowsMap.set(identifier, { identifier, unit: 'mm' }); // Valeur par défaut
    }
    
    const row = rowsMap.get(identifier)!;
    (row as any)[field] = {
      id: question.id,
      helper: question.helper
    };
    
    // Si c'est la question "valeur" et qu'elle a une unité définie, l'utiliser
    if (field === 'valeur' && question.unit) {
      row.unit = question.unit;
    }
  });
  
  // Convertir en tableau et trier par identifiant
  const rows = Array.from(rowsMap.values()) as TableRow[];
  
  // Trier les identifiants de manière intelligente (ST01, ST02, ..., ST12, ST20, ST30, ST40)
  rows.sort((a, b) => {
    const aMatch = a.identifier.match(/^([A-Z]+)(\d+)$/);
    const bMatch = b.identifier.match(/^([A-Z]+)(\d+)$/);
    
    if (aMatch && bMatch) {
      const aPrefix = aMatch[1];
      const bPrefix = bMatch[1];
      const aNum = parseInt(aMatch[2], 10);
      const bNum = parseInt(bMatch[2], 10);
      
      if (aPrefix !== bPrefix) {
        return aPrefix.localeCompare(bPrefix);
      }
      return aNum - bNum;
    }
    
    return a.identifier.localeCompare(b.identifier);
  });
  
  return rows as TableRow[];
};

const FormEdit: React.FC = () => {
  const {
    selectedProduct,
    currentAnswers,
    answerChange,
    activeEntryIndex,
    handleDeleteEntry,
    handleReturnToMenu,
  } = useAppContext();

  if (!selectedProduct) {
    return null;
  }

  return (
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
        {selectedProduct.imagePath && (
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <img
              src={selectedProduct.imagePath}
              alt={selectedProduct.name}
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        {/* Section Tableau - Questions en format tableau */}
        {selectedProduct.tableQuestions && selectedProduct.tableQuestions.length > 0 && (
          <div className="measurement-table-wrapper" style={{ marginBottom: '1.5rem' }}>
            <table className="measurement-table">
              <thead>
                <tr>
                  <th>Identifiant</th>
                  <th>Cotes relevée / Measure</th>
                  <th>Unité / unit</th>
                  <th>Nombre de mesure(s)</th>
                  <th> Tolérance +</th>
                  <th> Tolérance -</th>
                  <th>Cote nominale</th>
                  <th>Deviation</th>
                  <th>Type</th>
                  <th>Réf</th>
                  <th>date de validité de l'étalonnage</th>
                </tr>
              </thead>
              <tbody>
                {parseTableQuestions(selectedProduct.tableQuestions).map((row) => {
                  return (
                    <tr key={row.identifier}>
                      <td className="identifier-cell">{row.identifier}</td>
                      <td className="measure-cell">
                        <input
                          type="text"
                          value={currentAnswers[row.valeur?.id ?? ''] ?? ''}
                          placeholder=""
                          onChange={(event) => answerChange(row.valeur?.id ?? '', event.target.value)}
                          className="table-input"
                        />
                      </td>
                      <td className="unit-cell">{row.unit}</td>
                      <td>
                        <input
                          type="text"
                          value={currentAnswers[row.nombre_mesure?.id ?? ''] ?? ''}
                          placeholder=""
                          onChange={(event) => answerChange(row.nombre_mesure?.id ?? '', event.target.value)}
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={currentAnswers[row.tolerance_plus?.id ?? ''] ?? ''}
                          placeholder=""
                          onChange={(event) => answerChange(row.tolerance_plus?.id ?? '', event.target.value)}
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={currentAnswers[row.tolerance_moins?.id ?? ''] ?? ''}
                          placeholder=""
                          onChange={(event) => answerChange(row.tolerance_moins?.id ?? '', event.target.value)}
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={currentAnswers[row.cote_nominal?.id ?? ''] ?? ''}
                          placeholder=""
                          onChange={(event) => answerChange(row.cote_nominal?.id ?? '', event.target.value)}
                          className="table-input"
                        />
                      </td>
                      <td className="deviation-cell">
                        <input
                          type="text"
                          value={currentAnswers[row.deviation?.id ?? ''] ?? ''}
                          placeholder=""
                          onChange={(event) => answerChange(row.deviation?.id ?? '', event.target.value)}
                          className="table-input"
                        />
                      </td>
                      <td className="type-cell">
                        <input
                          type="text"
                          value={currentAnswers[row.type?.id ?? ''] ?? ''}
                          placeholder=""
                          onChange={(event) => answerChange(row.type?.id ?? '', event.target.value)}
                          className="table-input"
                        />
                      </td>
                      <td className="ref-cell">
                        <input
                          type="text"
                          value={currentAnswers[row.ref?.id ?? ''] ?? ''}
                          placeholder=""
                          onChange={(event) => answerChange(row.ref?.id ?? '', event.target.value)}
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={currentAnswers[row.date_etalonnage?.id ?? ''] ?? ''}
                          placeholder=""
                          onChange={(event) => answerChange(row.date_etalonnage?.id ?? '', event.target.value)}
                          className="table-input"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Section Questions Normales - Choice, Checkboxes, text, textarea */}
        {selectedProduct.normalQuestions && selectedProduct.normalQuestions.length > 0 && (
          <div className="normal-questions-section">
            {selectedProduct.normalQuestions.map((question) => {
              if (question.type === 'choice' && question.options) {
                // Affichage spécial pour les choix multiples (3 options)
                return (
                  <div key={question.id} className="choice-question">
                    <div className="choice-label">{question.label}</div>
                    <div className="choice-options">
                      {question.options.map((option) => (
                        <label key={option.value} className="choice-option">
                          <input
                            type="radio"
                            name={question.id}
                            value={option.value}
                            checked={currentAnswers[question.id] === option.value}
                            onChange={(event) => answerChange(question.id, event.target.value)}
                            className="choice-radio"
                          />
                          <div className="choice-option-content">
                            <div className="choice-option-label">{option.label}</div>
                            {option.labelEn && (
                              <div className="choice-option-label-en">{option.labelEn}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }
              
              // Questions normales (text, textarea, checkbox)
              return (
                <label key={question.id} className="normal-question-label">
                  {question.label}
                  {question.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={currentAnswers[question.id] ?? ''}
                      placeholder="Saisissez votre réponse"
                      onChange={(event) => answerChange(question.id, event.target.value)}
                    />
                  ) : question.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={currentAnswers[question.id] === 'true' || currentAnswers[question.id] === 'on'}
                      onChange={(event) => answerChange(question.id, event.target.checked ? 'true' : 'false')}
                    />
                  ) : (
                    <input
                      type="text"
                      value={currentAnswers[question.id] ?? ''}
                      placeholder="Saisissez votre réponse"
                      onChange={(event) => answerChange(question.id, event.target.value)}
                    />
                  )}
                  {question.helper && <span className="muted">{question.helper}</span>}
                </label>
              );
            })}
          </div>
        )}

        <div className="actions-row">
          {activeEntryIndex !== null && (
            <button
              className="ghost-btn"
              onClick={() => handleDeleteEntry(activeEntryIndex)}
              style={{ marginRight: 'auto' }}
            >
              Supprimer ce produit
            </button>
          )}
          <button
            className="primary-btn"
            onClick={handleReturnToMenu}
          >
            Retour au menu
          </button>
        </div>
      </section>
  );
};

export default FormEdit;
