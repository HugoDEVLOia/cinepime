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
    // We create a fresh copy to avoid unintended mutations and ensure no stale data is used.
    let itemToAdd = { ...mediaItem };

    // When adding to 'watched', we want the most complete data for stats.
    // Check if we need to fetch more details.
    const needsDetails =
      list === 'watched' && (
      !itemToAdd.genres?.length ||
      !itemToAdd.cast?.length ||
      (itemToAdd.mediaType === 'movie' && (typeof itemToAdd.runtime !== 'number' || itemToAdd.runtime === 0))
    );

    if (needsDetails) {
      console.log(`Récupération des détails pour "${itemToAdd.title}" avant l'ajout à la liste des vus.`);
      try {
        // Fetch full, fresh details from the API.
        const detailedMedia = await getMediaDetails(itemToAdd.id, itemToAdd.mediaType);
        if (detailedMedia) {
          itemToAdd = detailedMedia; // Use the complete, detailed media object.
        } else {
          console.warn(`Impossible de récupérer les détails pour "${itemToAdd.title}". Utilisation des données potentiellement incomplètes.`);
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération des détails pour "${itemToAdd.title}":`, error);
        // Continue with the current itemToAdd (potentially incomplete) as a fallback.
      }
    }

    const performListUpdate = (
      setListFn: React.Dispatch<React.SetStateAction<Media[]>>,
      storageKey: ListType
    ) => {
      setListFn((currentList) => {
        // Prevent duplicates by checking if the item already exists.
        if (currentList.some(item => item.id === itemToAdd.id)) {
          // If it's already in the 'watched' list, we might want to update it with the new detailed info.
          if (storageKey === 'watched') {
              const updatedList = currentList.map(item => item.id === itemToAdd.id ? itemToAdd : item);
              updateLocalStorage(storageKey, updatedList);
              return updatedList;
          }
          return currentList; // No change if it already exists in 'toWatch'.
        }
        
        // Add the new item to the beginning of the list.
        const newList = [itemToAdd, ...currentList];
        updateLocalStorage(storageKey, newList);
        return newList;
      });
    };
    
    // Logic to handle moving items between lists.
    // If an item is marked as 'watched', it should be removed from 'toWatch'.
    if (list === 'watched') {
      performListUpdate(setWatchedList, 'watched');
      removeFromList(itemToAdd.id, 'toWatch');
    } 
    // If an item is added to 'toWatch', it should be removed from 'watched'.
    else if (list === 'toWatch') {
      performListUpdate(setToWatchList, 'toWatch');
      removeFromList(itemToAdd.id, 'watched');
    }
  }, [updateLocalStorage]);


  const removeFromList = useCallback((mediaId: string, list: ListType) => {
    const updateListState = (setListFn: React.Dispatch<React.SetStateAction<Media[]>>, storageKey: ListType) => {
      setListFn(prevList => {
        const newList = prevList.filter(item => item.id !== mediaId);
        if (newList.length < prevList.length) { // Only update if a change occurred
          updateLocalStorage(storageKey, newList);
        }
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

  const setLists = useCallback((newToWatch: Media[], newWatched: Media[]) => {
    setToWatchList(newToWatch);
    updateLocalStorage('toWatch', newToWatch);
    setWatchedList(newWatched);
    updateLocalStorage('watched', newWatched);
  }, [updateLocalStorage]);

  return {
    toWatchList,
    watchedList,
    addToList,
    removeFromList,
    isInList,
    isLoaded,
    setLists, // Export the new function
  };
}

    