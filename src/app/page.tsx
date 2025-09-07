
'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { ServerCrash, Star, CalendarDays, Clapperboard, Flame, Tv, Film, Eye, Ghost, Laugh, Rocket, PencilRuler, HeartPulse, Bomb, ShieldQuestion, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MediaCarousel from '@/components/media-carousel';
import { cn } from '@/lib/utils';


export default function HomePage() {
  const [heroCarouselItems, setHeroCarouselItems] = useState<Media[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const [trending, setTrending] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [popularTv, setPopularTv] = useState<Media[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<Media[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Media[]>([]);
  const [scifiMovies, setScifiMovies] = useState<Media[]>([]);
  const [animationMovies, setAnimationMovies] = useState<Media[]>([]);
  const [actionMovies, setActionMovies] = useState<Media[]>([]);
  const [thrillerMovies, setThrillerMovies] = useState<Media[]>([]);
  const [romanceMovies, setRomanceMovies] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toWatchList, isLoaded } = useMediaLists();

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
          actionMoviesData,
          thrillerMoviesData,
          romanceMoviesData,
        ] = await Promise.all([
          getTrendingMedia(1, 'week'),
          getPopularMedia('movie'),
          getPopularMedia('tv'),
          getPopularMedia('movie', 1, undefined, 27), // Genre ID for Horror
          getPopularMedia('movie', 1, undefined, 35), // Genre ID for Comedy
          getPopularMedia('movie', 1, undefined, 878), // Genre ID for Science Fiction
          getPopularMedia('movie', 1, undefined, 16), // Genre ID for Animation
          getPopularMedia('movie', 1, undefined, 28), // Genre ID for Action
          getPopularMedia('movie', 1, undefined, 53), // Genre ID for Thriller
          getPopularMedia('movie', 1, undefined, 10749), // Genre ID for Romance
        ]);
        
        const allCategories = {
            trending: trendingData.media,
            popularMovies: popularMoviesData.media,
            popularTv: popularTvData.media,
            action: actionMoviesData.media,
            scifi: scifiMoviesData.media,
            thriller: thrillerMoviesData.media,
            animation: animationMoviesData.media,
            horror: horrorMoviesData.media,
            comedy: comedyMoviesData.media,
            romance: romanceMoviesData.media,
        };

        const heroItems: Media[] = [];
        const seenIds = new Set<string>();

        Object.values(allCategories).forEach(category => {
            const firstValidItem = category.find(m => m.backdropUrl && m.backdropUrl.includes('image.tmdb.org') && !seenIds.has(m.id));
            if (firstValidItem) {
                heroItems.push(firstValidItem);
                seenIds.add(firstValidItem.id);
            }
        });

        setHeroCarouselItems(heroItems);
        
        setTrending(trendingData.media);
        setPopularMovies(popularMoviesData.media);
        setPopularTv(popularTvData.media);
        setHorrorMovies(horrorMoviesData.media);
        setComedyMovies(comedyMoviesData.media);
        setScifiMovies(scifiMoviesData.media);
        setAnimationMovies(animationMoviesData.media);
        setActionMovies(actionMoviesData.media);
        setThrillerMovies(thrillerMoviesData.media);
        setRomanceMovies(romanceMoviesData.media);

      } catch (err) {
        console.error("Erreur lors de la récupération des médias pour la page d'accueil:", err);
        setError("Impossible de charger le contenu. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllMedia();
  }, []);

  useEffect(() => {
    if (heroCarouselItems.length > 1) {
      const timer = setInterval(() => {
        setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroCarouselItems.length);
      }, 7000); // Change slide every 7 seconds
      return () => clearInterval(timer);
    }
  }, [heroCarouselItems.length]);

  const goToPreviousHero = () => {
    setCurrentHeroIndex((prevIndex) => (prevIndex - 1 + heroCarouselItems.length) % heroCarouselItems.length);
  };

  const goToNextHero = useCallback(() => {
    setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroCarouselItems.length);
  }, [heroCarouselItems.length]);
  
  const goToHeroSlide = (index: number) => {
    setCurrentHeroIndex(index);
  };


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
      {heroCarouselItems.length > 0 && (
        <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 md:-mt-12 h-[60vh] md:h-[75vh] flex items-center justify-center text-white overflow-hidden rounded-b-2xl shadow-2xl bg-muted">
          {heroCarouselItems.map((media, index) => (
            <div
              key={media.id}
              className={cn(
                "absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out",
                index === currentHeroIndex ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={media.backdropUrl || media.posterUrl}
                alt={`Image de fond pour ${media.title}`}
                fill
                className="object-cover object-center"
                priority={index === 0}
                data-ai-hint="hero background"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-black/40 z-0"></div>
            </div>
          ))}

          <div className="relative z-20 flex flex-col items-start max-w-2xl w-full text-left px-4 sm:px-6 lg:px-8">
            {heroCarouselItems[currentHeroIndex] && (
              <>
                <Badge variant={heroCarouselItems[currentHeroIndex].mediaType === 'movie' ? 'default' : 'secondary'} className="text-sm capitalize !px-3 !py-1.5 shadow-lg mb-4">
                    {heroCarouselItems[currentHeroIndex].mediaType === 'movie' ? <Film className="h-4 w-4 mr-1.5"/> : <Tv className="h-4 w-4 mr-1.5" />}
                    {heroCarouselItems[currentHeroIndex].mediaType === 'movie' ? 'Film' : 'Série'}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white shadow-2xl">
                  {heroCarouselItems[currentHeroIndex].title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/90 text-sm md:text-base mt-3 mb-5">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-1.5 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{heroCarouselItems[currentHeroIndex].averageRating.toFixed(1)}</span>
                  </div>
                  {heroCarouselItems[currentHeroIndex].releaseDate && (
                    <div className="flex items-center">
                      <CalendarDays className="w-5 h-5 mr-1.5" />
                      <span>{new Date(heroCarouselItems[currentHeroIndex].releaseDate!).getFullYear()}</span>
                    </div>
                  )}
                </div>
                <p className="text-md md:text-lg text-white/80 leading-relaxed line-clamp-3 mb-6">
                  {heroCarouselItems[currentHeroIndex].description}
                </p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  <Link href={`/media/${heroCarouselItems[currentHeroIndex].mediaType}/${heroCarouselItems[currentHeroIndex].id}`}>
                    Voir les détails
                  </Link>
                </Button>
              </>
            )}
          </div>
          
           {heroCarouselItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousHero}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white"
                aria-label="Diapositive précédente"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextHero}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white"
                aria-label="Diapositive suivante"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
                {heroCarouselItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToHeroSlide(index)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all duration-300",
                      currentHeroIndex === index ? "w-6 bg-primary" : "bg-white/50 hover:bg-white/80"
                    )}
                    aria-label={`Aller à la diapositive ${index + 1}`}
                  />
                ))}
              </div>
            </>
           )}

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

      {actionMovies.length > 0 && (
        <MediaCarousel 
          title="De l'action à l'état pur"
          media={actionMovies}
          icon={<Bomb className="h-7 w-7 text-primary" />}
        />
      )}

      {scifiMovies.length > 0 && (
        <MediaCarousel 
          title="Voyage vers l'inconnu"
          media={scifiMovies}
          icon={<Rocket className="h-7 w-7 text-primary" />}
        />
      )}

      {thrillerMovies.length > 0 && (
        <MediaCarousel 
          title="Suspense et sueurs froides"
          media={thrillerMovies}
          icon={<ShieldQuestion className="h-7 w-7 text-primary" />}
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

      {romanceMovies.length > 0 && (
        <MediaCarousel 
          title="Amour et passion"
          media={romanceMovies}
          icon={<HeartPulse className="h-7 w-7 text-primary" />}
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
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={`carousel-skeleton-${i}`}>
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
