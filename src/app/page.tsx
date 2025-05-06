'use client';

import { useEffect, useState } from 'react';
import { getTrendingMedia, type Media } from '@/services/tmdb';
import MediaCard from '@/components/media-card';
import { useMediaLists } from '@/hooks/use-media-lists';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from 'lucide-react';

export default function HomePage() {
  const [trendingMedia, setTrendingMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToList, removeFromList, isInList, isLoaded } = useMediaLists();

  useEffect(() => {
    async function fetchTrending() {
      setIsLoading(true);
      setError(null);
      try {
        const media = await getTrendingMedia();
        setTrendingMedia(media);
      } catch (err) {
        console.error("Error fetching trending media:", err);
        setError("Failed to load trending media. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrending();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Alert variant="destructive" className="max-w-md">
          <ServerCrash className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-primary">Trending This Week</h1>
      {isLoading ? (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {trendingMedia.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              onAddToList={addToList}
              onRemoveFromList={removeFromList}
              isInList={isInList}
            />
          ))}
        </div>
      )}
      {!isLoading && trendingMedia.length === 0 && (
         <p className="text-center text-muted-foreground mt-10">No trending media found at the moment.</p>
      )}
    </div>
  );
}
