import type { TableRow } from './types';

/**
 * Valide et formate une valeur pour qu'elle soit un nombre décimal valide
 * @param value - La valeur à valider
 * @returns La valeur formatée avec une virgule, ou null si invalide
 */
export const validateDecimalInput = (value: string): string | null => {
  // Permet les valeurs vides pour permettre la suppression
  if (value === '' || value === '-') {
    return value;
  }
  
  // Remplace la virgule par un point pour le traitement
  const normalizedValue = value.replace(',', '.');
  
  // Vérifie si c'est un nombre décimal valide
  const decimalRegex = /^-?\d*\.?\d*$/;
  if (decimalRegex.test(normalizedValue)) {
    // Remplace le point par une virgule pour l'affichage
    return normalizedValue.replace('.', ',');
  }
  
  return null;
};

/**
 * Calcule la déviation à partir de la cote nominale et de la valeur mesurée
 * @param coteNominal - La cote nominale (string avec virgule ou point)
 * @param valeur - La valeur mesurée (string avec virgule ou point)
 * @param precision - Nombre de décimales (par défaut 3)
 * @returns La déviation calculée formatée avec une virgule, ou une chaîne vide si invalide
 */
export const calculateDeviation = (
  coteNominal: string,
  valeur: string,
  precision: number = 3
): string => {
  if (!coteNominal || !valeur) {
    return '';
  }
  
  // Convertir les virgules en points pour le calcul
  const valeurNum = parseFloat(valeur.replace(',', '.'));
  const coteNominalNum = parseFloat(coteNominal.replace(',', '.'));
  
  if (isNaN(valeurNum) || isNaN(coteNominalNum)) {
    return '';
  }
  
  const deviation = coteNominalNum - valeurNum;
  // Formater avec une virgule pour l'affichage
  return deviation.toFixed(precision).replace('.', ',');
};

/**
 * Calcule la déviation à partir d'une ligne de tableau
 * @param row - La ligne du tableau contenant les IDs des champs
 * @param currentAnswers - Les réponses actuelles
 * @param precision - Nombre de décimales (par défaut 3)
 * @returns La déviation calculée formatée avec une virgule, ou une chaîne vide si invalide
 */
export const calculateDeviationFromRow = (
  row: TableRow,
  currentAnswers: Record<string, string>,
  precision: number = 3
): string => {
  const valeurId = row.valeur?.id ?? '';
  const coteNominalId = row.cote_nominal?.id ?? '';
  
  const valeurStr = currentAnswers[valeurId] ?? '';
  const coteNominalStr = currentAnswers[coteNominalId] ?? '';
  
  return calculateDeviation(coteNominalStr, valeurStr, precision);
};

/**
 * Met à jour la déviation dans les réponses
 * @param row - La ligne du tableau contenant les IDs des champs
 * @param currentAnswers - Les réponses actuelles
 * @param answerChange - Fonction pour mettre à jour les réponses
 * @param precision - Nombre de décimales (par défaut 3)
 */
export const updateDeviation = (
  row: TableRow,
  currentAnswers: Record<string, string>,
  answerChange: (questionId: string, value: string) => void,
  precision: number = 3
): void => {
  const valeurId = row.valeur?.id ?? '';
  const coteNominalId = row.cote_nominal?.id ?? '';
  const deviationId = row.deviation?.id ?? '';
  
  if (!deviationId) return;
  
  const valeurStr = currentAnswers[valeurId] ?? '';
  const coteNominalStr = currentAnswers[coteNominalId] ?? '';
  
  if (!valeurStr || !coteNominalStr) {
    answerChange(deviationId, '');
    return;
  }
  
  const deviationStr = calculateDeviation(coteNominalStr, valeurStr, precision);
  answerChange(deviationId, deviationStr);
};

/**
 * Vérifie si une valeur mesurée est dans les tolérances par rapport à la cote nominale
 * @param valeur - La valeur mesurée (string avec virgule ou point)
 * @param coteNominal - La cote nominale (string avec virgule ou point)
 * @param tolerancePlus - La tolérance positive (string avec virgule ou point)
 * @param toleranceMoins - La tolérance négative (string avec virgule ou point)
 * @returns true si la valeur est dans les tolérances (inclus), false sinon
 */
export const isWithinTolerance = (
  valeur: string,
  coteNominal: string,
  tolerancePlus: string,
  toleranceMoins: string
): boolean => {
  if (!valeur || !coteNominal) {
    return false;
  }
  
  // Convertir les virgules en points pour le calcul
  const valeurNum = parseFloat(valeur.replace(',', '.'));
  const coteNominalNum = parseFloat(coteNominal.replace(',', '.'));
  
  if (isNaN(valeurNum) || isNaN(coteNominalNum)) {
    return false;
  }
  
  // Si les tolérances ne sont pas définies, on considère que c'est valide
  const tolerancePlusNum = tolerancePlus ? parseFloat(tolerancePlus.replace(',', '.')) : 0;
  const toleranceMoinsNum = toleranceMoins ? parseFloat(toleranceMoins.replace(',', '.')) : 0;
  
  // Calculer les bornes
  const minValue = coteNominalNum - toleranceMoinsNum;
  const maxValue = coteNominalNum + tolerancePlusNum;
  
  // Vérifier si la valeur est dans l'intervalle [minValue, maxValue] (inclus)
  return valeurNum >= minValue && valeurNum <= maxValue;
};

/**
 * Gère la saisie d'un nombre décimal et met à jour la déviation si nécessaire
 * @param questionId - L'ID de la question
 * @param value - La valeur saisie
 * @param answerChange - Fonction pour mettre à jour les réponses
 * @param row - La ligne du tableau (optionnel, pour mettre à jour la déviation)
 * @param currentAnswers - Les réponses actuelles (optionnel, pour mettre à jour la déviation)
 * @param precision - Nombre de décimales pour la déviation (par défaut 3)
 */
export const handleDecimalInput = (
  questionId: string,
  value: string,
  answerChange: (questionId: string, value: string) => void,
  row?: TableRow,
  currentAnswers?: Record<string, string>,
  precision: number = 3
): void => {
  const validatedValue = validateDecimalInput(value);
  
  if (validatedValue !== null) {
    answerChange(questionId, validatedValue);
    
    // Mettre à jour la déviation si nécessaire
    // On crée une copie de currentAnswers avec la nouvelle valeur pour le calcul
    if (row && currentAnswers) {
      const updatedAnswers = { ...currentAnswers, [questionId]: validatedValue };
      updateDeviation(row, updatedAnswers, answerChange, precision);
    }
  }
};

