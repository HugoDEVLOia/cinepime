
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, ImageIcon, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getPopularMedia } from '@/services/tmdb';

export default async function GamesPage() {
  let gameImageUrl = "https://picsum.photos/600/400?blur=2";
  let gameImageAlt = "Image d'ambiance pour le jeu Devine l'Affiche";

  try {
    // Fetch popular movies to get a dynamic image
    const { media: popularMovies } = await getPopularMedia('movie');
    if (popularMovies.length > 0) {
      // Pick a random movie that has a backdrop image
      const moviesWithBackdrop = popularMovies.filter(m => m.backdropUrl && !m.backdropUrl.includes('picsum.photos'));
      if (moviesWithBackdrop.length > 0) {
        const randomMovie = moviesWithBackdrop[Math.floor(Math.random() * moviesWithBackdrop.length)];
        if(randomMovie.backdropUrl) {
            gameImageUrl = randomMovie.backdropUrl;
            gameImageAlt = `Affiche du film ${randomMovie.title}`;
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch dynamic image for games page:", error);
    // Fallback to the default picsum image in case of an error
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
                src={gameImageUrl}
                alt={gameImageAlt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="jeu affiche film"
              />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <ImageIcon className="h-20 w-20 text-white/80" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CardTitle className="text-2xl font-bold text-foreground mb-2">Devine l'Affiche</CardTitle>
            <CardDescription className="mb-6 min-h-[40px]">
              Une affiche de film, quatre propositions. Trouvez le bon titre le plus de fois possible en 30 secondes chrono !
            </CardDescription>
            <Button asChild className="w-full" size="lg">
              <Link href="/games/guess-the-poster">
                Jouer maintenant <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* --- Carte pour un futur jeu (placeholder) --- */}
        <Card className="shadow-lg rounded-xl overflow-hidden bg-muted/40 border-dashed border-2 flex flex-col items-center justify-center text-center p-6">
           <CardTitle className="text-xl font-semibold text-muted-foreground mb-2">Bientôt...</CardTitle>
           <CardDescription>
             De nouveaux jeux arriveront prochainement pour tester votre culture cinématographique !
           </CardDescription>
        </Card>
      </div>
    </div>
  );
}
