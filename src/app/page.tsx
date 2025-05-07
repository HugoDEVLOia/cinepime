
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getTrendingMedia, type Media, type TimeWindow } from '@/services/tmdb';
import MediaCard from '@/components/media-card';
import { useMediaLists } from '@/hooks/use-media-lists';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const pageTitleMap: Record<TimeWindow, string> = {
  day: "Tendances du Jour",
  week: "Tendances de la Semaine",
  month: "Tendances du Mois",
  year: "Tendances de l'Année",
  all: "Les Plus Populaires" // Changed from "Tendances Générales"
};

export default function HomePage() {
  const [trendingMedia, setTrendingMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentTimeWindow, setCurrentTimeWindow] = useState<TimeWindow>('week');
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

  const fetchTrending = useCallback(async (pageToLoad: number, activeWindow: TimeWindow) => {
    if (pageToLoad === 1) {
      setIsLoading(true);
      setTrendingMedia([]); // Clear media when fetching page 1 for a new window or initial load
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    try {
      const { media, totalPages: newTotalPages } = await getTrendingMedia(pageToLoad, activeWindow);
      if (pageToLoad === 1) {
        setTrendingMedia(media); 
      } else {
        setTrendingMedia(prevMedia => [
          ...prevMedia,
          ...media.filter(newItem => !prevMedia.find(existingItem => existingItem.id === newItem.id))
        ]);
      }
      setTotalPages(newTotalPages);
    } catch (err) {
      console.error(`Erreur lors de la récupération des médias populaires (${activeWindow}):`, err);
      setError(`Échec du chargement des médias populaires. Veuillez réessayer plus tard.`);
      if (pageToLoad === 1) setTrendingMedia([]); 
    } finally {
      if (pageToLoad === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, []); // Dependencies are stable setters: setIsLoading, setIsLoadingMore, setError, setTrendingMedia, setTotalPages

  useEffect(() => {
    // This effect handles fetching data when page or time window changes.
    // Fetch for page 1 if currentTimeWindow changes, otherwise fetch for currentPage
    if (currentPage === 1) { // Ensures that when time window changes (and page is reset to 1), it fetches fresh
      fetchTrending(1, currentTimeWindow);
    } else { // For infinite scroll
      fetchTrending(currentPage, currentTimeWindow);
    }
  }, [currentPage, currentTimeWindow, fetchTrending]);


  const handleTimeWindowChange = (newWindow: string) => {
    const newTimeWindow = newWindow as TimeWindow;
    if (newTimeWindow !== currentTimeWindow) {
      setCurrentTimeWindow(newTimeWindow);
      setCurrentPage(1); // Reset to page 1 for the new time window
      // fetchTrending will be called by the useEffect due to currentTimeWindow and currentPage change
    }
  };

  const pageTitle = pageTitleMap[currentTimeWindow] || "Tendances";

  const renderTabs = () => (
    <Tabs defaultValue={currentTimeWindow} onValueChange={handleTimeWindowChange}>
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap md:justify-start lg:w-auto lg:inline-flex bg-muted p-1.5 rounded-lg">
        <TabsTrigger value="day" className="gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">Aujourd'hui</TabsTrigger>
        <TabsTrigger value="week" className="gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">Cette Semaine</TabsTrigger>
        <TabsTrigger value="month" className="gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">Ce Mois-ci</TabsTrigger>
        <TabsTrigger value="year" className="gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">Cette Année</TabsTrigger>
        <TabsTrigger value="all" className="gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">Populaires</TabsTrigger>
      </TabsList>
    </Tabs>
  );
  
  if (isLoading && currentPage === 1) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-foreground tracking-tight">{pageTitle}</h1>
          {renderTabs()}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <div className="space-y-2 p-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && trendingMedia.length === 0 && currentPage === 1) {
    return (
      <div>
         <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-foreground tracking-tight">{pageTitle}</h1>
          {renderTabs()}
        </div>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
          <Alert variant="destructive" className="max-w-md">
            <ServerCrash className="h-5 w-5" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-foreground tracking-tight">{pageTitle}</h1>
        {renderTabs()}
      </div>

      {trendingMedia.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {trendingMedia.map((media, index) => {
            const card = (
              <MediaCard                   
                media={media}
                onAddToList={addToList}
                onRemoveFromList={removeFromList}
                isInList={isInList}
              />
            );
            if (trendingMedia.length === index + 1 && currentPage < totalPages && !isLoadingMore) {
              return (
                <div ref={lastMediaElementRef} key={`${media.id}-${media.mediaType}-observed`}>
                  {card}
                </div>
              );
            }
            return <div key={`${media.id}-${media.mediaType}`}>{card}</div>;
          })}
        </div>
      )}
      {isLoadingMore && (
        <div className="flex justify-center items-center my-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Chargement de plus de contenu...</p>
        </div>
      )}
       {!isLoading && !isLoadingMore && trendingMedia.length === 0 && !error && (
         <p className="text-center text-muted-foreground mt-12 text-lg">Aucun média populaire trouvé pour le moment.</p>
      )}
      {error && trendingMedia.length > 0 && currentPage > 1 && ( // Show error for subsequent loads if they fail
         <Alert variant="destructive" className="mt-10">
          <ServerCrash className="h-5 w-5" />
          <AlertTitle>Erreur lors du chargement</AlertTitle>
          <AlertDescription>{error} Essayez de rafraîchir la page.</AlertDescription>
        </Alert>
      )}
      {!isLoadingMore && currentPage >= totalPages && trendingMedia.length > 0 && (
        <p className="text-center text-muted-foreground mt-12 text-lg">Vous avez atteint la fin des médias populaires.</p>
      )}
    </div>
  );
}
