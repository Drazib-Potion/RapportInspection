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

// Génère les questions pour le stabilisateur avec tous les champs ST
const generateStabilisateurQuestions = (): ProductQuestion[] => {
  const questions: ProductQuestion[] = [];
  const stFields = [
    'ST01', 'ST02', 'ST03', 'ST04', 'ST05', 'ST06',
    'ST07', 'ST08', 'ST09', 'ST10', 'ST11', 'ST12',
    'ST20', 'ST30', 'ST40'
  ];

  stFields.forEach((stField) => {
    const isST03 = stField === 'ST03';
    
    // Valeur (float sauf ST03 qui est int)
    questions.push({
      id: `${stField}_valeur`,
      label: `${stField} - Valeur`,
      helper: isST03 ? 'Entier attendu' : 'Chiffre à virgule attendu',
      type: 'text'
    });

    // Nombre de mesure (int)
    questions.push({
      id: `${stField}_nombre_mesure`,
      label: `${stField} - Nombre de mesure`,
      helper: 'Entier attendu',
      type: 'text'
    });

    // Tolérance + (float)
    questions.push({
      id: `${stField}_tolerance_plus`,
      label: `${stField} - Tolérance +`,
      helper: 'Chiffre à virgule attendu',
      type: 'text'
    });

    // Tolérance - (float)
    questions.push({
      id: `${stField}_tolerance_moins`,
      label: `${stField} - Tolérance -`,
      helper: 'Chiffre à virgule attendu',
      type: 'text'
    });

    // Cote nominal (float)
    questions.push({
      id: `${stField}_cote_nominal`,
      label: `${stField} - Cote nominal`,
      helper: 'Chiffre à virgule attendu',
      type: 'text'
    });

    // Déviation (int)
    questions.push({
      id: `${stField}_deviation`,
      label: `${stField} - Déviation`,
      helper: 'Entier attendu',
      type: 'text'
    });

    // Type (text libre)
    questions.push({
      id: `${stField}_type`,
      label: `${stField} - Type`,
      helper: 'Texte libre',
      type: 'text'
    });

    // Ref (text libre)
    questions.push({
      id: `${stField}_ref`,
      label: `${stField} - Ref`,
      helper: 'Texte libre',
      type: 'text'
    });

    // Date de validité de l'étalonnage (text libre)
    questions.push({
      id: `${stField}_date_etalonnage`,
      label: `${stField} - Date de validité de l'étalonnage`,
      helper: 'Texte libre',
      type: 'text'
    });
  });

  return questions;
};

