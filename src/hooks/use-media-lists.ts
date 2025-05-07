import { useState, useEffect, useCallback } from 'react';
import type { Media } from '@/services/tmdb';
import { getMediaDetails } from '@/services/tmdb'; // Import getMediaDetails

export type ListType = 'toWatch' | 'watched';

const LIST_STORAGE_KEYS: Record<ListType, string> = {
  toWatch: 'cineCollection_toWatchList',
  watched: 'cineCollection_watchedList',
};

export function useMediaLists() {
  const [toWatchList, setToWatchList] = useState<Media[]>([]);
  const [watchedList, setWatchedList] = useState<Media[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedToWatch = localStorage.getItem(LIST_STORAGE_KEYS.toWatch);
        const storedWatched = localStorage.getItem(LIST_STORAGE_KEYS.watched);
        if (storedToWatch) {
          setToWatchList(JSON.parse(storedToWatch));
        }
        if (storedWatched) {
          setWatchedList(JSON.parse(storedWatched));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des listes depuis localStorage:", error);
        // Potentiellement réinitialiser les listes ou informer l'utilisateur
      }
      setIsLoaded(true);
    }
  }, []);

  const updateLocalStorage = useCallback((list: ListType, data: Media[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LIST_STORAGE_KEYS[list], JSON.stringify(data));
      } catch (error) {
        console.error(`Erreur lors de la sauvegarde de la liste ${list} dans localStorage:`, error);
      }
    }
  }, []);

  const addToList = useCallback(async (mediaItem: Media, list: ListType) => {
    let itemToAdd = { ...mediaItem }; // Travailler avec une copie pour éviter les mutations directes

    if (list === 'watched') {
      const needsDetails =
        !itemToAdd.genres?.length ||
        !itemToAdd.cast?.length ||
        (itemToAdd.mediaType === 'movie' && (typeof itemToAdd.runtime !== 'number' || itemToAdd.runtime === 0));

      if (needsDetails && itemToAdd.id && itemToAdd.mediaType) {
        console.log(`Récupération des détails pour "${itemToAdd.title}" avant l'ajout à la liste des vus.`);
        try {
          const detailedMedia = await getMediaDetails(itemToAdd.id, itemToAdd.mediaType);
          if (detailedMedia) {
            itemToAdd = detailedMedia; // Utiliser l'élément média détaillé
          } else {
            console.warn(`Impossible de récupérer les détails pour "${itemToAdd.title}". Utilisation des données potentiellement incomplètes.`);
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des détails pour "${itemToAdd.title}":`, error);
          // Continuer avec itemToAdd actuel (potentiellement incomplet)
        }
      }
    }

    const updateListState = (setListFn: React.Dispatch<React.SetStateAction<Media[]>>, storageKey: ListType) => {
      setListFn(prevList => {
        if (prevList.find(item => item.id === itemToAdd.id)) { // Déjà dans la liste
          // Si déjà dans la liste "watched" et on essaie de l'ajouter à nouveau (avec des détails mis à jour), on le remplace.
          if (storageKey === 'watched') {
            const updatedList = prevList.map(item => item.id === itemToAdd.id ? itemToAdd : item);
            updateLocalStorage(storageKey, updatedList);
            return updatedList;
          }
          return prevList;
        }
        const newList = [itemToAdd, ...prevList];
        updateLocalStorage(storageKey, newList);
        return newList;
      });
    };

    if (list === 'toWatch') {
      updateListState(setToWatchList, 'toWatch');
    } else if (list === 'watched') {
      updateListState(setWatchedList, 'watched');
    }
  }, [updateLocalStorage]);

  const removeFromList = useCallback((mediaId: string, list: ListType) => {
    const updateListState = (setListFn: React.Dispatch<React.SetStateAction<Media[]>>, storageKey: ListType) => {
      setListFn(prevList => {
        const newList = prevList.filter(item => item.id !== mediaId);
        updateLocalStorage(storageKey, newList);
        return newList;
      });
    };

    if (list === 'toWatch') {
      updateListState(setToWatchList, 'toWatch');
    } else if (list === 'watched') {
      updateListState(setWatchedList, 'watched');
    }
  }, [updateLocalStorage]);

  const isInList = useCallback((mediaId: string, list: ListType): boolean => {
    if (!isLoaded) return false;
    if (list === 'toWatch') {
      return !!toWatchList.find(item => item.id === mediaId);
    } else if (list === 'watched') {
      return !!watchedList.find(item => item.id === mediaId);
    }
    return false;
  }, [toWatchList, watchedList, isLoaded]);

  return {
    toWatchList,
    watchedList,
    addToList,
    removeFromList,
    isInList,
    isLoaded,
  };
}
