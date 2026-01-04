
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface UserContextState {
  username: string | null;
  setUsername: (name: string) => void;
  hasCompletedOnboarding: boolean;
  markOnboardingAsComplete: () => void;
  isLoaded: boolean;
}

const UserContext = createContext<UserContextState | undefined>(undefined);

const ONBOARDING_KEY = 'cineprime_onboarding_complete';
const USERNAME_KEY = 'cineprime_username';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true); // Default to true to avoid flash
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const onboardingStatus = localStorage.getItem(ONBOARDING_KEY) === 'true';
        const storedUsername = localStorage.getItem(USERNAME_KEY);
        
        setHasCompletedOnboarding(onboardingStatus);
        setUsernameState(storedUsername);
      } catch (error) {
        console.error("Erreur lors de l'accès à localStorage:", error);
      }
      setIsLoaded(true);
    }
  }, []);

  const setUsername = useCallback((name: string) => {
    try {
      localStorage.setItem(USERNAME_KEY, name);
      setUsernameState(name);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du nom d'utilisateur:", error);
    }
  }, []);

  const markOnboardingAsComplete = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du statut d'onboarding:", error);
    }
  }, []);

  const value = {
    username,
    setUsername,
    hasCompletedOnboarding,
    markOnboardingAsComplete,
    isLoaded,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