export const PRODUCT_CATALOG: ProductDefinition[] = [
  {
    id: generateProductId('JEU EMBOUT COMPLET'),
    name: 'JEU EMBOUT COMPLET',
    description: 'Inspection du jeu d\'embout complet',
    questions: defaultQuestions,
    imagePath: '/productImg/jeu-embout-complet.svg'
  },
  {
    id: generateProductId('STABILISATEUR'),
    name: 'STABILISATEUR',
    description: 'Inspection du stabilisateur',
    questions: generateStabilisateurQuestions(),
    imagePath: '/productImg/stabilisateur.svg'
  },
  {
    id: generateProductId('ENSEMBLE STABILISATEUR'),
    name: 'ENSEMBLE STABILISATEUR',
    description: 'Inspection de l\'ensemble stabilisateur',
    questions: defaultQuestions,
    imagePath: '/productImg/ensemble-stabilisateur.svg'
  },
  {
    id: generateProductId('EMBOUT CHARBON'),
    name: 'EMBOUT CHARBON',
    description: 'Inspection de l\'embout charbon',
    questions: defaultQuestions,
    imagePath: '/productImg/embout-charbon.svg'
  },
  {
    id: generateProductId('ROSACE GAZ'),
    name: 'ROSACE GAZ',
    description: 'Inspection de la rosace gaz',
    questions: defaultQuestions,
    imagePath: '/productImg/rosace-gaz.svg'
  },
  {
    id: generateProductId('SUPPORT ROSACE GAZ'),
    name: 'SUPPORT ROSACE GAZ',
    description: 'Inspection du support rosace gaz',
    questions: defaultQuestions,
    imagePath: '/productImg/support-rosace-gaz.svg'
  },
  {
    id: generateProductId('VIROLE DE COMMANDE GAZ'),
    name: 'VIROLE DE COMMANDE GAZ',
    description: 'Inspection de la virole de commande gaz',
    questions: defaultQuestions,
    imagePath: '/productImg/virole-de-commande-gaz.svg'
  },
  {
    id: generateProductId('ROSACE AIR FIXE'),
    name: 'ROSACE AIR FIXE',
    description: 'Inspection de la rosace air fixe',
    questions: defaultQuestions,
    imagePath: '/productImg/rosace-air-fixe.svg'
  },
  {
    id: generateProductId('ROSACE AIR MOBILE'),
    name: 'ROSACE AIR MOBILE',
    description: 'Inspection de la rosace air mobile',
    questions: defaultQuestions,
    imagePath: '/productImg/rosace-air-mobile.svg'
  },
  {
    id: generateProductId('ENSEMBLE 2 ROSACES'),
    name: 'ENSEMBLE 2 ROSACES',
    description: 'Inspection de l\'ensemble 2 rosaces',
    questions: defaultQuestions,
    imagePath: '/productImg/ensemble-2-rosaces.svg'
  },
  {
    id: generateProductId('PION DE COMMANDE'),
    name: 'PION DE COMMANDE',
    description: 'Inspection du pion de commande',
    questions: defaultQuestions,
    imagePath: '/productImg/pion-de-commande.svg'
  },
  {
    id: generateProductId('SUPPORT ROSACE AIR'),
    name: 'SUPPORT ROSACE AIR',
    description: 'Inspection du support rosace air',
    questions: defaultQuestions,
    imagePath: '/productImg/support-rosace-air.svg'
  },
  {
    id: generateProductId('ENSEMBLE ROSACE AIR'),
    name: 'ENSEMBLE ROSACE AIR',
    description: 'Inspection de l\'ensemble rosace air',
    questions: defaultQuestions,
    imagePath: '/productImg/ensemble-rosace-air.svg'
  },
  {
    id: generateProductId('VIROLE DE COMMANDE AIR'),
    name: 'VIROLE DE COMMANDE AIR',
    description: 'Inspection de la virole de commande air',
    questions: defaultQuestions,
    imagePath: '/productImg/virole-de-commande-air.svg'
  },
  {
    id: generateProductId('EMBOUT BI-CHANNEL'),
    name: 'EMBOUT BI-CHANNEL',
    description: 'Inspection de l\'embout bi-channel',
    questions: defaultQuestions,
    imagePath: '/productImg/embout-bi-channel.svg'
  },
  {
    id: generateProductId('VIROLE BI-CHANNEL'),
    name: 'VIROLE BI-CHANNEL',
    description: 'Inspection de la virole bi-channel',
    questions: defaultQuestions,
    imagePath: '/productImg/virole-bi-channel.svg'
  },
  {
    id: generateProductId('SEGMENT'),
    name: 'SEGMENT',
    description: 'Inspection du segment',
    questions: defaultQuestions,
    imagePath: '/productImg/segment.svg'
  },
  {
    id: generateProductId('EMBOUT AIR PERCE'),
    name: 'EMBOUT AIR PERCE',
    description: 'Inspection de l\'embout air percé',
    questions: defaultQuestions,
    imagePath: '/productImg/embout-air-perce.svg'
  },
  {
    id: generateProductId('INSERT'),
    name: 'INSERT',
    description: 'Inspection de l\'insert',
    questions: defaultQuestions,
    imagePath: '/productImg/insert.svg'
  },
  {
    id: generateProductId('BOUCLIER EMBOUT AIR'),
    name: 'BOUCLIER EMBOUT AIR',
    description: 'Inspection du bouclier embout air',
    questions: defaultQuestions,
    imagePath: '/productImg/bouclier-embout-air.svg'
  },
  {
    id: generateProductId('PION EMBOUT AIR'),
    name: 'PION EMBOUT AIR',
    description: 'Inspection du pion embout air',
    questions: defaultQuestions,
    imagePath: '/productImg/pion-embout-air.svg'
  },
  {
    id: generateProductId('VIROLE AIR'),
    name: 'VIROLE AIR',
    description: 'Inspection de la virole air',
    questions: defaultQuestions,
    imagePath: '/productImg/virole-air.svg'
  }
];