import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslations from './locales/fr.json';
import enTranslations from './locales/en.json';

const savedLanguage = localStorage.getItem('app-language') || 'fr';
const browserLanguage = navigator.language.split('-')[0];

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: frTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    lng: savedLanguage || (browserLanguage === 'en' ? 'en' : 'fr'),
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

