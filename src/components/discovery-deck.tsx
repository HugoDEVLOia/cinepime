
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, Heart, X, Info, Undo2 } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type SwipeState = 'loading' | 'ready' | 'empty';

const CARD_OFFSET = 10;
const SCALE_FACTOR = 0.05;

export default function DiscoveryDeck() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [swipeState, setSwipeState] = useState<SwipeState>('loading');
  const [page, setPage] = useState(1);
  const [swipedMovies, setSwipedMovies] = useState<Media[]>([]);

  const { addToList, isInList } = useMediaLists();
  const { toast } = useToast();

  const fetchMovies = useCallback(async (pageNum: number) => {
      setSwipeState('loading');
      try {
        const { media } = await getPopularMedia('movie', pageNum);
        const newMovies = media.filter(m => 
          m.posterUrl && !m.posterUrl.includes('picsum.photos') &&
          m.backdropUrl && !m.backdropUrl.includes('picsum.photos')
        );
        
        setMovies(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNewMovies = newMovies.filter(nm => !existingIds.has(nm.id));
            return [...uniqueNewMovies, ...prev]; // Add new movies at the beginning
        });

      } catch (error) {
        console.error("Erreur lors de la récupération des films:", error);
        toast({ title: "Erreur de chargement", description: "Impossible de récupérer de nouveaux films.", variant: "destructive" });
      } finally {
        setSwipeState('ready');
      }
  }, [toast]);

  useEffect(() => {
    fetchMovies(Math.floor(Math.random() * 20) + 1);
  }, []);

  const activeIndex = useMemo(() => movies.length - 1, [movies]);
  const currentMovie = useMemo(() => movies[activeIndex], [movies, activeIndex]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (swipeState !== 'ready' || !currentMovie) return;

    if (direction === 'right') {
        if (!isInList(currentMovie.id, 'toWatch')) {
            addToList(currentMovie, 'toWatch');
            toast({
                title: "Ajouté !",
                description: `${currentMovie.title} a été ajouté à votre liste "À Regarder".`,
            });
        }
    }
    
    setSwipedMovies(prev => [currentMovie, ...prev]);
    setMovies(prev => prev.slice(0, -1));

    if (movies.length <= 5) {
      fetchMovies(page + 1);
      setPage(p => p + 1);
    }
  }, [swipeState, currentMovie, addToList, isInList, toast, movies.length, fetchMovies, page]);
  
  const undoSwipe = useCallback(() => {
    if (swipedMovies.length > 0) {
      const lastSwiped = swipedMovies[0];
      setMovies(prev => [...prev, lastSwiped]);
      setSwipedMovies(prev => prev.slice(1));
    }
  }, [swipedMovies]);

  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 100;
    const swipePower = Math.abs(offset.x) * velocity.x;

    if (swipePower < -swipeThreshold || offset.x < -swipeThreshold) {
      handleSwipe('left');
    } else if (swipePower > swipeThreshold || offset.x > swipeThreshold) {
      handleSwipe('right');
    }
  };

  if (swipeState === 'loading' && movies.length === 0) {
    return <div className="flex items-center justify-center h-full w-full"><Loader2 className="h-16 w-16 text-primary animate-spin" /></div>;
  }
  
  return (
     <>
      <AnimatePresence>
        {currentMovie && (
          <motion.div
            key={`${activeIndex}-bg`}
            className="absolute inset-0 w-full h-full -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {currentMovie.backdropUrl && <Image src={currentMovie.backdropUrl} alt="" fill className="object-cover object-center blur-2xl scale-125 opacity-30" />}
            <div className="absolute inset-0 bg-background/60"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full h-full max-w-[350px] max-h-[calc(100vh-14rem)] aspect-[9/16] sm:aspect-[2/3] flex items-center justify-center">
        {movies.length > 0 ? (
          movies.map((movie, index) => {
            const isTopCard = index === activeIndex;
            return (
              <motion.div
                key={movie.id}
                className="absolute w-full h-full shadow-2xl rounded-2xl bg-muted cursor-grab active:cursor-grabbing"
                style={{
                    transformOrigin: 'bottom center'
                }}
                initial={{
                  y: CARD_OFFSET * (activeIndex - index),
                  scale: 1 - SCALE_FACTOR * (activeIndex - index),
                  opacity: index === activeIndex ? 1 : 0.5,
                }}
                animate={{
                  y: CARD_OFFSET * (activeIndex - index),
                  scale: 1 - SCALE_FACTOR * (activeIndex - index),
                  opacity: 1,
                }}
                drag={isTopCard ? "x" : false}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.5}
                onDragEnd={onDragEnd}
                onDoubleClick={() => handleSwipe('right')}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <Image src={movie.posterUrl} alt={`Affiche de ${movie.title}`} fill className="object-cover rounded-2xl" priority={isTopCard} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end text-white rounded-2xl">
                    <h2 className="text-3xl font-bold drop-shadow-lg leading-tight">{movie.title}</h2>
                    <p className="text-sm text-white/80 drop-shadow-sm">{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''}</p>
                </div>
                 <AnimatePresence>
                  {isTopCard && (
                    <motion.div
                      className="absolute top-8 left-8 -rotate-12"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ 
                        opacity: [0, 0, 0, 1],
                        scale: [1, 1.2, 1],
                        x: [0, 0, 0, 0]
                      }}
                      whileDrag={{
                        opacity: [0, 1, 1],
                        scale: [1, 1.2, 1],
                        x: [0, 0, -200],
                        transition: { duration: 0.3 }
                      }}
                    >
                      <span className="text-3xl font-bold text-red-500 border-4 border-red-500 px-4 py-2 rounded-lg -rotate-12 transform">NON</span>
                    </motion.div>
                  )}
                  </AnimatePresence>
                   <AnimatePresence>
                    {isTopCard && (
                        <motion.div
                        className="absolute top-8 right-8 rotate-12"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ 
                            opacity: [0, 0, 0, 1],
                            scale: [1, 1.2, 1],
                            x: [0, 0, 0, 0]
                        }}
                        whileDrag={{
                            opacity: [0, 1, 1],
                            scale: [1, 1.2, 1],
                            x: [0, 0, 200],
                            transition: { duration: 0.3 }
                        }}
                        >
                        <span className="text-3xl font-bold text-green-500 border-4 border-green-500 px-4 py-2 rounded-lg rotate-12 transform">OUI</span>
                        </motion.div>
                    )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 h-full w-full">
                <RotateCw className="w-24 h-24 text-muted-foreground mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-3">C'est tout pour le moment !</h3>
                <p className="text-muted-foreground mb-6">Vous avez vu toutes les suggestions.</p>
                <Button onClick={() => fetchMovies(Math.floor(Math.random() * 20) + 1)} size="lg"><RotateCw className="mr-2 h-5 w-5" /> Recharger</Button>
            </div>
        )}
      </div>

       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <Button onClick={() => handleSwipe('left')} variant="outline" size="icon" className="h-16 w-16 rounded-full bg-background/80 shadow-2xl" disabled={!currentMovie}>
          <X className="h-8 w-8 text-destructive" />
        </Button>
        <Button onClick={undoSwipe} variant="outline" size="icon" className="h-12 w-12 rounded-full bg-background/80 shadow-lg" disabled={swipedMovies.length === 0}>
            <Undo2 className="h-6 w-6 text-muted-foreground" />
        </Button>
        {currentMovie &&
            <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-full bg-background/80 shadow-lg">
                <Link href={`/media/movie/${currentMovie.id}`} target="_blank">
                    <Info className="h-6 w-6 text-muted-foreground" />
                </Link>
            </Button>
        }
        <Button onClick={() => handleSwipe('right')} variant="outline" size="icon" className="h-16 w-16 rounded-full bg-background/80 shadow-2xl" disabled={!currentMovie}>
          <Heart className="h-8 w-8 text-green-500" />
        </Button>
      </div>
     </>
  );
}

