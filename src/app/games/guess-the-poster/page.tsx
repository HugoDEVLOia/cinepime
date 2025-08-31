
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ServerCrash, Gamepad2, Trophy, Clock, Target, Check, X, RotateCw, Home } from 'lucide-react';
import Link from 'next/link';

type GameState = 'idle' | 'loading' | 'playing' | 'finished';

const GAME_DURATION = 30; // in seconds

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function GuessThePosterPage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [movies, setMovies] = useState<Media[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const currentMovie = useMemo(() => movies[currentRound], [movies, currentRound]);
  const answerOptions = useMemo(() => {
    if (!currentMovie) return [];
    const otherMovies = movies
      .filter(m => m.id !== currentMovie.id)
      .slice(0, 3)
      .map(m => m.title);
    return shuffleArray([currentMovie.title, ...otherMovies]);
  }, [currentMovie, movies]);

  const fetchMovies = useCallback(async () => {
    setGameState('loading');
    try {
      // Fetch a few pages to get a good variety
      const page1 = getPopularMedia('movie', Math.floor(Math.random() * 50) + 1);
      const page2 = getPopularMedia('movie', Math.floor(Math.random() * 50) + 51);
      const [results1, results2] = await Promise.all([page1, page2]);
      
      const allMovies = [...results1.media, ...results2.media];
      const validMovies = allMovies.filter(m => m.posterUrl && !m.posterUrl.includes('picsum.photos'));
      
      if (validMovies.length < 10) throw new Error("Pas assez de films valides pour démarrer le jeu.");
      
      setMovies(shuffleArray(validMovies));
      setGameState('playing');
      setCurrentRound(0);
      setScore(0);
      setTimeLeft(GAME_DURATION);
    } catch (error) {
      console.error("Erreur lors de la récupération des films:", error);
      setGameState('idle');
    }
  }, []);

  const startGame = () => {
    fetchMovies();
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      setGameState('finished');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleAnswer = (selectedTitle: string) => {
    if (feedback) return; // Prevent multiple clicks

    if (selectedTitle === currentMovie.title) {
      setScore(prev => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentRound + 1 < movies.length) {
        setCurrentRound(prev => prev + 1);
      } else {
        // Fetch more movies if we run out
        fetchMovies();
      }
    }, 1000); // 1-second feedback
  };
  
  const getButtonVariant = (title: string): "default" | "destructive" | "secondary" => {
    if (!feedback) return 'secondary';
    if (title === currentMovie.title) return 'default'; // Always show correct in green
    if (feedback === 'incorrect') return 'destructive';
    return 'secondary';
  }

  const renderGameState = () => {
    switch (gameState) {
      case 'loading':
        return <GameLoadingSkeleton />;

      case 'playing':
        if (!currentMovie) return <GameLoadingSkeleton />;
        return (
          <>
            <Card className="relative overflow-hidden shadow-2xl rounded-xl w-full max-w-sm mx-auto aspect-[2/3] bg-muted">
              <Image
                key={currentMovie.id}
                src={currentMovie.posterUrl}
                alt="Affiche de film à deviner"
                width={500}
                height={750}
                className="object-cover w-full h-full animate-fade-in"
                priority
                data-ai-hint="affiche jeu"
              />
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
              {answerOptions.map(title => (
                <Button
                  key={title}
                  onClick={() => handleAnswer(title)}
                  variant={getButtonVariant(title)}
                  size="lg"
                  className={`h-auto py-3 text-base transition-all duration-300 ${feedback ? 'text-white' : ''}`}
                  disabled={!!feedback}
                >
                  <span className="truncate">{title}</span>
                  {feedback && title === currentMovie.title && <Check className="ml-2 h-5 w-5" />}
                  {feedback === 'incorrect' && title !== currentMovie.title && <X className="ml-2 h-5 w-5" />}
                </Button>
              ))}
            </div>
          </>
        );

      case 'finished':
        return (
          <Card className="w-full max-w-md p-8 text-center shadow-2xl rounded-xl animate-fade-in-up">
            <CardContent className="p-0">
              <Trophy className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-4xl font-extrabold text-foreground">Partie Terminée !</h2>
              <p className="text-lg text-muted-foreground mt-2 mb-6">Le temps est écoulé.</p>
              <div className="bg-primary/10 rounded-lg p-4 mb-8">
                <p className="text-2xl font-bold text-primary">Votre Score</p>
                <p className="text-6xl font-bold text-primary">{score}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={startGame} size="lg" className="w-full">
                  <RotateCw className="mr-2 h-5 w-5" /> Rejouer
                </Button>
                 <Button asChild size="lg" variant="outline" className="w-full">
                    <Link href="/games">
                        <Home className="mr-2 h-5 w-5" /> Autres jeux
                    </Link>
                 </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'idle':
      default:
        return (
          <Card className="w-full max-w-md p-8 text-center shadow-2xl rounded-xl animate-fade-in">
            <CardContent className="p-0">
              <Gamepad2 className="h-20 w-20 text-primary mx-auto mb-4" />
              <h2 className="text-4xl font-extrabold text-foreground">Devine l'Affiche</h2>
              <p className="text-lg text-muted-foreground mt-2 mb-8">
                Reconnaissez le plus de films possible en 30 secondes. Prêt(e) à relever le défi ?
              </p>
              <Button onClick={startGame} size="lg" className="w-full text-lg py-7">
                Commencer la partie
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-250px)]">
      {gameState === 'playing' && (
        <Card className="w-full max-w-2xl mb-8 p-4 shadow-lg rounded-xl">
          <div className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-foreground">{score}</span>
            </div>
            <div className="w-full max-w-xs">
               <Progress value={(timeLeft / GAME_DURATION) * 100} />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-foreground w-12 text-right">{timeLeft}s</span>
            </div>
          </div>
        </Card>
      )}
      {renderGameState()}
    </div>
  );
}


function GameLoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center w-full animate-pulse">
             <div className="w-full max-w-2xl mb-8 p-4">
                 <div className="flex justify-between items-center gap-6">
                    <Skeleton className="h-8 w-12 rounded-md" />
                    <Skeleton className="h-4 w-full max-w-xs rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                </div>
            </div>
            <Skeleton className="w-full max-w-sm h-auto aspect-[2/3] rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
            </div>
        </div>
    )
}
