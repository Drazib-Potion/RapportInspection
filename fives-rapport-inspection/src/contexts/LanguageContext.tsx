import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('app-language') as Language) || 'fr'
  );

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('app-language', language);
  }, [language, i18n]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

