
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, ImageIcon, ArrowRight, UserSearch, FilmIcon } from 'lucide-react';
import Image from 'next/image';
import { getPopularMedia } from '@/services/tmdb';

export default async function GamesPage() {
  let guessThePosterImageUrl = "https://picsum.photos/600/400?blur=2";
  let guessThePosterImageAlt = "Image d'ambiance pour le jeu Devine l'Affiche";
  let guessTheActorImageUrl = "https://picsum.photos/600/400?blur=1";
  let guessTheActorImageAlt = "Image d'ambiance pour le jeu Devine l'Acteur";
  let guessTheMovieImageUrl = "https://picsum.photos/600/400?blur=3";
  let guessTheMovieImageAlt = "Image d'ambiance pour le jeu Devine le Film";

  try {
    const { media: popularMovies } = await getPopularMedia('movie');
    if (popularMovies.length > 2) {
      const moviesWithBackdrop = popularMovies.filter(m => m.backdropUrl && !m.backdropUrl.includes('picsum.photos'));
      if (moviesWithBackdrop.length > 2) {
        // Ensure 3 unique random movies
        const uniqueMovies = [...new Map(moviesWithBackdrop.map(m => [m.id, m])).values()];
        const shuffledMovies = uniqueMovies.sort(() => 0.5 - Math.random());
        const selectedMovies = shuffledMovies.slice(0, 3);

        if (selectedMovies[0]?.backdropUrl) {
            guessThePosterImageUrl = selectedMovies[0].backdropUrl;
            guessThePosterImageAlt = `Affiche du film ${selectedMovies[0].title}`;
        }
        if (selectedMovies[1]?.backdropUrl) {
            guessTheActorImageUrl = selectedMovies[1].backdropUrl;
            guessTheActorImageAlt = `Affiche du film ${selectedMovies[1].title}`;
        }
        if (selectedMovies[2]?.backdropUrl) {
            guessTheMovieImageUrl = selectedMovies[2].backdropUrl;
            guessTheMovieImageAlt = `Affiche du film ${selectedMovies[2].title}`;
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

        <Card className="shadow-lg rounded-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              <Image 
                src={guessTheMovieImageUrl}
                alt={guessTheMovieImageAlt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="jeu trouver film"
              />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <FilmIcon className="h-20 w-20 text-white/80" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CardTitle className="text-2xl font-bold text-foreground mb-2">Devine le Film</CardTitle>
            <CardDescription className="mb-6 min-h-[40px]">
             À partir d'un acteur, retrouvez un film dans lequel il ou elle a joué.
            </CardDescription>
            <Button asChild className="w-full" size="lg">
              <Link href="/games/guess-the-movie">
                Jouer maintenant <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
