
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getPopularMedia, type Media } from '@/services/tmdb';
import { Gamepad2, Trophy, ArrowRight, RotateCw, Home, Loader2, Info, CheckCircle, Puzzle, Grid3x3, Grid, AppWindow } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

type GameState = 'idle' | 'selecting_difficulty' | 'loading' | 'playing' | 'solved';
const DIFFICULTIES = {
  easy: { size: 3, name: 'Facile' },
  medium: { size: 4, name: 'Moyen' },
  hard: { size: 5, name: 'Difficile' },
};

// Helper to check if the puzzle is solved
const isSolved = (tiles: number[]) => {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i) return false;
  }
  return true;
};

// Helper to shuffle the tiles
const shuffleTiles = (size: number): number[] => {
  const totalTiles = size * size;
  const tiles = Array.from({ length: totalTiles }, (_, i) => i);
  let emptyIndex = totalTiles - 1;

  // Perform a series of valid moves to shuffle the board
  for (let i = 0; i < size * 500; i++) { // More shuffles for bigger grids
    const neighbors = [];
    const row = Math.floor(emptyIndex / size);
    const col = emptyIndex % size;

    if (row > 0) neighbors.push(emptyIndex - size); // top
    if (row < size - 1) neighbors.push(emptyIndex + size); // bottom
    if (col > 0) neighbors.push(emptyIndex - 1); // left
    if (col < size - 1) neighbors.push(emptyIndex + 1); // right

    const randomNeighborIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
    
    // Swap empty tile with the random neighbor
    [tiles[emptyIndex], tiles[randomNeighborIndex]] = [tiles[randomNeighborIndex], tiles[emptyIndex]];
    emptyIndex = randomNeighborIndex;
  }
  
  if (isSolved(tiles)) return shuffleTiles(size); // Re-shuffle if it's already solved

  return tiles;
};


