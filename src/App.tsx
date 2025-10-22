import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { Layout } from './components/layout/Layout';
import { LoginModal } from './components/auth/LoginModal';
import { WelcomeScreen } from './components/shared/WelcomeScreen';
import { DemoModeBanner } from './components/shared/DemoModeBanner';
import { ConnectionErrorBanner } from './components/shared/ConnectionErrorBanner';

const AppContent: React.FC = () => {
  const { isLoading, user } = useAuth();
  const { isDemoMode, connectionError } = useData();
  const [showWelcome, setShowWelcome] = useState(false);
  const previousUser = useRef(user);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

  useEffect(() => {
    const welcomeShown = sessionStorage.getItem('welcomeScreenShown');
    if (!welcomeShown) {
      // Aggiungo un piccolo ritardo per assicurare che le impostazioni (logo) siano caricate
      setTimeout(() => setShowWelcome(true), 500); 
    }
  }, []);

  useEffect(() => {
    // Se prima c'era un utente e ora non più, significa che è stato fatto il logout.
    if (previousUser.current && !user) {
        setShowWelcome(true);
    }
    previousUser.current = user;
  }, [user]);

  const handleCloseWelcome = () => {
    sessionStorage.setItem('welcomeScreenShown', 'true');
    setShowWelcome(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      {connectionError && <ConnectionErrorBanner message={connectionError} />}
      {showWelcome && <WelcomeScreen onClose={handleCloseWelcome} />}
      <div className={`flex flex-col h-screen bg-slate-100 dark:bg-slate-900 transition-all duration-300 ${connectionError ? 'pt-28' : ''}`}>
        <div className="flex-1 overflow-hidden">
          <Layout />
        </div>
        <LoginModal />
      </div>
      {isDemoMode && <DemoModeBanner />}
    </>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;