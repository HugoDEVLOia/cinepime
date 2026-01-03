
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, X, Eye, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type SwipeState = 'loading' | 'ready' | 'empty';

const cardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3 }
  },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1 - Math.min(i, 3) * 0.05,
    y: Math.min(i, 3) * -10,
    zIndex: 10 - i,
    transition: { duration: 0.3 }
  }),
  exit: (direction: 'left' | 'right' | 'up') => ({
    x: direction === 'right' ? '150%' : direction === 'left' ? '-150%' : 0,
    y: direction === 'up' ? '-200%' : 0,
    opacity: 0,
    rotate: direction === 'right' ? 20 : direction === 'left' ? -20 : 0,
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
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [isLinksMenuOpen, setIsLinksMenuOpen] = useState(false);

  const { addToList, isInList } = useMediaLists();
  const { toast } = useToast();

  const fetchMovies = useCallback(async (pageNum: number) => {
    if (swipeState === 'loading' && pageNum > 1) return;
    setSwipeState('loading');
    try {
      const { media } = await getPopularMedia('movie', pageNum);
      const newMovies = media.filter(m => m.backdropUrl && !m.backdropUrl.includes('picsum.photos'));
      setMovies(prev => {
        const uniqueNewMovies = newMovies.filter(nm => !prev.some(pm => pm.id === nm.id));
        return [...prev, ...uniqueNewMovies];
      });
      setSwipeState('ready');
    } catch (error) {
      console.error("Erreur lors de la récupération des films:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de récupérer de nouveaux films.", variant: "destructive" });
      setSwipeState('empty');
    }
  }, [toast, swipeState]);

  useEffect(() => {
    fetchMovies(1);
  }, []); // Run only once on mount

  const currentMovie = useMemo(() => (movies.length > currentIndex ? movies[currentIndex] : null), [movies, currentIndex]);

  const paginate = (direction: 'left' | 'right' | 'up') => {
    if (!currentMovie || (swipeState !== 'ready' && swipeState !== 'empty')) return;
    
    setSwipeDirection(direction);

    if (direction === 'right') { // Add to list
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
    } else if (direction === 'up') {
        setIsLinksMenuOpen(true);
        return; // Don't advance the card yet
    }
    
    setCurrentIndex(prev => prev + 1);

    if (currentIndex >= movies.length - 5 && swipeState !== 'loading') {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMovies(nextPage);
    }
  };

  const handleRestart = () => {
      setSwipeState('loading');
      setCurrentIndex(0);
      setPage(1);
      setMovies([]);
      fetchMovies(1);
  }
  
  const handleLinkSelection = () => {
      setIsLinksMenuOpen(false);
      setTimeout(() => {
          setSwipeDirection('up'); // Trigger exit animation
          setCurrentIndex(prev => prev + 1);
      }, 100); 
  }
  
  const isAnimation = currentMovie?.genres?.some(g => g.id === 16);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
       <div className="relative w-full aspect-[16/9] mb-4">
            <AnimatePresence initial={false} custom={swipeDirection}>
              {movies.slice(currentIndex, currentIndex + 4).reverse().map((movie, i) => {
                  if (!movie) return null;
                  const isTopCard = i === movies.slice(currentIndex, currentIndex + 4).length - 1;
                  return (
                    <motion.div
                        key={movie.id}
                        className="absolute inset-0 w-full h-full"
                        style={{
                            cursor: isTopCard ? 'grab' : 'auto',
                            ...(isTopCard && { active: 'grabbing' }),
                        }}
                        custom={swipeDirection}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom_i={i} // Custom prop for variant
                        drag={isTopCard}
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.5}
                        onDragEnd={(e, { offset, velocity }) => {
                            if (!isTopCard) return;
                            const swipe = swipePower(offset.x, velocity.x);
                            const swipeUp = offset.y < -100;

                            if (swipeUp) {
                                paginate('up');
                            } else if (swipe < -swipeConfidenceThreshold) {
                                paginate('left');
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate('right');
                            }
                        }}
                    >
                      <Link href={`/media/movie/${movie.id}`} className="block w-full h-full" onClick={(e) => e.preventDefault()}>
                        <Card className="w-full h-full overflow-hidden rounded-2xl shadow-2xl bg-card">
                            <div className="relative w-full h-full">
                                <Image
                                src={movie.backdropUrl!}
                                alt={`Affiche de ${movie.title}`}
                                fill
                                className="object-cover"
                                priority={isTopCard}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-4 sm:p-6 text-white w-full">
                                    <h3 className="text-xl sm:text-2xl font-bold drop-shadow-lg">{movie.title}</h3>
                                    <p className="text-xs sm:text-sm text-white/80 line-clamp-2 mt-1 drop-shadow-md">{movie.description}</p>
                                </div>
                            </div>
                        </Card>
                      </Link>
                    </motion.div>
                )})}
            </AnimatePresence>
            {!currentMovie && (
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
            <AnimatePresence>
            {isLinksMenuOpen && currentMovie && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-lg rounded-2xl flex flex-col items-center justify-center p-6 z-20"
                >
                    <h3 className="text-2xl font-bold text-center mb-2 text-foreground">Liens pour</h3>
                    <h4 className="text-xl font-semibold text-center mb-6 text-primary truncate max-w-full">{currentMovie.title}</h4>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <Button asChild size="lg" variant="default" onClick={handleLinkSelection}>
                             <a href={`https://cinepulse.lol/sheet/movie-${currentMovie.id}`} target="_blank" rel="noopener noreferrer">
                                <Sparkles className="mr-2 h-5 w-5" /> Cinepulse
                            </a>
                        </Button>
                         <Button asChild size="lg" variant="secondary" onClick={handleLinkSelection}>
                            <a href={`https://movix.club/movie/${currentMovie.id}`} target="_blank" rel="noopener noreferrer">Movix</a>
                        </Button>
                         <Button asChild size="lg" variant="secondary" onClick={handleLinkSelection}>
                            <a href="https://xalaflix.men/" target="_blank" rel="noopener noreferrer">Xalaflix</a>
                        </Button>
                        {isAnimation && (
                            <Button asChild size="lg" variant="secondary" onClick={handleLinkSelection}>
                                <a href={`https://anime-sama.fr/catalogue/${currentMovie.title.toLowerCase().replace(/[\s:]/g, '-')}`} target="_blank" rel="noopener noreferrer">Anime-Sama</a>
                            </Button>
                        )}
                         <Button asChild size="lg" variant="secondary" onClick={handleLinkSelection}>
                            <a href="https://purstream.to/" target="_blank" rel="noopener noreferrer">PurStream</a>
                        </Button>
                    </div>
                     <Button variant="ghost" size="sm" onClick={() => setIsLinksMenuOpen(false)} className="mt-6 text-muted-foreground">
                        Annuler
                    </Button>
                </motion.div>
            )}
            </AnimatePresence>
       </div>

        <div className="flex flex-col items-center space-y-2 w-full mt-4">
             <div className="flex items-center justify-center gap-6">
                <Button
                    variant="outline"
                    size="icon"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-600 shadow-lg disabled:opacity-50 disabled:pointer-events-none"
                    onClick={() => paginate('left')}
                    disabled={!currentMovie || swipeState !== 'ready' || isLinksMenuOpen}
                >
                    <X className="h-8 w-8 sm:h-10 sm:w-10" />
                </Button>
                 <Button
                    variant="outline"
                    size="icon"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-600 shadow-lg disabled:opacity-50 disabled:pointer-events-none"
                    onClick={() => paginate('right')}
                    disabled={!currentMovie || swipeState !== 'ready' || isLinksMenuOpen}
                >
                    <Eye className="h-8 w-8 sm:h-10 sm:w-10" />
                </Button>
            </div>
            <div className="text-center text-muted-foreground text-sm flex items-center gap-1.5 pt-2">
                <LinkIcon className="h-4 w-4"/>
                <p>Glissez vers le haut pour les liens</p>
            </div>
        </div>
    </div>
  );
}
