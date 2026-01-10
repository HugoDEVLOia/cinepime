
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, Check, Info, Star, CalendarDays } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function DiscoveryItem({ media, isActive }: { media: Media, isActive: boolean }) {
  const { addToList, isInList } = useMediaLists();
  const { toast } = useToast();
  const [showHeart, setShowHeart] = useState(false);

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

  return (
    <section 
      className="relative h-full w-full snap-start snap-always flex-shrink-0"
      onDoubleClick={handleDoubleClick}
    >
      <Image
        src={media.backdropUrl || media.posterUrl}
        alt={`Arrière plan pour ${media.title}`}
        fill
        className="object-cover object-center"
        priority={isActive}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2, transition: { type: 'spring', stiffness: 200, damping: 10 } }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Heart className="h-24 w-24 text-white drop-shadow-lg" fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-6 text-white z-10">
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
          <Link href={`/media/movie/${media.id}`} className="flex flex-col items-center gap-1.5 group" target="_blank">
             <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors group-hover:bg-white/30">
              <Info className="h-7 w-7 transition-transform group-active:scale-90" />
            </div>
            <span className="text-xs font-semibold">Détails</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function VerticalDiscovery() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  const fetchMovies = useCallback(async (pageNum: number) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);
    try {
      const randomPage = Math.floor(Math.random() * 20) + 1;
      const { media: newMovies } = await getPopularMedia('movie', randomPage);
      const filteredMovies = newMovies.filter(
        m => m.backdropUrl && !m.backdropUrl.includes('picsum.photos')
      );
      
      setMovies(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNew = filteredMovies.filter(m => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });
      setPage(pageNum);

    } catch (error) {
      console.error("Erreur lors de la récupération des films:", error);
    } finally {
      setIsLoading(false);
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
    setActiveIndex(newIndex);
    
    // Fetch more when user is near the end of the list
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
        <DiscoveryItem key={movie.id} media={movie} isActive={index === activeIndex}/>
      ))}
      {isLoading && (
        <div className="h-full w-full snap-start snap-always flex-shrink-0 flex items-center justify-center bg-black">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      )}
    </div>
  );
}

    