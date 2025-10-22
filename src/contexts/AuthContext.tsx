import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { localStorageService } from '../services/localStorageService';

interface AuthState {
  user: User | null;
  token: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, isDemoMode?: boolean) => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, token: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const wpUser = (window as any).ta25_app_vars?.currentUser;
      const wpNonce = (window as any).ta25_app_vars?.nonce;

      if (wpUser && wpNonce) {
        // L'utente è loggato tramite WordPress
        const newAuthState = { user: wpUser, token: wpNonce };
        setAuthState(newAuthState);
        sessionStorage.setItem('auth', JSON.stringify(newAuthState));
      } else {
        // Fallback alla session storage per la modalità demo o stand-alone
        const storedAuth = sessionStorage.getItem('auth');
        if (storedAuth) {
          setAuthState(JSON.parse(storedAuth));
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth state", error);
      sessionStorage.removeItem('auth');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const login = async (email: string, password: string, isDemoMode = false): Promise<boolean> => {
    setIsLoading(true);
    // In un contesto WordPress, il login avviene tramite /wp-login.php.
    // Questa funzione è mantenuta per la modalità demo.
    const loginResponse = isDemoMode
        ? await localStorageService.login(email, password)
        : await apiService.login(email, password);

    if (loginResponse) {
      const { token, ...user } = loginResponse;
      const newAuthState = { user, token };
      setAuthState(newAuthState);
      sessionStorage.setItem('auth', JSON.stringify(newAuthState));
      closeLoginModal();
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('welcomeScreenShown');
    // In un contesto WordPress reale, reindirizzeresti l'utente all'URL di logout di WP.
    // window.location.href = '/wp-login.php?action=logout';
  };
  
  const updateCurrentUser = async (updates: Partial<User>) => {
      if (!authState.user) return;
      // Note: This API endpoint is a placeholder and needs to be implemented in the backend.
      // In demo mode, this will also need a localStorageService implementation.
      const updatedUser = await apiService.updateUser(authState.user.id, updates);
      const newAuthState = { ...authState, user: updatedUser };
      setAuthState(newAuthState);
      sessionStorage.setItem('auth', JSON.stringify(newAuthState));
  };


  return (
    <AuthContext.Provider value={{ 
      user: authState.user,
      token: authState.token, 
      isAuthenticated: !!authState.user, 
      login, 
      logout, 
      updateCurrentUser, 
      isLoading, 
      isLoginModalOpen, 
      openLoginModal, 
      closeLoginModal 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};