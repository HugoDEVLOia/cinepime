
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, ImageIcon, ArrowRight, UserSearch } from 'lucide-react';
import Image from 'next/image';
import { getPopularMedia } from '@/services/tmdb';

export default async function GamesPage() {
  let guessThePosterImageUrl = "https://picsum.photos/600/400?blur=2";
  let guessThePosterImageAlt = "Image d'ambiance pour le jeu Devine l'Affiche";
  let guessTheActorImageUrl = "https://picsum.photos/600/400?blur=1";
  let guessTheActorImageAlt = "Image d'ambiance pour le jeu Devine l'Acteur";

  try {
    const { media: popularMovies } = await getPopularMedia('movie');
    if (popularMovies.length > 1) {
      const moviesWithBackdrop = popularMovies.filter(m => m.backdropUrl && !m.backdropUrl.includes('picsum.photos'));
      if (moviesWithBackdrop.length > 1) {
        const randomMovie1 = moviesWithBackdrop[Math.floor(Math.random() * moviesWithBackdrop.length)];
        let randomMovie2 = moviesWithBackdrop[Math.floor(Math.random() * moviesWithBackdrop.length)];
        
        // Ensure we have two different movies
        while(randomMovie1.id === randomMovie2.id) {
            randomMovie2 = moviesWithBackdrop[Math.floor(Math.random() * moviesWithBackdrop.length)];
        }

        if(randomMovie1.backdropUrl) {
            guessThePosterImageUrl = randomMovie1.backdropUrl;
            guessThePosterImageAlt = `Affiche du film ${randomMovie1.title}`;
        }
        if(randomMovie2.backdropUrl) {
            guessTheActorImageUrl = randomMovie2.backdropUrl;
            guessTheActorImageAlt = `Affiche du film ${randomMovie2.title}`;
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch dynamic image for games page:", error);
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
                src={guessThePosterImageUrl}
                alt={guessThePosterImageAlt}
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
              Une affiche, quatre propositions. Trouvez le bon titre le plus de fois possible en 30 secondes chrono !
            </CardDescription>
            <Button asChild className="w-full" size="lg">
              <Link href="/games/guess-the-poster">
                Jouer maintenant <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg rounded-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              <Image 
                src={guessTheActorImageUrl}
                alt={guessTheActorImageAlt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="jeu acteur film"
              />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <UserSearch className="h-20 w-20 text-white/80" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CardTitle className="text-2xl font-bold text-foreground mb-2">Devine l'Acteur</CardTitle>
            <CardDescription className="mb-6 min-h-[40px]">
              À partir d'une affiche, retrouvez un acteur ou une actrice qui joue dans le film.
            </CardDescription>
            <Button asChild className="w-full" size="lg">
              <Link href="/games/guess-the-actor">
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
