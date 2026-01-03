
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, Heart, Info, Link as LinkIcon, ExternalLink, Sparkles, Star, CalendarDays, X, Tv } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
    // Only set to loading on the very first fetch or when restarting
    if (movies.length === 0) {
      setSwipeState('loading');
    }
    
    try {
      const { media } = await getPopularMedia('movie', pageNum);
      const newMovies = media.filter(m => m.posterUrl && !m.posterUrl.includes('picsum.photos') && m.backdropUrl && !m.backdropUrl.includes('picsum.photos'));
      
      setMovies(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNewMovies = newMovies.filter(nm => !existingIds.has(nm.id));
        return [...prev, ...uniqueNewMovies];
      });
      
      setSwipeState('ready');
    } catch (error) {
      console.error("Erreur lors de la récupération des films:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de récupérer de nouveaux films.", variant: "destructive" });
      if (movies.length === 0) {
        setSwipeState('empty');
      }
    }
  }, [toast, movies.length]);


  useEffect(() => {
    // Fetch initial movies with a random page
    fetchMovies(Math.floor(Math.random() * 50) + 1);
  }, []);

  const currentMovie = useMemo(() => (movies.length > currentIndex ? movies[currentIndex] : null), [movies, currentIndex]);

  const advanceToNextMovie = useCallback(() => {
    setIsFlipped(false);
    setShowLinks(false);
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      // Load more movies when we're nearing the end of the current list
      if (nextIndex >= movies.length - 5 && swipeState === 'ready') {
        setPage(p => p + 1);
        fetchMovies(Math.floor(Math.random() * 50) + 1);
      }
      return nextIndex;
    });
  }, [movies.length, swipeState, fetchMovies]);
  
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
    if (!currentMovie) return;
    handleLike();
    // Maybe add a little heart animation on the poster
  }

  const handleRestart = () => {
    setSwipeState('loading');
    setCurrentIndex(0);
    setMovies([]);
    fetchMovies(Math.floor(Math.random() * 50) + 1);
  }
  
  const handleDragEnd = (event: any, info: any) => {
    const yOffset = info.offset.y;
    const xOffset = info.offset.x;

    if (yOffset < -150) { // Swipe up
      advanceToNextMovie();
      return;
    }
    
    if (xOffset < -150) { // Swipe left
      if(currentMovie) router.push(`/media/movie/${currentMovie.id}`);
      return;
    }
    
    if (xOffset > 150) { // Swipe right
      setShowLinks(true);
      return;
    }
  };
  
  const isAnimation = currentMovie?.genres?.some(g => g.id === 16);

  if (swipeState === 'loading' && movies.length === 0) {
      return (
        <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      );
  }
  
  if (swipeState === 'empty' || !currentMovie) {
       return (
        <div className="flex flex-col items-center justify-center text-center p-6 h-full w-full">
            <div className="absolute inset-0 bg-background -z-10"></div>
            <Tv className="w-24 h-24 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-3">C'est tout pour le moment !</h3>
            <p className="text-muted-foreground mb-6">Vous avez vu toutes les suggestions. Revenez plus tard.</p>
            <Button onClick={handleRestart} size="lg">
                <RotateCw className="mr-2 h-5 w-5" /> Recommencer
            </Button>
        </div>
    );
  }

  return (
    <>
       <AnimatePresence>
        {currentMovie && (
        <motion.div
            key={`${currentIndex}-bg`}
            className="absolute inset-0 w-full h-full"
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {currentMovie.backdropUrl && (
              <Image
                src={currentMovie.backdropUrl}
                alt={`Arrière plan pour ${currentMovie.title}`}
                fill
                className="object-cover object-center blur-xl scale-110 opacity-30"
              />
            )}
             <div className="absolute inset-0 bg-background/60"></div>
        </motion.div>
        )}
       </AnimatePresence>
      <div 
          className="w-full h-full flex items-center justify-center p-4 sm:p-8"
          onDoubleClick={handleDoubleClick}
      >
        <AnimatePresence>
          {currentMovie && (
          <motion.div 
            key={currentIndex}
            id={`discover-card-${currentIndex}`}
            className="relative w-full h-full max-w-[400px] sm:max-h-[calc(100vh-12rem)] aspect-[2/3] active:cursor-grabbing" 
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={{ left: 0.5, right: 0.5, top: 0.1, bottom: 0.8 }}
            onDragEnd={handleDragEnd}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.4 } }}
            exit={{ y: -50, opacity: 0, transition: { duration: 0.4 } }}
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
                className="absolute w-full h-full shadow-2xl rounded-2xl overflow-hidden cursor-pointer bg-muted"
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => !showLinks && setIsFlipped(f => !f)}
              >
                  <Image
                    src={currentMovie.posterUrl}
                    alt={`Affiche de ${currentMovie.title}`}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end text-white">
                      <div className="space-y-1"> 
                          <h2 className="text-3xl font-bold drop-shadow-lg leading-tight">{currentMovie.title}</h2>
                          <div className="flex items-center text-sm gap-3 text-white/90 drop-shadow-sm">
                              {currentMovie.releaseDate && (
                                  <div className="flex items-center gap-1.5">
                                      <CalendarDays className="w-4 h-4" /> 
                                      <span>{new Date(currentMovie.releaseDate).getFullYear()}</span>
                                  </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 
                                  <span>{currentMovie.averageRating.toFixed(1)}</span>
                              </div>
                          </div>
                      </div>
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
          </motion.div>
          )}
        </AnimatePresence>
      </div>


       {/* --- Action bar on the right --- */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-20 flex flex-col items-center gap-6">
             <button 
              onClick={handleLike}
              className="flex flex-col items-center gap-1 text-white text-xs font-semibold group"
            >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-sm shadow-lg transition-all duration-300 group-hover:bg-red-500/70 group-active:scale-90">
                    <Heart className={cn("h-7 w-7 text-white transition-all", isInList(currentMovie.id, 'toWatch') && "fill-white")}/>
                </div>
            </button>
            <button 
                onClick={() => setIsFlipped(f => !f)}
                className="flex flex-col items-center gap-1 text-white text-xs font-semibold group"
            >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-sm shadow-lg transition-all duration-300 group-hover:bg-primary/70 group-active:scale-90">
                    <Info className="h-7 w-7 text-white transition-transform group-hover:scale-110"/>
                </div>
            </button>
            <button 
              onClick={() => setShowLinks(true)}
              className="flex flex-col items-center gap-1 text-white text-xs font-semibold group"
            >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-sm shadow-lg transition-all duration-300 group-hover:bg-green-500/70 group-active:scale-90">
                    <LinkIcon className="h-7 w-7 text-white transition-transform group-hover:scale-110"/>
                </div>
            </button>
        </div>


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
                    transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-card p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-xl font-bold text-center mb-2 text-foreground">Liens pour</h3>
                    <h4 className="text-lg font-semibold text-center mb-6 text-primary truncate max-w-full">{currentMovie.title}</h4>
                    <div className="grid grid-cols-1 gap-3 w-full">
                         <Button asChild size="lg" className="w-full bg-black hover:bg-gray-800 text-red-400" onClick={() => setShowLinks(false)}>
                            <a href={`https://cinepulse.lol/sheet/movie-${currentMovie.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                <Image src="https://cinepulse.lol/favicons/favicon.svg" alt="Cinepulse Logo" width={20} height={20} className="mr-2"/>
                                Cinepulse
                            </a>
                        </Button>
                         <Button asChild size="lg" variant="secondary" onClick={() => setShowLinks(false)}>
                            <Link href={`/media/movie/${currentMovie.id}`}><Info className="mr-2 h-5 w-5" /> Voir la fiche détaillée</Link>
                        </Button>
                         <Button asChild size="lg" variant="secondary" onClick={() => setShowLinks(false)}>
                            <a href="https://movix.blog/" target="_blank" rel="noopener noreferrer">Movix <ExternalLink className="ml-2 h-4 w-4"/></a>
                        </Button>
                        {isAnimation && (
                            <Button asChild size="lg" variant="secondary" onClick={() => setShowLinks(false)}>
                                <a href={`https://anime-sama.fr/catalogue/${currentMovie.title.toLowerCase().replace(/[\\s:]/g, '-')}`} target="_blank" rel="noopener noreferrer">Anime-Sama <ExternalLink className="ml-2 h-4 w-4"/></a>
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
    </>
  );
}
