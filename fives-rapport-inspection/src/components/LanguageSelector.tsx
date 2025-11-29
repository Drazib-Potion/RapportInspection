import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-selector">
      <button
        className={`lang-btn ${language === 'fr' ? 'active' : ''}`}
        onClick={() => setLanguage('fr')}
        title="Français"
      >
        <span className="flag">🇫🇷</span>
        <span>FR</span>
      </button>
      <button
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        title="English"
      >
        <span className="flag">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};

