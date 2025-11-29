import { ProductDefinition, ProductQuestion } from './types';
import i18nInstance from '../i18n/config';

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
      label: (i18nInstance.t as any)('products.questions.value', { id: stField }),
      helper: isST03 ? (i18nInstance.t as any)('products.helpers.integerExpected') : (i18nInstance.t as any)('products.helpers.decimalExpected'),
      type: 'text',
      unit: isST03 ? 'nbre' : 'mm'
    });

    // Nombre de mesure (int)
    questions.push({
      id: `${stField}_nombre_mesure`,
      label: (i18nInstance.t as any)('products.questions.measureCount', { id: stField }),
      helper: (i18nInstance.t as any)('products.helpers.integerExpected'),
      type: 'text'
    });

    // Tolérance + (float)
    questions.push({
      id: `${stField}_tolerance_plus`,
      label: (i18nInstance.t as any)('products.questions.tolerancePlus', { id: stField }),
      helper: (i18nInstance.t as any)('products.helpers.decimalExpected'),
      type: 'text'
    });

    // Tolérance - (float)
    questions.push({
      id: `${stField}_tolerance_moins`,
      label: (i18nInstance.t as any)('products.questions.toleranceMinus', { id: stField }),
      helper: (i18nInstance.t as any)('products.helpers.decimalExpected'),
      type: 'text'
    });

    // Cote nominal (float)
    questions.push({
      id: `${stField}_cote_nominal`,
      label: (i18nInstance.t as any)('products.questions.nominalDimension', { id: stField }),
      helper: (i18nInstance.t as any)('products.helpers.decimalExpected'),
      type: 'text'
    });

    // Déviation (int)
    questions.push({
      id: `${stField}_deviation`,
      label: (i18nInstance.t as any)('products.questions.deviation', { id: stField }),
      helper: (i18nInstance.t as any)('products.helpers.integerExpected'),
      type: 'text'
    });

    // Type (text libre)
    questions.push({
      id: `${stField}_type`,
      label: (i18nInstance.t as any)('products.questions.type', { id: stField }),
      helper: (i18nInstance.t as any)('products.helpers.freeText'),
      type: 'text'
    });

    // Ref (text libre)
    questions.push({
      id: `${stField}_ref`,
      label: (i18nInstance.t as any)('products.questions.ref', { id: stField }),
      helper: (i18nInstance.t as any)('products.helpers.freeText'),
      type: 'text'
    });

    // Date de validité de l'étalonnage (text libre)
    questions.push({
      id: `${stField}_date_etalonnage`,
      label: (i18nInstance.t as any)('products.questions.calibrationDate', { id: stField }),
      helper: (i18nInstance.t as any)('products.helpers.freeText'),
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
      label: (i18nInstance.t as any)('products.questions.value', { id: ecField }),
      helper: (i18nInstance.t as any)('products.helpers.decimalExpected'),
      type: 'text',
      unit: isEC09orEC10 ? '*' : 'mm'
    });

    // Nombre de mesure (int)
    questions.push({
      id: `${ecField}_nombre_mesure`,
      label: (i18nInstance.t as any)('products.questions.measureCount', { id: ecField }),
      helper: (i18nInstance.t as any)('products.helpers.integerExpected'),
      type: 'text'
    });

    // Tolérance + (float)
    questions.push({
      id: `${ecField}_tolerance_plus`,
      label: (i18nInstance.t as any)('products.questions.tolerancePlus', { id: ecField }),
      helper: (i18nInstance.t as any)('products.helpers.decimalExpected'),
      type: 'text'
    });

    // Tolérance - (float)
    questions.push({
      id: `${ecField}_tolerance_moins`,
      label: (i18nInstance.t as any)('products.questions.toleranceMinus', { id: ecField }),
      helper: (i18nInstance.t as any)('products.helpers.decimalExpected'),
      type: 'text'
    });

    // Cote nominal (float)
    questions.push({
      id: `${ecField}_cote_nominal`,
      label: (i18nInstance.t as any)('products.questions.nominalDimension', { id: ecField }),
      helper: (i18nInstance.t as any)('products.helpers.decimalExpected'),
      type: 'text'
    });

    // Déviation (int)
    questions.push({
      id: `${ecField}_deviation`,
      label: (i18nInstance.t as any)('products.questions.deviation', { id: ecField }),
      helper: (i18nInstance.t as any)('products.helpers.integerExpected'),
      type: 'text'
    });

    // Type (text libre)
    questions.push({
      id: `${ecField}_type`,
      label: (i18nInstance.t as any)('products.questions.type', { id: ecField }),
      helper: (i18nInstance.t as any)('products.helpers.freeText'),
      type: 'text'
    });

    // Ref (text libre)
    questions.push({
      id: `${ecField}_ref`,
      label: (i18nInstance.t as any)('products.questions.ref', { id: ecField }),
      helper: (i18nInstance.t as any)('products.helpers.freeText'),
      type: 'text'
    });

    // Date de validité de l'étalonnage (text libre)
    questions.push({
      id: `${ecField}_date_etalonnage`,
      label: (i18nInstance.t as any)('products.questions.calibrationDate', { id: ecField }),
      helper: (i18nInstance.t as any)('products.helpers.freeText'),
      type: 'text'
    });
  });

  return questions;
};

