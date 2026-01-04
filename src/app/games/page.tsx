
'use client';

import { useEffect, useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Puzzle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getPopularMedia } from '@/services/tmdb';
import { Skeleton } from '@/components/ui/skeleton';

export default function GamesPage() {
  const [image, setImage] = useState<string>("https://picsum.photos/600/400?blur=2");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Espace Jeux Cinéma | CinéPrime';

    async function fetchGameImage() {
      try {
        const { media: popularMovies } = await getPopularMedia('movie');
        const movieWithBackdrop = popularMovies.find(m => m.backdropUrl && !m.backdropUrl.includes('picsum.photos'));
        if (movieWithBackdrop) {
          setImage(movieWithBackdrop.backdropUrl);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic image for games page:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchGameImage();
  }, []);

  if (isLoading) {
    return <GamesPageSkeleton />;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-primary"/> Espace Jeux
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="shadow-lg rounded-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              <Image 
                src={image}
                alt="Image pour le jeu de Puzzle"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="jeu puzzle film"
              />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Puzzle className="h-20 w-20 text-white/80" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CardTitle className="text-2xl font-bold text-foreground mb-2">Puzzle Coulissant</CardTitle>
            <CardDescription className="mb-6 min-h-[40px]">
              Reconstituez l'affiche d'un film en faisant glisser les pièces du puzzle. Un classique pour tester votre logique !
            </CardDescription>
            <Button asChild className="w-full" size="lg">
              <Link href="/games/sliding-puzzle">
                Jouer maintenant <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GamesPageSkeleton() {
  return (
     <div className="space-y-10 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="p-0">
                    <Skeleton className="h-48 w-full" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-12 w-full mt-4" />
                </CardContent>
            </Card>
        </div>
     </div>
  )
}
