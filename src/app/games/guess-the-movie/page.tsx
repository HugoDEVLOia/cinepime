
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getPopularMedia, getPersonDetails, searchMedia, type Media, type Person } from '@/services/tmdb';
import { Gamepad2, Check, X, ChevronsRight, Home, Search, Film, Loader2, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

type GameState = 'idle' | 'loading' | 'playing' | 'answered';

export default function GuessTheMoviePage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [actor, setActor] = useState<Person | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Media | null>(null);
  const [lastAnswer, setLastAnswer] = useState<{ movie: Media; correct: boolean } | null>(null);

  const fetchNewActor = useCallback(async () => {
    setGameState('loading');
    setActor(null);
    setFeedback(null);
    setSelectedMovie(null);
    setLastAnswer(null);

    try {
      let foundActorWithFilmography = false;
      while (!foundActorWithFilmography) {
        const randomPage = Math.floor(Math.random() * 10) + 1; // get from top 10 pages of popular people
        const { media: popularPeople } = await getPopularMedia('person', randomPage);
        const validPeople = popularPeople.filter(p => p.posterUrl && !p.posterUrl.includes('picsum.photos') && p.knownForDepartment === 'Acting');
        
        if (validPeople.length > 0) {
            const randomPerson = validPeople[Math.floor(Math.random() * validPeople.length)];
            const details = await getPersonDetails(randomPerson.id);
            if (details && details.filmography.cast && details.filmography.cast.length > 5) {
                setActor(details);
                foundActorWithFilmography = true;
            }
        }
      }
      setGameState('playing');
    } catch (error)      {
      console.error("Erreur lors de la récupération de l'acteur:", error);
      setGameState('idle');
    }
  }, []);

  const startGame = () => {
    fetchNewActor();
  };

  const handleMovieSelect = (movie: Media) => {
    if (!actor) return;
    setSelectedMovie(movie);

    const isCorrect = actor.filmography.cast.some(credit => credit.id === movie.id);
    const feedbackValue = isCorrect ? 'correct' : 'incorrect';
    setFeedback(feedbackValue);
    setLastAnswer({ movie, correct: isCorrect });
    setGameState('answered');
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'loading':
        return <GameLoadingSkeleton />;

      case 'playing':
      case 'answered':
        if (!actor) return <GameLoadingSkeleton />;
        return (
          <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:items-start gap-8">
            <Card className="relative overflow-hidden shadow-2xl rounded-xl w-full max-w-sm mx-auto aspect-[2/3] bg-muted shrink-0">
              <Image
                key={actor.id}
                src={actor.profileUrl}
                alt={`Photo de ${actor.name}`}
                width={500}
                height={750}
                className="object-cover w-full h-full"
                priority
                data-ai-hint="photo acteur jeu"
              />
            </Card>
            <div className="w-full flex flex-col items-center md:items-start">
              <h2 className="text-2xl font-bold text-center md:text-left text-foreground">Trouvez un film dans lequel a joué :</h2>
              <h3 className="text-3xl font-extrabold text-primary text-center md:text-left mb-6">{actor.name}</h3>
              
              <MovieCombobox 
                onMovieSelect={handleMovieSelect}
                disabled={gameState === 'answered'}
                selectedMovie={selectedMovie}
              />
              
              {gameState === 'answered' && lastAnswer && (
                 <Card className={cn("mt-6 w-full shadow-lg animate-fade-in", {
                    "bg-green-50 border-green-200": lastAnswer.correct,
                    "bg-red-50 border-red-200": !lastAnswer.correct,
                 })}>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        {lastAnswer.correct ? (
                           <Check className="h-12 w-12 text-green-500 mb-2"/>
                        ) : (
                           <X className="h-12 w-12 text-red-500 mb-2"/>
                        )}
                        <p className={cn("text-xl font-bold", {
                            "text-green-700": lastAnswer.correct,
                            "text-red-700": !lastAnswer.correct,
                        })}>
                           {lastAnswer.correct ? "Bien joué !" : "Dommage !"}
                        </p>
                        <p className={cn("text-md", {
                            "text-green-600": lastAnswer.correct,
                            "text-red-600": !lastAnswer.correct,
                        })}>
                           {lastAnswer.correct ? (
                            <>
                                <span className="font-semibold">{actor.name}</span> a bien joué dans <span className="font-semibold">{lastAnswer.movie.title}</span>.
                            </>
                           ) : (
                             <>
                                <span className="font-semibold">{actor.name}</span> ne semble pas avoir joué dans <span className="font-semibold">{lastAnswer.movie.title}</span>.
                             </>
                           )}
                        </p>
                         <Button onClick={fetchNewActor} size="lg" className="mt-4 w-full sm:w-auto">
                            <ChevronsRight className="mr-2 h-5 w-5" /> Acteur Suivant
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
              <h2 className="text-4xl font-extrabold text-foreground">Devine le Film</h2>
              <p className="text-lg text-muted-foreground mt-2 mb-8">
                Un acteur ou une actrice s'affiche, à vous de retrouver un film dans lequel il ou elle a joué !
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

function MovieCombobox({
  onMovieSelect,
  disabled,
  selectedMovie
}: {
  onMovieSelect: (movie: Media) => void;
  disabled: boolean;
  selectedMovie: Media | null;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!disabled) {
      setSearchTerm("");
    }
  }, [disabled]);

  useEffect(() => {
    if (debouncedSearchTerm.trim() && open) {
      setIsSearching(true);
      searchMedia(debouncedSearchTerm).then(results => {
        setSearchResults(results.filter(r => r.mediaType === 'movie' || r.mediaType === 'tv'));
        setIsSearching(false);
      });
    } else if (!debouncedSearchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, open]);

  const handleSelect = (movie: Media) => {
    setOpen(false);
    setSearchTerm(movie.title);
    onMovieSelect(movie);
  };
  
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
          {selectedMovie ? (
            <span className="truncate">{selectedMovie.title}</span>
          ) : (
             <span className="flex items-center font-normal text-muted-foreground">
                <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
                Trouver un film...
             </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Chercher un film/série..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
            disabled={disabled}
          />
          <CommandList>
            {isSearching ? (
                <div className="p-4 flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : !isSearching && searchResults.length === 0 && debouncedSearchTerm ? (
                <CommandEmpty>Aucun film trouvé pour "{debouncedSearchTerm}".</CommandEmpty>
            ) : (
                <CommandGroup>
                  {searchResults.map((movie) => (
                    <CommandItem
                      key={movie.id}
                      value={movie.title}
                      onSelect={() => handleSelect(movie)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Image 
                        src={movie.posterUrl}
                        alt={`Affiche de ${movie.title}`}
                        width={40}
                        height={60}
                        className="rounded-sm aspect-[2/3]"
                      />
                      <div className="flex-grow truncate">
                        <p className="truncate font-semibold">{movie.title}</p>
                        <p className="text-xs text-muted-foreground">{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
            )}
            {!debouncedSearchTerm && !isSearching && searchResults.length === 0 && (
                <CommandEmpty>Commencez à taper pour rechercher...</CommandEmpty>
            )}
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
