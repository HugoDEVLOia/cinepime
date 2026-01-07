
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface UserContextState {
  username: string | null;
  avatar: string | null;
  setUsernameAndAvatar: (name: string, avatar: string) => void;
  hasCompletedOnboarding: boolean;
  markOnboardingAsComplete: () => void;
  isLoaded: boolean;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextState | undefined>(undefined);

const ONBOARDING_KEY = 'cineprime_onboarding_complete';
const USERNAME_KEY = 'cineprime_username';
const AVATAR_KEY = 'cineprime_avatar';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true); // Default to true to avoid flash
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const onboardingStatus = localStorage.getItem(ONBOARDING_KEY) === 'true';
        const storedUsername = localStorage.getItem(USERNAME_KEY);
        const storedAvatar = localStorage.getItem(AVATAR_KEY);
        
        setHasCompletedOnboarding(onboardingStatus);
        setUsernameState(storedUsername);
        setAvatarState(storedAvatar);
      } catch (error) {
        console.error("Erreur lors de l'accès à localStorage:", error);
      }
      setIsLoaded(true);
    }
  }, []);

  const setUsernameAndAvatar = useCallback((name: string, avatarUrl: string) => {
    try {
      localStorage.setItem(USERNAME_KEY, name);
      localStorage.setItem(AVATAR_KEY, avatarUrl);
      setUsernameState(name);
      setAvatarState(avatarUrl);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données utilisateur:", error);
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
  
  const clearUserData = useCallback(() => {
     try {
      localStorage.removeItem(USERNAME_KEY);
      localStorage.removeItem(AVATAR_KEY);
      localStorage.removeItem(ONBOARDING_KEY);
      // Optional: clear media lists as well if that's desired on logout
      // localStorage.removeItem('cineCollection_toWatchList');
      // localStorage.removeItem('cineCollection_watchedList');
      
      setUsernameState(null);
      setAvatarState(null);
      setHasCompletedOnboarding(false);

    } catch (error) {
      console.error("Erreur lors de la suppression des données utilisateur:", error);
    }
  }, []);

  const value = {
    username,
    avatar,
    setUsernameAndAvatar,
    hasCompletedOnboarding,
    markOnboardingAsComplete,
    isLoaded,
    clearUserData,
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
