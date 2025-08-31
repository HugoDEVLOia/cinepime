
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getPopularMedia, getMediaDetails, type Media, type Actor } from '@/services/tmdb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ServerCrash, Gamepad2, Trophy, Check, X, RotateCw, Home, ChevronsRight, Search, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from '@/lib/utils';

type GameState = 'idle' | 'loading' | 'playing' | 'answered';

export default function GuessTheActorPage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [movie, setMovie] = useState<Media | null>(null);
  const [cast, setCast] = useState<Actor[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);

  const fetchNewMovie = useCallback(async () => {
    setGameState('loading');
    setMovie(null);
    setCast([]);
    setFeedback(null);
    setSelectedActor(null);
    try {
      let foundMovieWithCast = false;
      while (!foundMovieWithCast) {
        const randomPage = Math.floor(Math.random() * 20) + 1; // get from top 20 pages
        const { media } = await getPopularMedia('movie', randomPage);
        const validMovies = media.filter(m => m.posterUrl && !m.posterUrl.includes('picsum.photos'));
        
        if (validMovies.length > 0) {
            const randomMovie = validMovies[Math.floor(Math.random() * validMovies.length)];
            const details = await getMediaDetails(randomMovie.id, 'movie');
            if (details && details.cast && details.cast.length > 5) {
                setMovie(details);
                setCast(details.cast);
                foundMovieWithCast = true;
            }
        }
      }
      setGameState('playing');
    } catch (error) {
      console.error("Erreur lors de la récupération du film:", error);
      setGameState('idle'); // or show error state
    }
  }, []);

  const startGame = () => {
    fetchNewMovie();
  };

  const handleActorSelect = (actor: Actor) => {
    setSelectedActor(actor);
    setFeedback('correct'); // In this game, any selection from the list is correct
    setGameState('answered');
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'loading':
        return <GameLoadingSkeleton />;

      case 'playing':
      case 'answered':
        if (!movie) return <GameLoadingSkeleton />;
        return (
          <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:items-start gap-8">
            <Card className="relative overflow-hidden shadow-2xl rounded-xl w-full max-w-sm mx-auto aspect-[2/3] bg-muted shrink-0">
              <Image
                key={movie.id}
                src={movie.posterUrl}
                alt={`Affiche de ${movie.title}`}
                width={500}
                height={750}
                className="object-cover w-full h-full"
                priority
                data-ai-hint="affiche jeu acteur"
              />
            </Card>
            <div className="w-full flex flex-col items-center md:items-start">
              <h2 className="text-2xl font-bold text-center md:text-left text-foreground">Retrouvez un acteur/actrice de ce film :</h2>
              <h3 className="text-3xl font-extrabold text-primary text-center md:text-left mb-6">{movie.title}</h3>
              
              <ActorCombobox 
                actors={cast} 
                onActorSelect={handleActorSelect}
                selectedActor={selectedActor}
                disabled={gameState === 'answered'}
              />
              
              {gameState === 'answered' && feedback === 'correct' && selectedActor && (
                 <Card className="mt-6 w-full bg-green-50 border-green-200 shadow-lg animate-fade-in">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <UserCheck className="h-12 w-12 text-green-500 mb-2"/>
                        <p className="text-xl font-bold text-green-700">Bien joué !</p>
                        <p className="text-md text-green-600">
                           <span className="font-semibold">{selectedActor.name}</span> joue bien le rôle de <span className="font-semibold">{selectedActor.character}</span> dans ce film.
                        </p>
                         <Button onClick={fetchNewMovie} size="lg" className="mt-4 w-full sm:w-auto bg-green-600 hover:bg-green-700">
                            <ChevronsRight className="mr-2 h-5 w-5" /> Film Suivant
                        </Button>
                    </CardContent>
                 </Card>
              )}

            </div>
          </div>
        );

      case 'idle':
      default:
        return (
          <Card className="w-full max-w-md p-8 text-center shadow-2xl rounded-xl animate-fade-in">
            <CardContent className="p-0">
              <Gamepad2 className="h-20 w-20 text-primary mx-auto mb-4" />
              <h2 className="text-4xl font-extrabold text-foreground">Devine l'Acteur</h2>
              <p className="text-lg text-muted-foreground mt-2 mb-8">
                Une affiche de film s'affiche, à vous de retrouver un acteur ou une actrice présent(e) dans le casting !
              </p>
              <Button onClick={startGame} size="lg" className="w-full text-lg py-7">
                Commencer une partie
              </Button>
                 <Button asChild size="lg" variant="outline" className="w-full mt-4">
                    <Link href="/games">
                        <Home className="mr-2 h-5 w-5" /> Autres jeux
                    </Link>
                 </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-250px)] p-4">
      {renderGameState()}
    </div>
  );
}

function ActorCombobox({
  actors,
  onActorSelect,
  selectedActor,
  disabled
}: {
  actors: Actor[],
  onActorSelect: (actor: Actor) => void,
  selectedActor: Actor | null,
  disabled: boolean
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedActor?.id || "");

  useEffect(() => {
    // Reset value if selectedActor is cleared (e.g., new game)
    if (!selectedActor) {
      setValue("");
    }
  }, [selectedActor]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-sm justify-between h-12 text-lg"
          disabled={disabled}
        >
          {value && selectedActor ? (
            <span className="truncate">{selectedActor.name}</span>
          ) : (
             <span className="flex items-center font-normal text-muted-foreground">
                <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
                Trouver un acteur...
             </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
        <Command
           // Add a filter function for better matching
           filter={(value, search) => {
            const actor = actors.find(a => a.id === value);
            if (actor) {
                return actor.name.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
            }
            return 0;
          }}
        >
          <CommandInput placeholder="Chercher un acteur/actrice..." />
          <CommandList>
            <CommandEmpty>Aucun acteur trouvé.</CommandEmpty>
            <CommandGroup>
              {actors.map((actor) => (
                <CommandItem
                  key={actor.id}
                  value={actor.id}
                  onSelect={(currentValue) => {
                    const actorToSelect = actors.find(a => a.id === currentValue);
                    if (actorToSelect) {
                      setValue(actorToSelect.id);
                      onActorSelect(actorToSelect);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === actor.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {actor.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


function GameLoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center w-full animate-pulse max-w-4xl">
            <div className="w-full flex flex-col md:flex-row items-center md:items-start gap-8">
                <Skeleton className="w-full max-w-sm h-auto aspect-[2/3] rounded-xl shrink-0" />
                <div className="w-full flex flex-col items-center md:items-start gap-4">
                    <Skeleton className="h-8 w-3/4 rounded-lg" />
                    <Skeleton className="h-10 w-1/2 rounded-lg mb-4" />
                    <Skeleton className="h-12 w-full max-w-sm rounded-lg" />
                </div>
            </div>
        </div>
    )
}
