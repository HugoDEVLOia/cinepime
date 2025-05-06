import { useState, useEffect, useCallback } from 'react';
import type { Media } from '@/services/tmdb';

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
      const storedToWatch = localStorage.getItem(LIST_STORAGE_KEYS.toWatch);
      const storedWatched = localStorage.getItem(LIST_STORAGE_KEYS.watched);
      if (storedToWatch) {
        setToWatchList(JSON.parse(storedToWatch));
      }
      if (storedWatched) {
        setWatchedList(JSON.parse(storedWatched));
      }
      setIsLoaded(true);
    }
  }, []);

  const updateLocalStorage = useCallback((list: ListType, data: Media[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIST_STORAGE_KEYS[list], JSON.stringify(data));
    }
  }, []);

  const addToList = useCallback((mediaItem: Media, list: ListType) => {
    if (list === 'toWatch') {
      setToWatchList(prevList => {
        if (prevList.find(item => item.id === mediaItem.id)) return prevList;
        const newList = [mediaItem, ...prevList];
        updateLocalStorage('toWatch', newList);
        return newList;
      });
    } else if (list === 'watched') {
      setWatchedList(prevList => {
        if (prevList.find(item => item.id === mediaItem.id)) return prevList;
        const newList = [mediaItem, ...prevList];
        updateLocalStorage('watched', newList);
        return newList;
      });
    }
  }, [updateLocalStorage]);

  const removeFromList = useCallback((mediaId: string, list: ListType) => {
    if (list === 'toWatch') {
      setToWatchList(prevList => {
        const newList = prevList.filter(item => item.id !== mediaId);
        updateLocalStorage('toWatch', newList);
        return newList;
      });
    } else if (list === 'watched') {
      setWatchedList(prevList => {
        const newList = prevList.filter(item => item.id !== mediaId);
        updateLocalStorage('watched', newList);
        return newList;
      });
    }
  }, [updateLocalStorage]);

  const isInList = useCallback((mediaId: string, list: ListType): boolean => {
    if (!isLoaded) return false; // Don't check until lists are loaded
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
