
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMedia, type Media } from '@/services/tmdb';
import MediaCard from '@/components/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX, ServerCrash, MessageSquareQuote } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

const ArthurEasterEgg = () => (
  <div className="flex flex-col items-center justify-center text-center space-y-4 py-10">
    <h1 className="text-8xl md:text-9xl font-extrabold text-primary tracking-tighter animate-pulse">
      SIGMA
    </h1>
    <div className="text-9xl md:text-[150px]">
      🗿
    </div>
    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-primary mt-4">
      <Image
        src="/easter-egg/arthur.jpg"
        alt="Arthur Launois"
        layout="fill"
        objectFit="cover"
        data-ai-hint="easter egg"
      />
    </div>
  </div>
);

const MagaliEasterEgg = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-10">
      <div className="mb-4">
        <MessageSquareQuote className="h-24 w-24 text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
        Le Grand Livre des Citations de Magali
      </h1>
      <div className="space-y-6 max-w-2xl w-full">
        <Card className="p-6 text-center shadow-lg rounded-xl bg-card">
          <blockquote className="text-xl md:text-2xl font-medium italic text-foreground">
            "C'est bien mais est ce que on peut parler avec Brad Pitt ?"
          </blockquote>
          <footer className="mt-4 text-md text-muted-foreground">- Magali Giorgis, 2025</footer>
        </Card>
        <Card className="p-6 text-center shadow-lg rounded-xl bg-card">
          <blockquote className="text-xl md:text-2xl font-medium italic text-foreground">
            "Tabernacle la babouche"
          </blockquote>
          <footer className="mt-4 text-md text-muted-foreground">- Magali Giorgis, 2025</footer>
        </Card>
      </div>
    </div>
);

const LeGEasterEgg = () => (
  <div className="flex flex-col items-center justify-center text-center space-y-4 py-10">
    <h1 className="text-8xl md:text-9xl font-extrabold text-primary tracking-tighter animate-pulse">
      G.O.A.T
    </h1>
    <div className="text-9xl md:text-[150px]">
      🐐
    </div>
  </div>
);


function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    // Don't fetch results if it's an easter egg
    if (query.toLowerCase() === 'arthur launois' || query.toLowerCase() === 'magali giorgis' || query.toLowerCase() === 'le g') {
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
        console.error("Erreur lors de la récupération des résultats de recherche:", err);
        setError("Échec du chargement des résultats de recherche. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSearchResults();
  }, [query]);

  if (query.toLowerCase() === 'arthur launois') {
    return <ArthurEasterEgg />;
  }

  if (query.toLowerCase() === 'magali giorgis') {
    return <MagaliEasterEgg />;
  }
  
  if (query.toLowerCase() === 'le g') {
    return <LeGEasterEgg />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Alert variant="destructive" className="max-w-md shadow-lg">
          <ServerCrash className="h-5 w-5" />
          <AlertTitle>Erreur de Chargement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-foreground tracking-tight">
        {query ? `Résultats pour "${decodeURIComponent(query)}"` : "Recherche"}
      </h1>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {searchResults.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-lg shadow-sm border border-border">
          <SearchX className="w-20 h-20 text-muted-foreground mb-6" />
          <p className="text-2xl font-semibold text-foreground mb-2">Aucun résultat trouvé.</p>
          <p className="text-md text-muted-foreground">
            {query ? `Nous n'avons rien trouvé pour "${decodeURIComponent(query)}".` : "Veuillez entrer un terme de recherche."}
          </p>
          {query && <p className="text-sm text-muted-foreground mt-1">Essayez un autre terme de recherche.</p>}
        </div>
      )}
    </div>
  );
}


export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}

function SearchPageSkeleton() {
  return (
    <div>
      <Skeleton className="h-10 w-3/4 max-w-md mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
  )
}
