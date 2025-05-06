'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMedia, type Media } from '@/services/tmdb';
import MediaCard from '@/components/media-card';
import { useMediaLists } from '@/hooks/use-media-lists';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX, ServerCrash } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToList, removeFromList, isInList, isLoaded } = useMediaLists();

  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    async function fetchSearchResults() {
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchMedia(query);
        setSearchResults(results);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to load search results. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSearchResults();
  }, [query]);

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
      <h1 className="text-3xl font-bold mb-8 text-primary">
        Search Results for "{decodeURIComponent(query)}"
      </h1>
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
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {searchResults.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              onAddToList={addToList}
              onRemoveFromList={removeFromList}
              isInList={isInList}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No results found for "{decodeURIComponent(query)}".</p>
          <p className="text-sm text-muted-foreground">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}


export default function SearchPage() {
  return (
    // Suspense is required by Next.js for pages that use useSearchParams
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}

function SearchPageSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-3/4 max-w-md mb-8" />
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
  )
}
