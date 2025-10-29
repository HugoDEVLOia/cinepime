
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, X, Eye } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type SwipeState = 'loading' | 'ready' | 'empty';

const cardVariants = {
  hidden: (direction: number) => ({
    x: direction > 0 ? '150%' : '-150%',
    opacity: 0,
    rotate: direction > 0 ? 25 : -25,
    transition: { duration: 0.4 }
  }),
  visible: {
    x: 0,
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '150%' : '-150%',
    opacity: 0,
    rotate: direction > 0 ? 25 : -25,
    transition: { duration: 0.4, ease: "easeIn" }
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function DiscoveryDeck() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeState, setSwipeState] = useState<SwipeState>('loading');
  const [page, setPage] = useState(1);
  const [swipeDirection, setSwipeDirection] = useState(0);

  const { addToList, isInList } = useMediaLists();
  const { toast } = useToast();

  const fetchMovies = useCallback(async (pageNum: number) => {
    setSwipeState('loading');
    try {
      const { media } = await getPopularMedia('movie', pageNum);
      const newMovies = media.filter(m => m.backdropUrl && !m.backdropUrl.includes('picsum.photos'));
      setMovies(prev => {
        const uniqueNewMovies = newMovies.filter(nm => !prev.some(pm => pm.id === nm.id));
        return [...prev, ...uniqueNewMovies]
      });
      setSwipeState('ready');
    } catch (error) {
      console.error("Erreur lors de la récupération des films:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de récupérer de nouveaux films.", variant: "destructive" });
      setSwipeState('empty');
    }
  }, [toast]);

  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  const currentMovie = useMemo(() => (movies.length > currentIndex ? movies[currentIndex] : null), [movies, currentIndex]);

  const handleSwipe = (direction: number) => {
    if (!currentMovie || (swipeState !== 'ready' && swipeState !== 'empty')) return;
    
    setSwipeDirection(direction);
    setCurrentIndex(prev => prev + 1);

    if (direction > 0) { // Right swipe
      if (!isInList(currentMovie.id, 'toWatch')) {
        addToList(currentMovie, 'toWatch');
        toast({
          title: "Ajouté !",
          description: `${currentMovie.title} a été ajouté à votre liste "À Regarder".`,
        });
      } else {
         toast({
          title: "Déjà dans la liste",
          description: `${currentMovie.title} est déjà dans votre liste "À Regarder".`,
        });
      }
    }
    
    if (currentIndex >= movies.length - 5 && swipeState !== 'loading') {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMovies(nextPage);
    }
  };

  const paginate = (newDirection: number) => {
    handleSwipe(newDirection);
  };
  
  const handleRestart = () => {
      setCurrentIndex(0);
      setPage(1);
      setMovies([]);
      fetchMovies(1);
  }

  return (
    <Card className="w-full max-w-xl mx-auto rounded-2xl shadow-xl bg-card p-4 sm:p-6 space-y-4">
       <div className="relative w-full aspect-[16/9] mb-4">
            <AnimatePresence initial={false} custom={swipeDirection}>
                {currentMovie ? (
                    <motion.div
                        key={currentIndex}
                        className="absolute inset-0 w-full h-full"
                        custom={swipeDirection}
                        variants={cardVariants}
                        initial="visible"
                        animate="visible"
                        exit="exit"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);
                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(-1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(1);
                            }
                        }}
                    >
                      <Link href={`/media/movie/${currentMovie.id}`} className="block w-full h-full">
                        <Card className="w-full h-full overflow-hidden rounded-2xl shadow-2xl bg-card">
                            <div className="relative w-full h-full">
                                <Image
                                src={currentMovie.backdropUrl!}
                                alt={`Affiche de ${currentMovie.title}`}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-4 sm:p-6 text-white w-full">
                                    <h3 className="text-xl sm:text-2xl font-bold drop-shadow-lg">{currentMovie.title}</h3>
                                    <p className="text-xs sm:text-sm text-white/80 line-clamp-2 mt-1 drop-shadow-md">{currentMovie.description}</p>
                                </div>
                            </div>
                        </Card>
                      </Link>
                    </motion.div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-2xl">
                         {swipeState === 'loading' ? (
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-6">
                                <h3 className="text-xl font-bold text-foreground mb-2">C'est tout pour le moment !</h3>
                                <p className="text-muted-foreground mb-4">Vous avez vu toutes les suggestions. Revenez plus tard ou recommencez.</p>
                                <Button onClick={handleRestart}>
                                    <RotateCw className="mr-2 h-4 w-4" /> Recommencer
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </AnimatePresence>
       </div>

       <div className="flex items-center justify-center gap-6">
            <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-100 hover:text-red-600 shadow-lg"
                onClick={() => paginate(-1)}
                disabled={!currentMovie || swipeState === 'loading'}
            >
                <X className="h-8 w-8 sm:h-10 sm:w-10" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-100 hover:text-green-600 shadow-lg"
                onClick={() => paginate(1)}
                disabled={!currentMovie || swipeState === 'loading'}
            >
                <Eye className="h-8 w-8 sm:h-10 sm:w-10" />
            </Button>
       </div>
    </Card>
  );
}
