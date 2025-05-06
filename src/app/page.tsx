'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getTrendingMedia, type Media } from '@/services/tmdb';
import MediaCard from '@/components/media-card';
import { useMediaLists } from '@/hooks/use-media-lists';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [trendingMedia, setTrendingMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToList, removeFromList, isInList } = useMediaLists();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastMediaElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && currentPage < totalPages) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, currentPage, totalPages]);


  const fetchTrending = useCallback(async (pageToLoad: number) => {
    if (pageToLoad === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    try {
      const { media, totalPages: newTotalPages } = await getTrendingMedia(pageToLoad);
      setTrendingMedia(prevMedia => pageToLoad === 1 ? media : [...prevMedia, ...media]);
      setTotalPages(newTotalPages);
    } catch (err) {
      console.error("Erreur lors de la récupération des médias tendances:", err);
      setError("Échec du chargement des médias tendances. Veuillez réessayer plus tard.");
    } finally {
      if (pageToLoad === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchTrending(currentPage);
  }, [fetchTrending, currentPage]);

  if (isLoading && currentPage === 1) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8 text-primary">Tendances de la semaine</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && trendingMedia.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Alert variant="destructive" className="max-w-md">
          <ServerCrash className="h-5 w-5" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-primary">Tendances de la semaine</h1>
      {trendingMedia.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {trendingMedia.map((media, index) => {
            if (trendingMedia.length === index + 1) {
              return (
                <div ref={lastMediaElementRef} key={media.id}>
                  <MediaCard                   
                    media={media}
                    onAddToList={addToList}
                    onRemoveFromList={removeFromList}
                    isInList={isInList}
                  />
                </div>
              );
            } else {
              return (
                <MediaCard
                  key={media.id}
                  media={media}
                  onAddToList={addToList}
                  onRemoveFromList={removeFromList}
                  isInList={isInList}
                />
              );
            }
          })}
        </div>
      )}
      {isLoadingMore && (
        <div className="flex justify-center items-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Chargement de plus de contenu...</p>
        </div>
      )}
       {!isLoading && !isLoadingMore && trendingMedia.length === 0 && !error && (
         <p className="text-center text-muted-foreground mt-10">Aucun média tendance trouvé pour le moment.</p>
      )}
      {error && trendingMedia.length > 0 && (
         <Alert variant="destructive" className="mt-8">
          <ServerCrash className="h-5 w-5" />
          <AlertTitle>Erreur lors du chargement</AlertTitle>
          <AlertDescription>{error} Essayez de rafraîchir.</AlertDescription>
        </Alert>
      )}
      {!isLoadingMore && currentPage >= totalPages && trendingMedia.length > 0 && (
        <p className="text-center text-muted-foreground mt-10">Vous avez atteint la fin des tendances.</p>
      )}
    </div>
  );
}
