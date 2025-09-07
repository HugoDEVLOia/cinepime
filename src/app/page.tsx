
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { 
  getTrendingMedia, 
  getPopularMedia,
  type Media, 
  type MediaType
} from '@/services/tmdb';

import { useMediaLists } from '@/hooks/use-media-lists';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, Star, CalendarDays, Clapperboard, Flame, Tv, Film, Eye, Ghost, Laugh, Rocket, PencilRuler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MediaCarousel from '@/components/media-carousel';


export default function HomePage() {
  const [heroMedia, setHeroMedia] = useState<Media | null>(null);
  const [trending, setTrending] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [popularTv, setPopularTv] = useState<Media[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<Media[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Media[]>([]);
  const [scifiMovies, setScifiMovies] = useState<Media[]>([]);
  const [animationMovies, setAnimationMovies] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToList, removeFromList, isInList, toWatchList, isLoaded } = useMediaLists();

  useEffect(() => {
    async function fetchAllMedia() {
      setIsLoading(true);
      setError(null);
      try {
        const [
          trendingData,
          popularMoviesData,
          popularTvData,
          horrorMoviesData,
          comedyMoviesData,
          scifiMoviesData,
          animationMoviesData,
        ] = await Promise.all([
          getTrendingMedia(1, 'week'),
          getPopularMedia('movie'),
          getPopularMedia('tv'),
          getPopularMedia('movie', 1, undefined, 27), // Genre ID for Horror
          getPopularMedia('movie', 1, undefined, 35), // Genre ID for Comedy
          getPopularMedia('movie', 1, undefined, 878), // Genre ID for Science Fiction
          getPopularMedia('movie', 1, undefined, 16), // Genre ID for Animation
        ]);
        
        if (trendingData.media.length > 0) {
          // Select a random media for the hero section from trending, preferring one with a backdrop
          const heroCandidates = trendingData.media.filter(m => m.backdropUrl && m.backdropUrl.includes('image.tmdb.org'));
          setHeroMedia(heroCandidates.length > 0 ? heroCandidates[0] : trendingData.media[0]);
          setTrending(trendingData.media);
        }
        
        setPopularMovies(popularMoviesData.media);
        setPopularTv(popularTvData.media);
        setHorrorMovies(horrorMoviesData.media);
        setComedyMovies(comedyMoviesData.media);
        setScifiMovies(scifiMoviesData.media);
        setAnimationMovies(animationMoviesData.media);

      } catch (err) {
        console.error("Erreur lors de la récupération des médias pour la page d'accueil:", err);
        setError("Impossible de charger le contenu. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllMedia();
  }, []);

  if (isLoading) {
    return <HomePageSkeleton />;
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
    <div className="space-y-12 md:space-y-16">
      {heroMedia && (
        <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 md:-mt-12 h-[60vh] md:h-[75vh] flex items-center justify-center text-white overflow-hidden rounded-b-2xl shadow-2xl">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroMedia.backdropUrl || heroMedia.posterUrl}
              alt={`Image de fond pour ${heroMedia.title}`}
              fill
              className="object-cover object-center"
              priority
              data-ai-hint="hero background"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-black/40 z-0"></div>
          </div>
          <div className="relative z-20 flex flex-col items-start max-w-2xl w-full text-left px-4 sm:px-6 lg:px-8">
            <Badge variant={heroMedia.mediaType === 'movie' ? 'default' : 'secondary'} className="text-sm capitalize !px-3 !py-1.5 shadow-lg mb-4">
                {heroMedia.mediaType === 'movie' ? <Film className="h-4 w-4 mr-1.5"/> : <Tv className="h-4 w-4 mr-1.5" />}
                {heroMedia.mediaType === 'movie' ? 'Film' : 'Série'}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white shadow-2xl">
              {heroMedia.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/90 text-sm md:text-base mt-3 mb-5">
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-1.5 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{heroMedia.averageRating.toFixed(1)}</span>
              </div>
              {heroMedia.releaseDate && (
                <div className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-1.5" />
                  <span>{new Date(heroMedia.releaseDate).getFullYear()}</span>
                </div>
              )}
            </div>
            <p className="text-md md:text-lg text-white/80 leading-relaxed line-clamp-3 mb-6">
              {heroMedia.description}
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Link href={`/media/${heroMedia.mediaType}/${heroMedia.id}`}>
                Voir les détails
              </Link>
            </Button>
          </div>
        </section>
      )}

      {isLoaded && toWatchList.length > 0 && (
         <MediaCarousel 
          title="Ma Liste (À Regarder)"
          media={toWatchList}
          icon={<Eye className="h-7 w-7 text-primary" />}
        />
      )}
      
      {trending.length > 0 && (
         <MediaCarousel 
          title="Tendances Actuelles"
          media={trending}
          icon={<Flame className="h-7 w-7 text-primary" />}
        />
      )}

      {popularMovies.length > 0 && (
        <MediaCarousel 
          title="Films Populaires"
          media={popularMovies}
          icon={<Film className="h-7 w-7 text-primary" />}
        />
      )}

      {popularTv.length > 0 && (
        <MediaCarousel 
          title="Séries Populaires"
          media={popularTv}
          icon={<Tv className="h-7 w-7 text-primary" />}
        />
      )}

      {scifiMovies.length > 0 && (
        <MediaCarousel 
          title="Voyage vers l'inconnu"
          media={scifiMovies}
          icon={<Rocket className="h-7 w-7 text-primary" />}
        />
      )}

      {animationMovies.length > 0 && (
        <MediaCarousel 
          title="Pour petits et grands"
          media={animationMovies}
          icon={<PencilRuler className="h-7 w-7 text-primary" />}
        />
      )}

      {horrorMovies.length > 0 && (
        <MediaCarousel 
          title="Vous ne dormirez pas cette nuit"
          media={horrorMovies}
          icon={<Ghost className="h-7 w-7 text-primary" />}
        />
      )}

      {comedyMovies.length > 0 && (
        <MediaCarousel 
          title="Vous allez vous plier de rire"
          media={comedyMovies}
          icon={<Laugh className="h-7 w-7 text-primary" />}
        />
      )}
    </div>
  );
}

const HomePageSkeleton = () => (
  <div className="space-y-12 md:space-y-16 animate-pulse">
    {/* Hero Skeleton */}
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 md:-mt-12 h-[60vh] md:h-[75vh] bg-muted rounded-b-2xl">
      <div className="relative z-20 flex flex-col items-start max-w-2xl w-full text-left p-8 md:p-12 self-end">
        <Skeleton className="h-8 w-24 mb-4 rounded-full" />
        <Skeleton className="h-14 md:h-20 w-3/4 mb-4 rounded-lg" />
        <div className="flex gap-4 mb-5">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <Skeleton className="h-20 w-full mb-6 rounded-lg" />
        <Skeleton className="h-12 w-40 rounded-lg" />
      </div>
    </div>
    
    {/* Carousel Skeleton */}
    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
      <div key={n}>
        <Skeleton className="h-10 w-64 mb-6 rounded-lg" />
        <div className="flex space-x-6 md:space-x-8 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3 min-w-[180px] sm:min-w-[220px]">
              <Skeleton className="h-[270px] sm:h-[330px] w-full rounded-xl" />
              <div className="space-y-2 p-1">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
