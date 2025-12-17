import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';
import { AppTitle } from './components/AppTitle';
import MainMenu from './pages/MainMenu';
import ProductSelection from './pages/ProductSelection';
import FormEdit from './pages/FormEdit';
import { ConfirmModal } from './components/ConfirmModal';

function AppRoutes() {
  const { t } = useLanguage();
  const {
    draftNamePrompt,
    setDraftNamePrompt,
    setDraftNameInput,
    overwritePrompt,
    setOverwritePrompt,
    confirmDraftNameSave,
    confirmOverwriteSave,
  } = useAppContext();

  const handleDraftNameConfirm = async (name?: string) => {
    if (!name) return;
    setDraftNameInput(name);
    await confirmDraftNameSave(name);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/form" element={<ProductSelection />} />
        <Route path="/form/:productId" element={<FormEdit />} />
      </Routes>
      <ConfirmModal
        isOpen={draftNamePrompt !== null}
        title={t('modals.draftName.title')}
        description={t('modals.draftName.description')}
        onConfirm={handleDraftNameConfirm}
        onCancel={() => {
          setDraftNamePrompt(null);
          setDraftNameInput('');
        }}
        confirmLabel={t('common.save')}
        inputField={{
          defaultValue: draftNamePrompt?.defaultName || '',
          placeholder: t('modals.draftName.placeholder'),
        }}
      />
      <ConfirmModal
        isOpen={overwritePrompt !== null}
        title={t('modals.overwrite.title')}
        description={t('modals.overwrite.description', { name: overwritePrompt?.draftName || '' })}
        onConfirm={confirmOverwriteSave}
        onCancel={() => setOverwritePrompt(null)}
        confirmLabel={t('modals.overwrite.replace')}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppProvider>
          <div className="app-shell">
            <header className="app-header-top">
              <div className="header-logo">
                <img 
                  src="/fivesLoginimg.png" 
                  alt="Fives Pillard" 
                  className="logo-image"
                />
              </div>
              <AppTitle />
              <div className="header-spacer"></div>
              <LanguageSelector />
            </header>
            <AppRoutes />
          </div>
        </AppProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
