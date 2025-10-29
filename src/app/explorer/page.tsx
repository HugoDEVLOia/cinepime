
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, X, Eye } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type SwipeState = 'loading' | 'ready' | 'swiped' | 'empty';

export default function ExplorerPage() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeState, setSwipeState] = useState<SwipeState>('loading');
  const [page, setPage] = useState(1);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const { addToList, isInList } = useMediaLists();
  const { toast } = useToast();

  const fetchMovies = useCallback(async (pageNum: number) => {
    try {
      const { media } = await getPopularMedia('movie', pageNum);
      const newMovies = media.filter(m => m.backdropUrl && !m.backdropUrl.includes('picsum.photos'));
      setMovies(prev => [...prev, ...newMovies]);
      setSwipeState('ready');
    } catch (error) {
      console.error("Erreur lors de la récupération des films:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de récupérer de nouveaux films.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  const currentMovie = movies.length > currentIndex ? movies[currentIndex] : null;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentMovie || swipeState !== 'ready') return;
    
    setSwipeDirection(direction);
    setSwipeState('swiped');

    if (direction === 'right') {
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
    
    setTimeout(() => {
      if (currentIndex >= movies.length - 5) {
        setPage(prev => prev + 1);
        fetchMovies(page + 1);
      }
      
      setCurrentIndex(prev => prev + 1);
      setSwipeState('ready');
      setSwipeDirection(null);
    }, 400); // Duration of the swipe animation
  };

  const ExplorerCard = ({ movie, isCurrent }: { movie: Media, isCurrent: boolean }) => {
    const isSwipedLeft = isCurrent && swipeDirection === 'left';
    const isSwipedRight = isCurrent && swipeDirection === 'right';

    return (
       <Card 
        className={cn(
          "absolute inset-0 w-full h-full overflow-hidden rounded-2xl shadow-2xl bg-card transition-transform duration-300 ease-in-out",
          isCurrent ? "z-10" : "z-0 scale-[0.95] -translate-y-2 opacity-50",
          isSwipedLeft && "-translate-x-[150%] -rotate-12",
          isSwipedRight && "translate-x-[150%] rotate-12"
        )}
      >
        <div className="relative w-full h-full">
            <Image
              src={movie.backdropUrl!}
              alt={`Affiche de ${movie.title}`}
              fill
              className="object-cover"
              priority={isCurrent}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                <h2 className="text-3xl font-bold drop-shadow-lg">{movie.title}</h2>
                <p className="text-sm text-white/80 line-clamp-3 mt-2 drop-shadow-md">{movie.description}</p>
            </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full">
       <div className="relative w-full max-w-xl h-full max-h-[600px] mb-8">
            {swipeState === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-card rounded-2xl">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
            )}

            {movies.length > 0 && movies.map((movie, index) => {
                 if (index < currentIndex) return null;
                 if (index > currentIndex + 2) return null; // Render only the next few cards for performance
                 return (
                    <ExplorerCard key={movie.id} movie={movie} isCurrent={index === currentIndex} />
                 );
            })}

            {swipeState === 'ready' && movies.length > 0 && currentIndex >= movies.length && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-card rounded-2xl text-center p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">C'est tout pour le moment !</h2>
                    <p className="text-muted-foreground mb-4">Vous avez vu toutes les suggestions. Revenez plus tard pour de nouvelles découvertes.</p>
                    <Button onClick={() => { setCurrentIndex(0); setPage(1); setMovies([]); fetchMovies(1); }}>
                        <RotateCw className="mr-2 h-4 w-4" /> Recommencer
                    </Button>
                </div>
            )}
       </div>

       <div className="flex items-center gap-6">
            <Button
                variant="outline"
                size="icon"
                className="w-20 h-20 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-100 hover:text-red-600 shadow-lg"
                onClick={() => handleSwipe('left')}
                disabled={swipeState !== 'ready'}
            >
                <X className="h-10 w-10" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="w-20 h-20 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-100 hover:text-green-600 shadow-lg"
                onClick={() => handleSwipe('right')}
                disabled={swipeState !== 'ready'}
            >
                <Eye className="h-10 w-10" />
            </Button>
       </div>
    </div>
  );
}
