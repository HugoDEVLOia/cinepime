
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, Heart, X, ChevronsRight, ChevronsUp, ChevronsDown, Link as LinkIcon, Info } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type SwipeState = 'loading' | 'ready' | 'empty';

const GestureIcon = ({ icon: Icon, className, controls }: { icon: React.ElementType, className?: string, controls: any }) => (
  <motion.div 
    className={cn("absolute inset-0 flex items-center justify-center -z-10", className)}
    initial={{ scale: 0.5, opacity: 0 }}
    animate={controls}
  >
    <div className="w-24 h-24 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <Icon className="w-12 h-12 text-white" />
    </div>
  </motion.div>
);

export default function DiscoveryDeck() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeState, setSwipeState] = useState<SwipeState>('loading');
  const [page, setPage] = useState(1);
  const [showLinks, setShowLinks] = useState(false);
  const [showSynopsis, setShowSynopsis] = useState(false);
  const [liked, setLiked] = useState(false);

  const { addToList, isInList } = useMediaLists();
  const { toast } = useToast();
  const router = useRouter();
  
  const upControls = useAnimation();
  const downControls = useAnimation();
  const leftControls = useAnimation();
  const rightControls = useAnimation();

  const fetchMovies = useCallback(async (pageNum: number) => {
    if (movies.length === 0) setSwipeState('loading');
    
    try {
      const { media } = await getPopularMedia('movie', pageNum);
      const newMovies = media.filter(m => 
        m.posterUrl && !m.posterUrl.includes('picsum.photos') && 
        m.backdropUrl && !m.backdropUrl.includes('picsum.photos')
      );
      
      setMovies(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNewMovies = newMovies.filter(nm => !existingIds.has(nm.id));
        return [...prev, ...uniqueNewMovies];
      });
      
      setSwipeState('ready');
    } catch (error) {
      console.error("Erreur lors de la récupération des films:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de récupérer de nouveaux films.", variant: "destructive" });
      if (movies.length === 0) setSwipeState('empty');
    }
  }, [toast, movies.length]);

  useEffect(() => {
    fetchMovies(Math.floor(Math.random() * 50) + 1);
  }, []);

  const currentMovie = useMemo(() => (movies.length > currentIndex ? movies[currentIndex] : null), [movies, currentIndex]);

  const advanceToNextMovie = useCallback(() => {
    if (showSynopsis) setShowSynopsis(false);
    if (currentIndex < movies.length - 1) {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= movies.length - 5 && swipeState === 'ready') {
          setPage(p => {
            fetchMovies(Math.floor(Math.random() * 50) + 1);
            return p + 1;
          });
        }
        return nextIndex;
      });
    } else {
       setSwipeState('empty');
    }
  }, [currentIndex, movies.length, swipeState, fetchMovies, showSynopsis]);

  const goToPreviousMovie = useCallback(() => {
    if (showSynopsis) setShowSynopsis(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, showSynopsis]);
  
  const handleLike = useCallback(() => {
    if (!currentMovie || showSynopsis) return;
    if (!isInList(currentMovie.id, 'toWatch')) {
      addToList(currentMovie, 'toWatch');
      setLiked(true);
      setTimeout(() => setLiked(false), 800);
      toast({
        title: "Ajouté !",
        description: `${currentMovie.title} a été ajouté à votre liste "À Regarder".`,
      });
    }
  }, [currentMovie, addToList, isInList, toast, showSynopsis]);

  const handleDrag = (event: any, info: any) => {
    const { offset } = info;
    const opacityThreshold = 30;
    const getOpacity = (val: number) => Math.min(Math.abs(val) / opacityThreshold, 0.7);

    if (offset.y < 0) upControls.start({ opacity: getOpacity(offset.y) });
    else upControls.start({ opacity: 0 });

    if (offset.y > 0) downControls.start({ opacity: getOpacity(offset.y) });
    else downControls.start({ opacity: 0 });

    if (offset.x < 0) leftControls.start({ opacity: getOpacity(offset.x) });
    else leftControls.start({ opacity: 0 });

    if (offset.x > 0) rightControls.start({ opacity: getOpacity(offset.x) });
    else rightControls.start({ opacity: 0 });
  };

  const handleDragEnd = (event: any, info: any) => {
    const { offset } = info;
    const swipeThreshold = 100;
    
    [upControls, downControls, leftControls, rightControls].forEach(c => c.start({ opacity: 0, scale: 0.5 }));

    if (offset.y < -swipeThreshold) {
      advanceToNextMovie();
    } else if (offset.y > swipeThreshold && currentIndex > 0) {
      goToPreviousMovie();
    } else if (offset.x < -swipeThreshold) {
      if(currentMovie) router.push(`/media/movie/${currentMovie.id}`);
    } else if (offset.x > swipeThreshold) {
      setShowLinks(true);
    }
  };

  const handleRestart = () => {
    setSwipeState('loading');
    setCurrentIndex(0);
    setMovies([]);
    setPage(1);
    fetchMovies(Math.floor(Math.random() * 50) + 1);
  };
  
  const onTap = (event: any, info: any) => {
    if (showLinks) return;
    setShowSynopsis(s => !s);
  };

  const cardVariants = {
    initial: { y: 0, opacity: 0, scale: 0.9 },
    animate: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: (direction: 'up' | 'down' | 'left' | 'right') => {
      let exitProps = {};
      if (direction === 'up') exitProps = { y: -300, opacity: 0 };
      if (direction === 'down') exitProps = { y: 300, opacity: 0 };
      if (direction === 'left') exitProps = { x: -300, opacity: 0, rotate: -15 };
      if (direction === 'right') exitProps = { x: 300, opacity: 0, rotate: 15 };
      return { ...exitProps, transition: { duration: 0.3, ease: 'easeIn' } };
    }
  };

  if (swipeState === 'loading' && movies.length === 0) {
    return <div className="flex items-center justify-center h-full w-full"><Loader2 className="h-16 w-16 text-primary animate-spin" /></div>;
  }
  
  if (swipeState === 'empty' || !currentMovie) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 h-full w-full">
        <div className="absolute inset-0 bg-background -z-10"></div>
        <RotateCw className="w-24 h-24 text-muted-foreground mb-6" />
        <h3 className="text-2xl font-bold text-foreground mb-3">C'est tout pour le moment !</h3>
        <p className="text-muted-foreground mb-6">Vous avez vu toutes les suggestions.</p>
        <Button onClick={handleRestart} size="lg"><RotateCw className="mr-2 h-5 w-5" /> Recommencer</Button>
      </div>
    );
  }
  
  const isAnimation = currentMovie?.genres?.some(g => g.id === 16);
  const animeSamaUrl = currentMovie ? `https://anime-sama.tv/catalogue/${currentMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/` : '#';

  return (
    <>
      <AnimatePresence>
        {currentMovie && (
          <motion.div
            key={`${currentIndex}-bg`}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {currentMovie.backdropUrl && <Image src={currentMovie.backdropUrl} alt={`Arrière plan pour ${currentMovie.title}`} fill className="object-cover object-center blur-2xl scale-125 opacity-30" />}
            <div className="absolute inset-0 bg-background/60"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <GestureIcon icon={ChevronsUp} className="-top-8" controls={upControls} />
      <GestureIcon icon={ChevronsDown} className="-bottom-8" controls={downControls} />
      <GestureIcon icon={ChevronsRight} className="-left-8" controls={leftControls} />
      <GestureIcon icon={LinkIcon} className="-right-8" controls={rightControls} />

      <div className="w-full h-full flex items-center justify-center">
        <AnimatePresence initial={false}>
          {currentMovie && (
            <motion.div
              key={currentIndex}
              className="relative w-full h-full max-w-[400px] max-h-[calc(100vh-12rem)] aspect-[9/16] sm:aspect-[2/3] cursor-grab active:cursor-grabbing"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit={(custom) => cardVariants.exit(custom)}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={{ top: 0.2, bottom: 0.2, left: 0.5, right: 0.5 }}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onDoubleClick={handleLike}
              onTap={onTap}
            >
              <motion.div 
                className="w-full h-full shadow-2xl rounded-2xl bg-muted relative"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: showSynopsis ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Face avant */}
                <motion.div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                    <Image src={currentMovie.posterUrl} alt={`Affiche de ${currentMovie.title}`} fill className="object-cover rounded-2xl" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end text-white rounded-2xl">
                        <h2 className="text-3xl font-bold drop-shadow-lg leading-tight">{currentMovie.title}</h2>
                        <p className="text-sm text-white/80 drop-shadow-sm">{currentMovie.releaseDate ? new Date(currentMovie.releaseDate).getFullYear() : ''}</p>
                    </div>
                </motion.div>
                
                {/* Face arrière */}
                <motion.div 
                    className="absolute w-full h-full bg-card p-6 rounded-2xl overflow-y-auto"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                   <h3 className="text-2xl font-bold mb-3 text-foreground">{currentMovie.title}</h3>
                   <div className="flex flex-wrap gap-2 mb-4">
                      {currentMovie.genres?.slice(0, 3).map(g => <span key={g.id} className="text-xs bg-primary/10 text-primary-foreground font-semibold px-2 py-1 rounded-full">{g.name}</span>)}
                   </div>
                   <p className="text-sm text-muted-foreground">{currentMovie.description}</p>
                </motion.div>
                 
                 <AnimatePresence>
                  {liked && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 0.9, 1.1, 1], opacity: [1, 0.9, 1, 0] }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
              className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-center mb-2 text-foreground">Liens pour</h3>
              <h4 className="text-lg font-semibold text-center mb-6 text-primary truncate max-w-full">{currentMovie.title}</h4>
              <div className="grid grid-cols-1 gap-3 w-full">
                <Button asChild size="lg" className="w-full flex items-center justify-center gap-2 text-[#FF4545]" style={{ backgroundColor: '#1E1E1E' }} onClick={() => setShowLinks(false)}>
                  <a href={`https://cinepulse.lol/sheet/movie-${currentMovie.id}`} target="_blank" rel="noopener noreferrer"><Image src="https://cinepulse.lol/favicons/favicon.svg" alt="Cinepulse" width={20} height={20}/> Cinepulse</a>
                </Button>
                <Button asChild size="lg" style={{ backgroundColor: '#E50914', color: '#F5F5F1' }} className="hover:bg-red-800" onClick={() => setShowLinks(false)}>
                  <a href="https://movix.blog/" target="_blank" rel="noopener noreferrer"><Image src="https://movix.blog/assets/movix-CzqwVOTS.png" alt="Movix" width={20} height={20} className="rounded-sm mr-2"/> Movix</a>
                </Button>
                <Button asChild size="lg" style={{ backgroundColor: '#4c1d95', color: '#fff' }} className="hover:bg-purple-900" onClick={() => setShowLinks(false)}>
                  <a href={`https://xalaflix.men/`} target="_blank" rel="noopener noreferrer"><Image src="https://xalaflix.men/upload/images/logo/1.png" alt="Xalaflix" width={20} height={20} className="rounded-sm mr-2"/> Xalaflix</a>
                </Button>
                 <Button asChild size="lg" style={{ backgroundColor: '#212121', color: '#fff' }} className="hover:bg-black/80" onClick={() => setShowLinks(false)}>
                      <a href={`https://purstream.to/`} target="_blank" rel="noopener noreferrer">
                          <Image src="https://purstream.to/assets/favicon.BYaz4d7M.ico" alt="PurStream" width={20} height={20} className="rounded-sm mr-2"/>PurStream
                      </a>
                  </Button>
                {isAnimation && (
                  <Button asChild size="lg" variant="secondary" onClick={() => setShowLinks(false)}>
                    <a href={animeSamaUrl} target="_blank" rel="noopener noreferrer"><Image src="https://anime-sama.tv/img/favicon.ico" alt="Anime-Sama" width={20} height={20} className="rounded-sm mr-2"/> Anime-Sama</a>
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowLinks(false)} className="mt-4 rounded-full"><X className="h-5 w-5" /></Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
