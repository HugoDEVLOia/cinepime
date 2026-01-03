
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, X, Heart, Info, Link as LinkIcon, ExternalLink, Sparkles } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type SwipeState = 'loading' | 'ready' | 'empty';

export default function DiscoveryDeck() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeState, setSwipeState] = useState<SwipeState>('loading');
  const [page, setPage] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  const { addToList, isInList } = useMediaLists();
  const { toast } = useToast();
  const router = useRouter();

  const fetchMovies = useCallback(async (pageNum: number) => {
    if (swipeState === 'loading' && pageNum > 1) return;
    setSwipeState('loading');
    try {
      const { media } = await getPopularMedia('movie', pageNum);
      const newMovies = media.filter(m => m.posterUrl && !m.posterUrl.includes('picsum.photos'));
      
      setMovies(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNewMovies = newMovies.filter(nm => !existingIds.has(nm.id));
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
  }, []);

  const currentMovie = useMemo(() => (movies.length > currentIndex ? movies[currentIndex] : null), [movies, currentIndex]);

  const advanceToNextMovie = () => {
    setIsFlipped(false);
    setShowLinks(false);
    setCurrentIndex(prev => prev + 1);

    if (currentIndex >= movies.length - 5 && swipeState !== 'loading') {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  };
  
  const handleLike = useCallback(() => {
    if (!currentMovie) return;
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
  }, [currentMovie, addToList, isInList, toast]);
  
  const handleDoubleClick = () => {
    handleLike();
    advanceToNextMovie();
  }

  const handleRestart = () => {
    setSwipeState('loading');
    setCurrentIndex(0);
    setPage(1);
    setMovies([]);
    fetchMovies(1);
  }
  
  const handleDragEnd = (event: any, info: any) => {
    const yVelocity = info.velocity.y;
    const yOffset = info.offset.y;
    const xVelocity = info.velocity.x;
    const xOffset = info.offset.x;

    if (yOffset < -100 || yVelocity < -500) {
      advanceToNextMovie();
      return;
    }
    
    if (xOffset < -100 || xVelocity < -500) {
      if(currentMovie) router.push(`/media/movie/${currentMovie.id}`);
      return;
    }
    
    if (xOffset > 100 || xVelocity > 500) {
      setShowLinks(true);
      return;
    }
  };
  
  const isAnimation = currentMovie?.genres?.some(g => g.id === 16);

  if (swipeState === 'loading' && movies.length === 0) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-background">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      );
  }
  
  if (swipeState === 'empty' || !currentMovie) {
       return (
        <div className="flex flex-col items-center justify-center text-center p-6 h-full w-full bg-background">
            <h3 className="text-2xl font-bold text-foreground mb-3">C'est tout pour le moment !</h3>
            <p className="text-muted-foreground mb-6">Vous avez vu toutes les suggestions. Revenez plus tard.</p>
            <Button onClick={handleRestart} size="lg">
                <RotateCw className="mr-2 h-5 w-5" /> Recommencer
            </Button>
        </div>
    );
  }

  return (
    <motion.div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onDragEnd={handleDragEnd}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.2, bottom: 0.8 }}
    >
       <AnimatePresence>
         <motion.div
            key={currentIndex}
            className="w-full h-full absolute flex items-center justify-center"
        >
          <motion.div 
            id={`discover-card-${currentIndex}`}
            className="relative w-full h-full max-w-md max-h-[85vh] sm:max-h-[80vh] active:cursor-grabbing" 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.6, right: 0.6 }}
            onDragEnd={handleDragEnd}
            style={{ touchAction: 'pan-y' }}
          >
            <motion.div
              className="relative w-full h-full"
              style={{ perspective: 1000, transformStyle: "preserve-3d" }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {/* --- Front (Poster) --- */}
              <motion.div
                className="absolute w-full h-full shadow-2xl rounded-2xl overflow-hidden cursor-pointer"
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => setIsFlipped(f => !f)}
                onDoubleClick={handleDoubleClick}
              >
                  <Image
                    src={currentMovie.posterUrl}
                    alt={`Affiche de ${currentMovie.title}`}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end text-white">
                      <h2 className="text-3xl font-bold drop-shadow-lg">{currentMovie.title}</h2>
                  </div>
              </motion.div>

              {/* --- Back (Synopsis) --- */}
              <motion.div
                 className="absolute w-full h-full bg-card rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xl cursor-pointer"
                 style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                 onClick={() => setIsFlipped(f => !f)}
              >
                  <Info className="h-10 w-10 text-primary mb-4"/>
                  <h3 className="text-xl font-bold text-foreground mb-2">Synopsis</h3>
                  <p className="text-muted-foreground text-sm overflow-y-auto max-h-[60%] scrollbar-thin">
                    {currentMovie.description || "Aucune description disponible."}
                  </p>
              </motion.div>
            </motion.div>
            
             {/* --- Action bar on the right --- */}
             <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 flex flex-col gap-4">
                <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full bg-black/30 text-white backdrop-blur-sm" onClick={handleLike}>
                    <Heart className="h-7 w-7"/>
                </Button>
                 <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full bg-black/30 text-white backdrop-blur-sm" onClick={() => setIsFlipped(f => !f)}>
                    <Info className="h-7 w-7"/>
                </Button>
                 <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full bg-black/30 text-white backdrop-blur-sm" onClick={() => setShowLinks(true)}>
                    <LinkIcon className="h-7 w-7"/>
                </Button>
            </div>
          </motion.div>
        </motion.div>
       </AnimatePresence>
       
       {/* --- Links Panel --- */}
       <AnimatePresence>
        {showLinks && currentMovie && (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-md z-30 flex items-center justify-center"
                onClick={() => setShowLinks(false)}
            >
                 <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-xl font-bold text-center mb-2 text-foreground">Liens pour</h3>
                    <h4 className="text-lg font-semibold text-center mb-6 text-primary truncate max-w-full">{currentMovie.title}</h4>
                    <div className="grid grid-cols-1 gap-3 w-full">
                        <Button asChild size="lg" variant="default" onClick={() => setShowLinks(false)}>
                             <a href={`https://cinepulse.lol/sheet/movie-${currentMovie.id}`} target="_blank" rel="noopener noreferrer">
                                <Sparkles className="mr-2 h-5 w-5" /> Cinepulse
                            </a>
                        </Button>
                         <Button asChild size="lg" variant="secondary" onClick={() => setShowLinks(false)}>
                            <a href={`https://movix.club/movie/${currentMovie.id}`} target="_blank" rel="noopener noreferrer">Movix <ExternalLink className="ml-2 h-4 w-4"/></a>
                        </Button>
                         <Button asChild size="lg" variant="secondary" onClick={() => setShowLinks(false)}>
                            <a href="https://xalaflix.men/" target="_blank" rel="noopener noreferrer">Xalaflix <ExternalLink className="ml-2 h-4 w-4"/></a>
                        </Button>
                        {isAnimation && (
                            <Button asChild size="lg" variant="secondary" onClick={() => setShowLinks(false)}>
                                <a href={`https://anime-sama.fr/catalogue/${currentMovie.title.toLowerCase().replace(/[\s:]/g, '-')}`} target="_blank" rel="noopener noreferrer">Anime-Sama <ExternalLink className="ml-2 h-4 w-4"/></a>
                            </Button>
                        )}
                    </div>
                     <Button variant="ghost" size="sm" onClick={() => setShowLinks(false)} className="mt-6 text-muted-foreground">
                        Fermer
                    </Button>
                </motion.div>
            </motion.div>
        )}
       </AnimatePresence>
    </motion.div>
  );
}