export default function SlidingPuzzlePage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [movie, setMovie] = useState<Media | null>(null);
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gridSize, setGridSize] = useState<number>(4);
  const { toast } = useToast();
  
  const emptyTileValue = useMemo(() => gridSize * gridSize - 1, [gridSize]);

  const fetchNewMovie = useCallback(async (selectedGridSize: number) => {
    setGameState('loading');
    setMovie(null);
    setGridSize(selectedGridSize);

    try {
      let foundMovie = false;
      while (!foundMovie) {
        const randomPage = Math.floor(Math.random() * 20) + 1;
        const { media } = await getPopularMedia('movie', randomPage);
        const validMovies = media.filter(m => m.posterUrl && !m.posterUrl.includes('picsum.photos'));
        
        if (validMovies.length > 0) {
          const randomMovie = validMovies[Math.floor(Math.random() * validMovies.length)];
          setMovie(randomMovie);
          setTiles(shuffleTiles(selectedGridSize));
          setMoves(0);
          foundMovie = true;
        }
      }
      setGameState('playing');
    } catch (error) {
      console.error("Erreur lors de la récupération du film pour le puzzle :", error);
      setGameState('idle');
    }
  }, []);

  const startGame = (difficulty: keyof typeof DIFFICULTIES) => {
    const selectedGridSize = DIFFICULTIES[difficulty].size;
    fetchNewMovie(selectedGridSize);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;

    const emptyIndex = tiles.indexOf(emptyTileValue);
    const tileRow = Math.floor(index / gridSize);
    const tileCol = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    // Check if the clicked tile is a neighbor of the empty tile
    const isNeighbor = (Math.abs(tileRow - emptyRow) + Math.abs(tileCol - emptyCol)) === 1;

    if (isNeighbor) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]]; // Swap
      
      setMoves(m => m + 1);

      if (isSolved(newTiles)) {
        setTiles(newTiles); // Update state to show solved puzzle before showing success screen
        setGameState('solved');
        toast({
          title: "Félicitations !",
          description: `Vous avez résolu le puzzle de "${movie?.title}" en ${moves + 1} coups !`,
        });
      } else {
        setTiles(newTiles);
      }
    }
  };
  
  const resetGame = () => {
    setGameState('selecting_difficulty');
    setMovie(null);
    setTiles([]);
    setMoves(0);
  }

  const renderGameState = () => {
    switch (gameState) {
      case 'loading':
        return <GameLoadingSkeleton />;

      case 'playing':
      case 'solved':
        if (!movie) return <GameLoadingSkeleton />;
        const pieceSize = 100 / gridSize;
        return (
          <div className="w-full max-w-lg flex flex-col items-center gap-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Reconstituez l'affiche de :</h2>
                <h3 className="text-3xl font-extrabold text-primary">{movie.title}</h3>
                <p className="text-lg text-muted-foreground mt-2">Coups : {moves}</p>
            </div>
            
            <div className="relative w-full aspect-square max-w-md bg-muted rounded-xl shadow-inner">
                {tiles.map((tileValue, index) => {
                    const originalRow = Math.floor(tileValue / gridSize);
                    const originalCol = tileValue % gridSize;
                    
                    const top = Math.floor(index / gridSize) * pieceSize;
                    const left = (index % gridSize) * pieceSize;

                    return (
                        <AnimatePresence key={tileValue}>
                         {tileValue !== emptyTileValue && (
                            <motion.div
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="absolute p-0.5"
                                style={{
                                    width: `${pieceSize}%`,
                                    height: `${pieceSize}%`,
                                    top: `${top}%`,
                                    left: `${left}%`,
                                }}
                                onClick={() => handleTileClick(index)}
                            >
                                <div
                                    className="w-full h-full bg-cover bg-no-repeat rounded-md shadow-md cursor-pointer hover:scale-105 transition-transform"
                                    style={{
                                        backgroundImage: `url(${movie.posterUrl})`,
                                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                                        backgroundPosition: `${originalCol * 100 / (gridSize - 1)}% ${originalRow * 100 / (gridSize - 1)}%`,
                                    }}
                                />
                            </motion.div>
                         )}
                        </AnimatePresence>
                    );
                })}

                {gameState === 'solved' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 rounded-xl"
                    >
                        <CheckCircle className="h-20 w-20 text-green-400 mb-4" />
                        <h3 className="text-3xl font-bold text-white mb-2">Puzzle Résolu !</h3>
                        <p className="text-lg text-white/90 mb-6">Bravo, vous avez terminé en {moves} coups.</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button onClick={resetGame} size="lg">
                                <RotateCw className="mr-2 h-5 w-5" /> Choisir une difficulté
                            </Button>
                             <Button asChild variant="secondary" size="lg">
                                <Link href="/games">
                                    <Home className="mr-2 h-5 w-5" /> Autres jeux
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
          </div>
        );

      case 'selecting_difficulty':
        return (
           <Card className="w-full max-w-md p-8 text-center shadow-2xl rounded-xl animate-fade-in">
            <CardContent className="p-0">
               <Puzzle className="h-20 w-20 text-primary mx-auto mb-4" />
               <h2 className="text-3xl font-extrabold text-foreground mb-4">Choisissez la difficulté</h2>
               <div className="flex flex-col gap-4">
                  <Button onClick={() => startGame('easy')} size="lg" variant="outline">
                      <Grid3x3 className="mr-2 h-5 w-5"/>
                      Facile (3x3)
                  </Button>
                   <Button onClick={() => startGame('medium')} size="lg">
                      <Grid className="mr-2 h-5 w-5"/>
                      Moyen (4x4)
                  </Button>
                   <Button onClick={() => startGame('hard')} size="lg" variant="destructive">
                      <AppWindow className="mr-2 h-5 w-5"/>
                      Difficile (5x5)
                  </Button>
               </div>
                <Button asChild size="sm" variant="link" className="w-full mt-6 text-muted-foreground">
                    <Link href="/games">
                        <Home className="mr-2 h-4 w-4" /> Retour
                    </Link>
                </Button>
            </CardContent>
           </Card>
        );

      case 'idle':
      default:
        return (
          <Card className="w-full max-w-md p-8 text-center shadow-2xl rounded-xl animate-fade-in">
            <CardContent className="p-0">
              <Puzzle className="h-20 w-20 text-primary mx-auto mb-4" />
              <h2 className="text-4xl font-extrabold text-foreground">Puzzle Coulissant</h2>
              <p className="text-lg text-muted-foreground mt-2 mb-8">
                Reconstituez l'affiche d'un film en faisant glisser les pièces du puzzle. Un test de logique et de patience !
              </p>
              <Button onClick={() => setGameState('selecting_difficulty')} size="lg" className="w-full text-lg py-7">
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

function GameLoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center w-full animate-pulse max-w-lg">
            <div className="text-center mb-6 space-y-2">
                <Skeleton className="h-7 w-64 mx-auto rounded-lg" />
                <Skeleton className="h-10 w-48 mx-auto rounded-lg" />
                <Skeleton className="h-6 w-24 mx-auto rounded-lg" />
            </div>
            <Skeleton className="w-full max-w-md aspect-square rounded-xl" />
        </div>
    )
}
