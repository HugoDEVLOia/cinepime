
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
import { ServerCrash, Star, CalendarDays, Clapperboard, Flame, Tv, Film, Eye, Ghost, Laugh, Rocket, PencilRuler, HeartPulse, Bomb, ShieldQuestion, ChevronLeft, ChevronRight, Heart, Coffee, Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MediaCarousel from '@/components/media-carousel';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const [heroCarouselItems, setHeroCarouselItems] = useState<Media[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // State for swipe gesture
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const minSwipeDistance = 50;


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

        setHeroCarouselItems(heroItems.slice(0, 10)); // Limit to 10 for performance
        
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

  const goToPreviousHero = useCallback(() => {
    setCurrentHeroIndex((prevIndex) => (prevIndex - 1 + heroCarouselItems.length) % heroCarouselItems.length);
  }, [heroCarouselItems.length]);

  const goToNextHero = useCallback(() => {
    setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroCarouselItems.length);
  }, [heroCarouselItems.length]);

  useEffect(() => {
    if (heroCarouselItems.length > 1) {
      const timer = setInterval(goToNextHero, 7000); // Change slide every 7 seconds
      return () => clearInterval(timer);
    }
  }, [heroCarouselItems.length, goToNextHero]);

  const goToHeroSlide = (index: number) => {
    setCurrentHeroIndex(index);
  };
  
  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset touch end on new touch start
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      goToNextHero();
    } else if (isRightSwipe) {
      goToPreviousHero();
    }
    // Reset touch coordinates
    setTouchStart(0);
    setTouchEnd(0);
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
  
  const currentHeroItem = heroCarouselItems[currentHeroIndex];

  return (
    <div className="space-y-12 md:space-y-16">
      {heroCarouselItems.length > 0 && currentHeroItem && (
        <section 
          className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 md:-mt-12 h-[65vh] md:h-[80vh] flex items-center justify-center text-white overflow-hidden rounded-b-2xl shadow-lg bg-background"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
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
              <div className="absolute inset-0 bg-black/40 from-background/90 via-background/30 to-transparent bg-gradient-to-t"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent"></div>
            </div>
          ))}

          <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 lg:col-span-3 hidden md:block">
                 <Link href={`/media/${currentHeroItem.mediaType}/${currentHeroItem.id}`}>
                    <Card className="overflow-hidden rounded-xl shadow-2xl bg-transparent border-2 border-white/10 transition-all duration-300 hover:border-white/30 hover:scale-105">
                      <Image
                        src={currentHeroItem.posterUrl}
                        alt={`Affiche de ${currentHeroItem.title}`}
                        width={300}
                        height={450}
                        className="object-cover w-full h-auto"
                        priority
                      />
                    </Card>
                 </Link>
              </div>
              <div className="md:col-span-8 lg:col-span-7">
                <div className="flex flex-col items-center md:items-start max-w-2xl text-center md:text-left">
                  <Badge variant={currentHeroItem.mediaType === 'movie' ? 'default' : 'secondary'} className="text-sm capitalize !px-3 !py-1.5 shadow mb-4">
                      {currentHeroItem.mediaType === 'movie' ? <Film className="h-4 w-4 mr-1.5"/> : <Tv className="h-4 w-4 mr-1.5" />}
                      {currentHeroItem.mediaType === 'movie' ? 'Film' : 'Série'}
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-xl">
                    {currentHeroItem.title}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-white/90 text-sm md:text-base mt-3 mb-5">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-1.5 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{currentHeroItem.averageRating.toFixed(1)}</span>
                    </div>
                    {currentHeroItem.releaseDate && (
                      <div className="flex items-center">
                        <CalendarDays className="w-5 h-5 mr-1.5" />
                        <span>{new Date(currentHeroItem.releaseDate!).getFullYear()}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-md md:text-lg text-white/80 leading-relaxed line-clamp-3 mb-6 drop-shadow-md">
                    {currentHeroItem.description}
                  </p>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                    <Link href={`/media/${currentHeroItem.mediaType}/${currentHeroItem.id}`}>
                      Voir les détails
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
           {heroCarouselItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousHero}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm hidden md:inline-flex"
                aria-label="Diapositive précédente"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextHero}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm hidden md:inline-flex"
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
                      "h-2 w-2 rounded-full transition-all duration-300 backdrop-blur-sm",
                      currentHeroIndex === index ? "w-6 bg-primary" : "bg-white/40 hover:bg-white/70"
                    )}
                    aria-label={`Aller à la diapositive ${index + 1}`}
                  />
                ))}
              </div>
            </>
           )}

        </section>
      )}

      <Card className="shadow-lg rounded-2xl overflow-hidden group transition-shadow duration-300 border-border bg-card/60 backdrop-blur-sm">
        <Link href="/discover" className="block hover:bg-primary/5 transition-colors">
            <div className="flex flex-col md:flex-row items-center relative p-8">
                <div className="md:w-1/2 relative flex items-center justify-center mb-6 md:mb-0">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-slow"></div>
                        <div className="absolute inset-4 bg-primary/20 rounded-full animate-pulse-slower"></div>
                        <Compass className="h-24 w-24 text-primary drop-shadow-lg transition-transform duration-500 group-hover:rotate-12" />
                        <div className="absolute top-0 right-0 bg-card p-2 rounded-xl shadow-lg transform rotate-12 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6">
                            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                        </div>
                        <div className="absolute bottom-0 left-0 bg-card p-2 rounded-xl shadow-lg transform -rotate-12 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-6">
                             <X className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                <div className="md:w-1/2 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-foreground mb-3 transition-colors">
                    Explorez avec le <span className="text-primary">Mode Découverte</span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto md:mx-0">
                    Une nouvelle façon amusante de trouver votre prochain coup de cœur. Double-cliquez pour aimer, glissez pour explorer. Simple et intuitif.
                  </p>
                  <Button size="lg">
                    Lancer la découverte <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </div>
            </div>
        </Link>
      </Card>


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

      <Card className="bg-card border-border shadow-lg rounded-xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-3">
                <Heart className="h-8 w-8 text-primary"/>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Soutenez CinéCollection !</CardTitle>
            <CardDescription className="text-muted-foreground max-w-xl mx-auto">
             C'est grâce à vos dons que nous pouvons garder ce site gratuit et sans aucune publicité. Chaque contribution, même la plus petite, fait une grande différence. Merci !
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700 text-white shadow-md">
                <a href="https://paypal.me/hugodevlo" target="_blank" rel="noopener noreferrer">
                    <Heart className="mr-2 h-5 w-5" /> Faire un don PayPal
                </a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="shadow-md bg-yellow-400 hover:bg-yellow-500 text-black">
                <a href="https://ko-fi.com/hugodevlo" target="_blank" rel="noopener noreferrer">
                    <Coffee className="mr-2 h-5 w-5" /> Soutenir sur Ko-fi
                </a>
            </Button>
        </CardContent>
      </Card>


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
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 md:-mt-12 h-[65vh] md:h-[80vh] bg-muted rounded-b-2xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full">
           <div className="md:col-span-3 lg:col-span-2 hidden md:block">
              <Skeleton className="w-full aspect-[2/3] rounded-lg" />
            </div>
            <div className="md:col-span-9 lg:col-span-7 flex flex-col justify-center items-center md:items-start text-center md:text-left">
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
      </div>
    </div>

    {/* Discovery Deck Skeleton */}
    <section>
        <Skeleton className="h-10 w-64 mb-6 rounded-lg" />
        <div className="relative w-full max-w-xl h-full max-h-[600px] mx-auto">
            <div className="absolute inset-0 flex items-center justify-center bg-card rounded-2xl">
                <Skeleton className="h-full w-full rounded-2xl" />
            </div>
        </div>
    </section>
    
    {/* Carousel Skeleton */}
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i}>
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

    
