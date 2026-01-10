
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPopularMedia, type Media, getMediaDetails } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, Check, Info, Star, CalendarDays, ArrowLeft, ArrowRight, PlaySquare } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion, useAnimation, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


function DirectLinksPanel({ media, isVisible }: { media: Media, isVisible: boolean }) {
    const isAnimation = media.genres?.some(g => g.id === 16);
    const animeSamaUrl = `https://anime-sama.tv/catalogue/${media.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/`;

    return (
        <div className={cn(
            "absolute inset-y-0 left-full w-full h-full bg-black/70 backdrop-blur-md p-6 flex flex-col justify-center items-center text-white transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            <h3 className="text-2xl font-bold mb-6">Liens Directs</h3>
             <div className="flex flex-col gap-4 w-full max-w-xs">
                <Button asChild size="lg" className="w-full" style={{ backgroundColor: '#1E1E1E' }}>
                    <a href={`https://cinepulse.lol/sheet/movie-${media.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-[#FF4545]">
                        <Image src="https://cinepulse.lol/favicons/favicon.svg" alt="Cinepulse Logo" width={20} height={20}/>
                        Cinepulse (VF/VOSTFR)
                    </a>
                </Button>
                {isAnimation && (
                    <Button asChild size="lg" variant="secondary" className="w-full">
                        <a href={animeSamaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <Image src="https://anime-sama.tv/img/favicon.ico" alt="Anime-Sama Logo" width={20} height={20} className="mr-2 rounded-sm"/>
                            Anime-Sama
                        </a>
                    </Button>
                )}
                 <p className="text-xs text-center text-muted-foreground mt-2">D'autres liens sont disponibles sur la page détaillée du film.</p>
            </div>
            <p className="absolute bottom-6 text-sm text-white/50 flex items-center gap-2"><ArrowLeft className="h-4 w-4"/> Glissez pour fermer</p>
        </div>
    )
}

function DetailsPanel({ media, isVisible }: { media: Media, isVisible: boolean }) {
  const director = media.credits?.crew?.find(c => c.job === 'Director');

  return (
    <div className={cn(
        "absolute inset-y-0 right-full w-full h-full bg-black/70 backdrop-blur-md p-6 flex flex-col justify-center items-start text-white transition-opacity duration-300 overflow-y-auto",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <h3 className="text-2xl font-bold mb-4">Détails</h3>
      <div className="space-y-4 text-sm w-full">
          {director && (
              <div>
                  <h4 className="font-semibold text-white/80 mb-1">Réalisateur</h4>
                  <p>{director.name}</p>
              </div>
          )}
          {media.cast && media.cast.length > 0 && (
              <div>
                  <h4 className="font-semibold text-white/80 mb-2">Distribution principale</h4>
                  <div className="flex flex-wrap gap-2">
                    {media.cast.slice(0, 5).map(actor => (
                        <Badge key={actor.id} variant="secondary" className="text-xs font-normal">{actor.name}</Badge>
                    ))}
                  </div>
              </div>
          )}
          {media.genres && media.genres.length > 0 && (
              <div>
                  <h4 className="font-semibold text-white/80 mb-2">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                      {media.genres.map(genre => (
                          <Badge key={genre.id} variant="outline" className="text-xs font-normal backdrop-blur-sm bg-white/10">{genre.name}</Badge>
                      ))}
                  </div>
              </div>
          )}
      </div>
       <Button asChild size="lg" className="mt-8 w-full">
            <Link href={`/media/movie/${media.id}`} target="_blank">
                Voir la page complète
            </Link>
       </Button>
      <p className="absolute bottom-6 text-sm text-white/50 flex items-center gap-2">Glissez pour fermer <ArrowRight className="h-4 w-4"/></p>
    </div>
  )
}


function DiscoveryItem({ media, isActive }: { media: Media, isActive: boolean }) {
  const { addToList, isInList } = useMediaLists();
  const { toast } = useToast();
  const [showHeart, setShowHeart] = useState(false);
  const [panel, setPanel] = useState<'details' | 'links' | null>(null);
  const controls = useAnimation();

  const handleLike = () => {
    if (isInList(media.id, 'toWatch')) return;
    addToList(media, 'toWatch');
    toast({
      title: "Ajouté !",
      description: `${media.title} a été ajouté à votre liste "À Regarder".`,
    });
  };

  const handleWatched = () => {
    if (isInList(media.id, 'watched')) return;
    addToList(media, 'watched');
    toast({
      title: "Marqué comme vu !",
      description: `Vous avez déjà vu ${media.title}.`,
    });
  };

  const handleDoubleClick = () => {
    handleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };
  
  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 100;

    if (offset.x > swipeThreshold || velocity.x > 500) {
      // Swiped Right -> Open Details
      setPanel('details');
      controls.start({ x: '95%' });
    } else if (offset.x < -swipeThreshold || velocity.x < -500) {
      // Swiped Left -> Open Links
      setPanel('links');
      controls.start({ x: '-95%' });
    } else {
      // Snap back
      setPanel(null);
      controls.start({ x: 0 });
    }
  };
  
  // Close panel by swiping back
  const onPanelDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    const swipeThreshold = 50;

    if ((panel === 'details' && offset.x < -swipeThreshold) || (panel === 'links' && offset.x > swipeThreshold)) {
      setPanel(null);
      controls.start({ x: 0 });
    } else {
      // Snap back to open state
      controls.start({ x: panel === 'details' ? '95%' : '-95%' });
    }
  };


  return (
    <section 
      className="relative h-full w-full snap-start snap-always flex-shrink-0 overflow-hidden"
    >
        <Image
            src={media.backdropUrl || media.posterUrl}
            alt={`Arrière plan pour ${media.title}`}
            fill
            className="object-cover object-center"
            priority={isActive}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        
        <DetailsPanel media={media} isVisible={panel === 'details'} />
        <DirectLinksPanel media={media} isVisible={panel === 'links'} />

        <motion.div
            className="relative w-full h-full"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={panel ? onPanelDragEnd : onDragEnd}
            animate={controls}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
            onDoubleClick={handleDoubleClick}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 transition-opacity duration-300", panel && "opacity-0")} />
          <div className={cn("absolute inset-0 bg-gradient-to-r from-black/50 to-transparent transition-opacity duration-300", panel && "opacity-0")} />

           <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2, transition: { type: 'spring', stiffness: 200, damping: 10 } }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="h-24 w-24 text-white drop-shadow-lg" fill="currentColor" />
              </motion.div>
            )}
           </AnimatePresence>

            <div className={cn("absolute bottom-0 left-0 right-0 p-6 flex items-end gap-6 text-white z-10 transition-opacity duration-300", panel && "opacity-0 pointer-events-none")}>
                <div className="flex-grow space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-lg">{media.title}</h1>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>{media.averageRating.toFixed(1)}</span>
                    </div>
                    {media.releaseDate && (
                    <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        <span>{new Date(media.releaseDate).getFullYear()}</span>
                    </div>
                    )}
                </div>
                <p className="text-white/80 text-sm leading-relaxed line-clamp-3 md:line-clamp-4 max-w-2xl drop-shadow-md">
                    {media.description}
                </p>
                </div>

                <div className="flex flex-col items-center gap-5">
                <button onClick={handleLike} className="flex flex-col items-center gap-1.5 group">
                    <div className={cn("h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors group-hover:bg-white/30", isInList(media.id, 'toWatch') && "bg-red-500/80")}>
                    <Heart className="h-7 w-7 transition-transform group-active:scale-90" fill={isInList(media.id, 'toWatch') ? "currentColor" : "none"} />
                    </div>
                    <span className="text-xs font-semibold">Aimer</span>
                </button>
                <button onClick={handleWatched} className="flex flex-col items-center gap-1.5 group">
                    <div className={cn("h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors group-hover:bg-white/30", isInList(media.id, 'watched') && "bg-green-500/80")}>
                    <Check className="h-7 w-7 transition-transform group-active:scale-90" />
                    </div>
                    <span className="text-xs font-semibold">Vu</span>
                </button>
                <Link href={`/media/movie/${media.id}`} className="flex flex-col items-center gap-1.5 group" target="_blank" onClick={(e) => e.stopPropagation()}>
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors group-hover:bg-white/30">
                    <Info className="h-7 w-7 transition-transform group-active:scale-90" />
                    </div>
                    <span className="text-xs font-semibold">Détails</span>
                </Link>
                </div>
            </div>
            {!panel && <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs animate-pulse hidden md:block">Glissez pour plus d'options</p>}
        </motion.div>
    </section>
  );
}

export default function VerticalDiscovery() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  const fetchMovies = useCallback(async (pageNum: number) => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (pageNum === 1) setIsLoading(true);

    try {
      const { media: newMovies } = await getPopularMedia('movie', pageNum);
       const detailedMoviesPromises = newMovies
        .filter(m => m.backdropUrl && !m.backdropUrl.includes('picsum.photos'))
        .map(m => getMediaDetails(m.id, m.mediaType as 'movie' | 'tv'));
      
      const detailedMoviesResponses = await Promise.all(detailedMoviesPromises);
      const detailedMovies = detailedMoviesResponses.filter((m): m is Media => m !== null);


      setMovies(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNew = detailedMovies.filter(m => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });
      setPage(pageNum);

    } catch (error) {
      console.error("Erreur lors de la récupération des films:", error);
    } finally {
      if (pageNum === 1) setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);


  const handleScroll = () => {
    const root = rootRef.current;
    if (!root) return;

    const { scrollTop, scrollHeight, clientHeight } = root;
    const newIndex = Math.round(scrollTop / clientHeight);
    
    if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
    }
    
    // Fetch more when user is 3 items away from the end of the list
    if (scrollTop + clientHeight >= scrollHeight - clientHeight * 3) {
      fetchMovies(page + 1);
    }
  };

  return (
    <div
      ref={rootRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
    >
      {movies.map((movie, index) => (
        <DiscoveryItem key={`${movie.id}-${index}`} media={movie} isActive={index === activeIndex}/>
      ))}
      {(isLoading || (isFetching.current && movies.length > 0)) && (
        <div className="h-full w-full snap-start snap-always flex-shrink-0 flex items-center justify-center bg-black">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      )}
    </div>
  );
}


    