

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, Heart, X, Info } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DiscoveryDeck() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { addToList, isInList } = useMediaLists();
  const { toast } = useToast();

  const fetchMovies = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const { media: newMovies } = await getPopularMedia('movie', page);
      const filteredMovies = newMovies.filter(m => m.posterUrl && !m.posterUrl.includes('picsum.photos'));
      setMovies(prev => [...prev, ...filteredMovies]);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de récupérer de nouveaux films.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Initial fetch of 2 pages
    fetchMovies(1);
    fetchMovies(2);
  }, [fetchMovies]);

  const handleSwipe = (liked: boolean) => {
    const currentMovie = movies[currentIndex];
    if (!currentMovie) return;

    if (liked) {
      if (!isInList(currentMovie.id, 'toWatch')) {
        addToList(currentMovie, 'toWatch');
        toast({
          title: "Ajouté !",
          description: `${currentMovie.title} a été ajouté à votre liste "À Regarder".`,
        });
      }
    }

    if (currentIndex === movies.length - 5) {
      // Fetch more movies when user is 5 cards away from the end
      fetchMovies(Math.floor(movies.length / 20) + 2);
    }

    setCurrentIndex(prev => prev + 1);
  };
  
  const currentMovie = movies[currentIndex];

  if (isLoading && movies.length === 0) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 text-primary animate-spin" /></div>;
  }
  
  if (!currentMovie) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-6 h-full w-full bg-background rounded-2xl">
            <RotateCw className="w-24 h-24 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-3">C'est tout pour le moment !</h3>
            <p className="text-muted-foreground mb-6">Vous avez vu toutes les suggestions.</p>
            <Button onClick={() => window.location.reload()} size="lg"><RotateCw className="mr-2 h-5 w-5" /> Recharger</Button>
        </div>
    );
  }

  return (
    <div className="w-full h-full max-w-sm mx-auto flex flex-col items-center justify-center p-4">
      <motion.div 
        className="relative w-full aspect-[9/14] rounded-2xl overflow-hidden shadow-2xl bg-muted"
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onDoubleClick={() => handleSwipe(true)}
      >
        <Image src={currentMovie.posterUrl} alt={`Affiche de ${currentMovie.title}`} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
          <h2 className="text-3xl font-bold drop-shadow-lg leading-tight">{currentMovie.title}</h2>
          <p className="text-sm text-white/80 drop-shadow-sm">{currentMovie.releaseDate ? new Date(currentMovie.releaseDate).getFullYear() : ''}</p>
        </div>
      </motion.div>

      <div className="flex items-center justify-center gap-4 mt-6 w-full">
        <Button onClick={() => handleSwipe(false)} variant="outline" size="icon" className="h-16 w-16 rounded-full bg-background/80 shadow-2xl backdrop-blur-sm">
          <X className="h-8 w-8 text-destructive" />
        </Button>
        <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-full bg-background/80 shadow-lg backdrop-blur-sm">
            <Link href={`/media/movie/${currentMovie.id}`} target="_blank">
                <Info className="h-6 w-6 text-muted-foreground" />
            </Link>
        </Button>
        <Button onClick={() => handleSwipe(true)} variant="outline" size="icon" className="h-16 w-16 rounded-full bg-background/80 shadow-2xl backdrop-blur-sm">
          <Heart className="h-8 w-8 text-green-500" />
        </Button>
      </div>
    </div>
  );
}
