import { ProductDefinition, ProductQuestion } from './types';

export const generateProductId = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');

const generateStabilisateurTableQuestions = (): ProductQuestion[] => {
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
      type: 'text',
      unit: isST03 ? 'nbre' : 'mm'
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

const generateEmboutCharbonTableQuestions = (): ProductQuestion[] => {
  const questions: ProductQuestion[] = [];
  const ecFields = [
    'EC01', 'EC02', 'EC03', 'EC04', 'EC05', 'EC06',
    'EC07', 'EC08', 'EC09', 'EC10'
  ];

  ecFields.forEach((ecField) => {
    // Valeur (float)
    // EC09 et EC10 ont une unité spéciale (*)
    const isEC09orEC10 = ecField === 'EC09' || ecField === 'EC10';
    questions.push({
      id: `${ecField}_valeur`,
      label: `${ecField} - Valeur`,
      helper: 'Chiffre à virgule attendu',
      type: 'text',
      unit: isEC09orEC10 ? '*' : 'mm'
    });

    // Nombre de mesure (int)
    questions.push({
      id: `${ecField}_nombre_mesure`,
      label: `${ecField} - Nombre de mesure`,
      helper: 'Entier attendu',
      type: 'text'
    });

    // Tolérance + (float)
    questions.push({
      id: `${ecField}_tolerance_plus`,
      label: `${ecField} - Tolérance +`,
      helper: 'Chiffre à virgule attendu',
      type: 'text'
    });

    // Tolérance - (float)
    questions.push({
      id: `${ecField}_tolerance_moins`,
      label: `${ecField} - Tolérance -`,
      helper: 'Chiffre à virgule attendu',
      type: 'text'
    });

    // Cote nominal (float)
    questions.push({
      id: `${ecField}_cote_nominal`,
      label: `${ecField} - Cote nominal`,
      helper: 'Chiffre à virgule attendu',
      type: 'text'
    });

    // Déviation (int)
    questions.push({
      id: `${ecField}_deviation`,
      label: `${ecField} - Déviation`,
      helper: 'Entier attendu',
      type: 'text'
    });

    // Type (text libre)
    questions.push({
      id: `${ecField}_type`,
      label: `${ecField} - Type`,
      helper: 'Texte libre',
      type: 'text'
    });

    // Ref (text libre)
    questions.push({
      id: `${ecField}_ref`,
      label: `${ecField} - Ref`,
      helper: 'Texte libre',
      type: 'text'
    });

    // Date de validité de l'étalonnage (text libre)
    questions.push({
      id: `${ecField}_date_etalonnage`,
      label: `${ecField} - Date de validité de l'étalonnage`,
      helper: 'Texte libre',
      type: 'text'
    });
  });

  return questions;
};

export const PRODUCT_CATALOG: ProductDefinition[] = [
  {
    id: generateProductId('STABILISATEUR'),
    name: 'STABILISATEUR',
    description: 'Inspection du stabilisateur',
    tableQuestions: generateStabilisateurTableQuestions(),
    normalQuestions: [
      {
        id: 'etat_visuel',
        label: 'ETAT VISUEL',
        type: 'choice',
        options: [
          {
            value: 'bon',
            label: 'BON',
            labelEn: 'GOOD'
          },
          {
            value: 'moyen',
            label: 'MOYEN',
            labelEn: 'AVERAGE'
          },
          {
            value: 'mauvais',
            label: 'MAUVAIS',
            labelEn: 'BAD'
          }
        ]
      },
      {
        id: 'avancement_fabrication',
        label: 'AVANCEMENT DE LA FABRICATION',
        type: 'choice',
        options: [
          {
            value: 'conforme_plans',
            label: 'CONFORME AUX PLANS',
            labelEn: 'IN ACCORDANCE WITH PLANS'
          },
          {
            value: 'en_retard',
            label: 'EN RETARD',
            labelEn: 'LATE'
          },
          {
            value: 'critique',
            label: 'CRITIQUE',
            labelEn: 'CRITICAL'
          }
        ]
      },
      {
        id: 'commentaire',
        label: 'Commentaire',
        helper: 'Notes, anomalies ou remarques',
        type: 'textarea'
      }
    ],
    imagePath: '/productImg/stabilisateur.svg'
  },
  {
    id: generateProductId('Embout Charbon'),
    name: 'Embout Charbon',
    description: 'Inspection de l\'embout charbon',
    tableQuestions: generateEmboutCharbonTableQuestions(),
    normalQuestions: [
      {
        id: 'etat_visuel',
        label: 'ETAT VISUEL',
        type: 'choice',
        options: [
          {
            value: 'bon',
            label: 'BON',
            labelEn: 'GOOD'
          },
          {
            value: 'moyen',
            label: 'MOYEN',
            labelEn: 'AVERAGE'
          },
          {
            value: 'mauvais',
            label: 'MAUVAIS',
            labelEn: 'BAD'
          }
        ]
      },
      {
        id: 'avancement_fabrication',
        label: 'AVANCEMENT DE LA FABRICATION',
        type: 'choice',
        options: [
          {
            value: 'conforme_plans',
            label: 'CONFORME AUX PLANS',
            labelEn: 'IN ACCORDANCE WITH PLANS'
          },
          {
            value: 'en_retard',
            label: 'EN RETARD',
            labelEn: 'LATE'
          },
          {
            value: 'critique',
            label: 'CRITIQUE',
            labelEn: 'CRITICAL'
          }
        ]
      },
      {
        id: 'commentaire',
        label: 'Commentaire',
        helper: 'Notes, anomalies ou remarques',
        type: 'textarea'
      }
    ],
    imagePath: '/productImg/embout-charbon.svg'
  },
];