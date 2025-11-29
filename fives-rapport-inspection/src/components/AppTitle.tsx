import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const AppTitle: React.FC = () => {
  const { t } = useLanguage();

  return (
    <h1 className="app-title">{t('common.appTitle')}</h1>
  );
};

