import { ProductDefinition, ProductQuestion } from './types';

export const generateProductId = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');

const defaultQuestions: ProductQuestion[] = [
  {
    id: 'dimensions',
    label: 'Dimensions (mm)',
    helper: 'Longueur x Largeur x Profondeur',
    type: 'text'
  },
  {
    id: 'observation',
    label: 'Observation',
    helper: 'Notes, anomalies ou remarques',
    type: 'textarea'
  },
  {
    id: 'statut',
    label: 'Statut de conformité',
    helper: 'Conforme ou Non conforme',
    type: 'text'
  }
];

export const PRODUCT_CATALOG: ProductDefinition[] = [
  {
    id: generateProductId('JEU EMBOUT COMPLET'),
    name: 'JEU EMBOUT COMPLET',
    description: 'Inspection du jeu d\'embout complet',
    questions: defaultQuestions
  },
  {
    id: generateProductId('STABILISATEUR'),
    name: 'STABILISATEUR',
    description: 'Inspection du stabilisateur',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ENSEMBLE STABILISATEUR'),
    name: 'ENSEMBLE STABILISATEUR',
    description: 'Inspection de l\'ensemble stabilisateur',
    questions: defaultQuestions
  },
  {
    id: generateProductId('EMBOUT CHARBON'),
    name: 'EMBOUT CHARBON',
    description: 'Inspection de l\'embout charbon',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ROSACE GAZ'),
    name: 'ROSACE GAZ',
    description: 'Inspection de la rosace gaz',
    questions: defaultQuestions
  },
  {
    id: generateProductId('SUPPORT ROSACE GAZ'),
    name: 'SUPPORT ROSACE GAZ',
    description: 'Inspection du support rosace gaz',
    questions: defaultQuestions
  },
  {
    id: generateProductId('VIROLE DE COMMANDE GAZ'),
    name: 'VIROLE DE COMMANDE GAZ',
    description: 'Inspection de la virole de commande gaz',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ROSACE AIR FIXE'),
    name: 'ROSACE AIR FIXE',
    description: 'Inspection de la rosace air fixe',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ROSACE AIR MOBILE'),
    name: 'ROSACE AIR MOBILE',
    description: 'Inspection de la rosace air mobile',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ENSEMBLE 2 ROSACES'),
    name: 'ENSEMBLE 2 ROSACES',
    description: 'Inspection de l\'ensemble 2 rosaces',
    questions: defaultQuestions
  },
  {
    id: generateProductId('PION DE COMMANDE'),
    name: 'PION DE COMMANDE',
    description: 'Inspection du pion de commande',
    questions: defaultQuestions
  },
  {
    id: generateProductId('SUPPORT ROSACE AIR'),
    name: 'SUPPORT ROSACE AIR',
    description: 'Inspection du support rosace air',
    questions: defaultQuestions
  },
  {
    id: generateProductId('ENSEMBLE ROSACE AIR'),
    name: 'ENSEMBLE ROSACE AIR',
    description: 'Inspection de l\'ensemble rosace air',
    questions: defaultQuestions
  },
  {
    id: generateProductId('VIROLE DE COMMANDE AIR'),
    name: 'VIROLE DE COMMANDE AIR',
    description: 'Inspection de la virole de commande air',
    questions: defaultQuestions
  },
  {
    id: generateProductId('EMBOUT BI-CHANNEL'),
    name: 'EMBOUT BI-CHANNEL',
    description: 'Inspection de l\'embout bi-channel',
    questions: defaultQuestions
  },
  {
    id: generateProductId('VIROLE BI-CHANNEL'),
    name: 'VIROLE BI-CHANNEL',
    description: 'Inspection de la virole bi-channel',
    questions: defaultQuestions
  },
  {
    id: generateProductId('SEGMENT'),
    name: 'SEGMENT',
    description: 'Inspection du segment',
    questions: defaultQuestions
  },
  {
    id: generateProductId('EMBOUT AIR PERCE'),
    name: 'EMBOUT AIR PERCE',
    description: 'Inspection de l\'embout air percé',
    questions: defaultQuestions
  },
  {
    id: generateProductId('INSERT'),
    name: 'INSERT',
    description: 'Inspection de l\'insert',
    questions: defaultQuestions
  },
  {
    id: generateProductId('BOUCLIER EMBOUT AIR'),
    name: 'BOUCLIER EMBOUT AIR',
    description: 'Inspection du bouclier embout air',
    questions: defaultQuestions
  },
  {
    id: generateProductId('PION EMBOUT AIR'),
    name: 'PION EMBOUT AIR',
    description: 'Inspection du pion embout air',
    questions: defaultQuestions
  },
  {
    id: generateProductId('VIROLE AIR'),
    name: 'VIROLE AIR',
    description: 'Inspection de la virole air',
    questions: defaultQuestions
  }
];