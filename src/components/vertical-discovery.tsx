

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getPopularMedia, type Media, getMediaDetails } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, Check, Info, Star, CalendarDays, ArrowLeft, Link2 } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion, useAnimation, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


function DirectLinksPanel({ media }: { media: Media }) {
    const isAnimation = media.genres?.some(g => g.id === 16);
    const animeSamaUrl = `https://anime-sama.tv/catalogue/${media.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/`;

    return (
        <div className={cn(
            "absolute inset-y-0 left-full w-full h-full bg-black/70 backdrop-blur-md p-6 flex flex-col justify-center items-center text-white"
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
        </div>
    )
}

function DiscoveryItem({ media, isActive }: { media: Media, isActive: boolean }) {
  const { addToList, isInList } = useMediaLists();
  const { toast } = useToast();
  const router = useRouter();
  const [showHeart, setShowHeart] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
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
    event.stopPropagation();
    const { offset, velocity } = info;
    const swipeThreshold = 80;

    if (offset.x < -swipeThreshold || velocity.x < -300) {
        // Swipe right to left -> Go to details
        router.push(`/media/movie/${media.id}?from=discover`);
    } else if (offset.x > swipeThreshold || velocity.x > 300) {
        // Swipe left to right -> Show links
        controls.start({ x: '100%' });
    } else {
        // Not enough swipe, snap back
        controls.start({ x: 0 });
    }
  };
  
  const onPanelDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    event.stopPropagation();
    const { offset, velocity } = info;
    const swipeThreshold = 80;

    if (offset.x < -swipeThreshold || velocity.x < -300) {
        // Swipe left on panel, close it
        controls.start({ x: 0 });
    } else {
        controls.start({ x: '100%' });
    }
  }


  return (
    <section 
      className="relative h-full w-full snap-start snap-always flex-shrink-0 overflow-hidden"
    >
        <motion.div
            className="absolute inset-0 flex"
            animate={controls}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.4 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.2, right: 0.2 }}
            onDragEnd={onDragEnd}
        >
            <DirectLinksPanel media={media} />

            <div
                className="w-full h-full flex-shrink-0 flex flex-col justify-end bg-black"
                onDoubleClick={handleDoubleClick}
            >
              <div className="relative w-full flex-grow flex items-center justify-center p-4 perspective-1000">
                  <AnimatePresence>
                    {showHeart && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.2, transition: { type: 'spring', stiffness: 200, damping: 10 } }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                        <Heart className="h-24 w-24 text-white drop-shadow-lg" fill="currentColor" />
                    </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <motion.div 
                    className="relative w-full max-w-[calc(90vh*0.66)] h-full max-h-[90vh] preserve-3d"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    {/* Front of the card */}
                     <motion.div 
                        className="absolute w-full h-full backface-hidden cursor-pointer"
                        onClick={() => setIsFlipped(true)}
                     >
                        <Image src={media.posterUrl} alt={`Affiche de ${media.title}`} fill className="object-contain rounded-2xl shadow-2xl" />
                     </motion.div>

                    {/* Back of the card */}
                    <motion.div
                        className="absolute w-full h-full backface-hidden p-6 bg-card rounded-2xl flex flex-col justify-center items-center text-card-foreground cursor-pointer"
                        style={{ transform: 'rotateY(180deg)' }}
                        onClick={() => setIsFlipped(false)}
                    >
                        <h3 className="text-xl font-bold mb-4">Synopsis</h3>
                        <p className="text-sm text-center text-muted-foreground overflow-y-auto scrollbar-thin">
                            {media.description}
                        </p>
                    </motion.div>
                  </motion.div>
              </div>

              <div className="flex-shrink-0 p-6 pt-2 flex items-center justify-between text-white bg-gradient-to-t from-black/80 to-transparent">
                  <div className="space-y-1">
                      <h1 className="text-2xl font-bold leading-tight drop-shadow-lg">{media.title}</h1>
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
                  </div>

                  <div className="flex flex-col items-center gap-4">
                      <button onClick={handleLike} className="flex flex-col items-center gap-1.5 group">
                          <div className={cn("h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors group-hover:bg-white/30", isInList(media.id, 'toWatch') && "bg-red-500/80")}>
                          <Heart className="h-7 w-7 transition-transform group-active:scale-90" fill={isInList(media.id, 'toWatch') ? "currentColor" : "none"} />
                          </div>
                      </button>
                      <button onClick={handleWatched} className="flex flex-col items-center gap-1.5 group">
                          <div className={cn("h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors group-hover:bg-white/30", isInList(media.id, 'watched') && "bg-green-500/80")}>
                          <Check className="h-7 w-7 transition-transform group-active:scale-90" />
                          </div>
                      </button>
                  </div>
              </div>
               <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs animate-pulse hidden md:block">Glissez pour plus d'options</p>
            </div>
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
        .filter(m => m.posterUrl && !m.posterUrl.includes('picsum.photos'))
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
    if(page === 0) {
      fetchMovies(1);
    }
  }, [fetchMovies, page]);


  const handleScroll = () => {
    const root = rootRef.current;
    if (!root) return;

    const { scrollTop, scrollHeight, clientHeight } = root;
    const newIndex = Math.round(scrollTop / clientHeight);
    
    if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
    }
    
    if (scrollTop + clientHeight >= scrollHeight - clientHeight * 3) {
      if (!isFetching.current) {
          fetchMovies(page + 1);
      }
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
