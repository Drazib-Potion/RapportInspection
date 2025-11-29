import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';
import { AppTitle } from './components/AppTitle';
import MainMenu from './pages/MainMenu';
import ProductSelection from './pages/ProductSelection';
import FormEdit from './pages/FormEdit';
import { DraftNameModal } from './components/DraftNameModal';
import { OverwriteModal } from './components/OverwriteModal';

function AppRoutes() {
  const {
    draftNamePrompt,
    setDraftNamePrompt,
    setDraftNameInput,
    overwritePrompt,
    setOverwritePrompt,
    confirmDraftNameSave,
    confirmOverwriteSave,
  } = useAppContext();

  const handleDraftNameConfirm = async (name: string) => {
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
      <DraftNameModal
        isOpen={draftNamePrompt !== null}
        defaultName={draftNamePrompt?.defaultName || ''}
        onConfirm={handleDraftNameConfirm}
        onCancel={() => {
          setDraftNamePrompt(null);
          setDraftNameInput('');
        }}
      />
      <OverwriteModal
        isOpen={overwritePrompt !== null}
        draftName={overwritePrompt?.draftName || ''}
        onConfirm={confirmOverwriteSave}
        onCancel={() => setOverwritePrompt(null)}
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