export const getProductCatalog = (): ProductDefinition[] => {
  return [
    {
      id: generateProductId('STABILISATEUR'),
      name: (i18nInstance.t as any)('products.stabilisateur.name'),
      description: (i18nInstance.t as any)('products.stabilisateur.description'),
      tableQuestions: generateStabilisateurTableQuestions(),
      normalQuestions: [
        {
          id: 'etat_visuel',
          label: (i18nInstance.t as any)('products.questions.visualState'),
          type: 'choice',
          options: [
            {
              value: 'bon',
              label: (i18nInstance.t as any)('products.options.good'),
            },
            {
              value: 'moyen',
              label: (i18nInstance.t as any)('products.options.average'),
            },
            {
              value: 'mauvais',
              label: (i18nInstance.t as any)('products.options.bad'),
            }
          ]
        },
        {
          id: 'avancement_fabrication',
          label: (i18nInstance.t as any)('products.questions.fabricationProgress'),
          type: 'choice',
          options: [
            {
              value: 'conforme_plans',
              label: (i18nInstance.t as any)('products.options.conformePlans'),
            },
            {
              value: 'en_retard',
              label: (i18nInstance.t as any)('products.options.late'),
            },
            {
              value: 'critique',
              label: (i18nInstance.t as any)('products.options.critical'),
            }
          ]
        },
        {
          id: 'commentaire',
          label: (i18nInstance.t as any)('products.questions.comment'),
          helper: (i18nInstance.t as any)('products.questions.commentHelper'),
          type: 'textarea'
        }
      ],
      imagePath: '/productImg/stabilisateur.svg'
    },
    {
      id: generateProductId('Embout Charbon'),
      name: (i18nInstance.t as any)('products.emboutCharbon.name'),
      description: (i18nInstance.t as any)('products.emboutCharbon.description'),
      tableQuestions: generateEmboutCharbonTableQuestions(),
      normalQuestions: [
        {
          id: 'etat_visuel',
          label: (i18nInstance.t as any)('products.questions.visualState'),
          type: 'choice',
          options: [
            {
              value: 'bon',
              label: (i18nInstance.t as any)('products.options.good'),
            },
            {
              value: 'moyen',
              label: (i18nInstance.t as any)('products.options.average'),
            },
            {
              value: 'mauvais',
              label: (i18nInstance.t as any)('products.options.bad'),
            }
          ]
        },
        {
          id: 'avancement_fabrication',
          label: (i18nInstance.t as any)('products.questions.fabricationProgress'),
          type: 'choice',
          options: [
            {
              value: 'conforme_plans',
              label: (i18nInstance.t as any)('products.options.conformePlans'),
            },
            {
              value: 'en_retard',
              label: (i18nInstance.t as any)('products.options.late'),
            },
            {
              value: 'critique',
              label: (i18nInstance.t as any)('products.options.critical'),
            }
          ]
        },
        {
          id: 'commentaire',
          label: (i18nInstance.t as any)('products.questions.comment'),
          helper: (i18nInstance.t as any)('products.questions.commentHelper'),
          type: 'textarea'
        }
      ],
      imagePath: '/productImg/embout-charbon.svg'
    },
  ];
};

// Export pour compatibilité avec le code existant
export const PRODUCT_CATALOG = getProductCatalog();