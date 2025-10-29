
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, notFound, useRouter } from 'next/navigation';
import { getMediaDetails, type Media } from '@/services/tmdb';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ServerCrash, GitCompare, Star, CalendarDays, Clock, Users, FilmIcon, Award, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

function ComparePageComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const movieAId = searchParams.get('a');
    const movieBId = searchParams.get('b');

    const [movieA, setMovieA] = useState<Media | null>(null);
    const [movieB, setMovieB] = useState<Media | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!movieAId || !movieBId) {
            setError("Deux films sont nécessaires pour la comparaison.");
            setIsLoading(false);
            return;
        }

        const fetchMovies = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [detailsA, detailsB] = await Promise.all([
                    getMediaDetails(movieAId, 'movie'),
                    getMediaDetails(movieBId, 'movie'),
                ]);

                if (!detailsA || !detailsB) {
                    setError("Impossible de charger les détails d'un des films.");
                    setIsLoading(false);
                    return;
                }

                setMovieA(detailsA);
                setMovieB(detailsB);
            } catch (err) {
                console.error("Erreur lors de la récupération des films pour la comparaison:", err);
                setError("Une erreur est survenue. Veuillez réessayer.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, [movieAId, movieBId]);

    if (isLoading) {
        return <ComparePageSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                <Alert variant="destructive" className="max-w-md shadow-lg">
                    <ServerCrash className="h-5 w-5" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!movieA || !movieB) {
        notFound();
        return null;
    }

    const getRowClass = (valA: number | undefined, valB: number | undefined) => {
        if (valA === undefined || valB === undefined || valA === valB) return '';
        return valA > valB ? 'bg-green-50/50 dark:bg-green-900/20' : 'bg-red-50/50 dark:bg-red-900/20';
    };
    
    const getWinnerClass = (valA: number | undefined, valB: number | undefined, inverted: boolean = false) => {
        if (valA === undefined || valB === undefined) return 'text-muted-foreground';
        if (valA === valB) return 'text-muted-foreground';
        
        const aIsWinner = inverted ? valA < valB : valA > valB;
        
        return aIsWinner ? 'font-bold text-green-600 dark:text-green-400' : '';
    };

    const formatCurrency = (amount: number | undefined) => {
        if(amount === undefined || amount === 0) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(amount);
    }
    
    const directorsA = movieA.credits?.crew?.filter(c => c.job === 'Director').map(d => d.name).join(', ') || 'N/A';
    const directorsB = movieB.credits?.crew?.filter(c => c.job === 'Director').map(d => d.name).join(', ') || 'N/A';


    return (
        <div className="space-y-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-3">
                <GitCompare className="h-8 w-8 text-primary"/> Comparaison
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                 <Link href={`/media/movie/${movieA.id}`} className="group">
                    <Card className="flex flex-col sm:flex-row items-center gap-4 p-4 h-full shadow-lg rounded-xl border border-border/60 hover:border-primary/50 transition-all">
                        <Image src={movieA.posterUrl} alt={movieA.title} width={100} height={150} className="rounded-lg aspect-[2/3] object-cover shadow-md" />
                        <div className="text-center sm:text-left">
                            <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary">{movieA.title}</CardTitle>
                            {movieA.releaseDate && <CardDescription>{new Date(movieA.releaseDate).getFullYear()}</CardDescription>}
                        </div>
                    </Card>
                 </Link>
                 <Link href={`/media/movie/${movieB.id}`} className="group">
                    <Card className="flex flex-col sm:flex-row items-center gap-4 p-4 h-full shadow-lg rounded-xl border border-border/60 hover:border-primary/50 transition-all">
                        <Image src={movieB.posterUrl} alt={movieB.title} width={100} height={150} className="rounded-lg aspect-[2/3] object-cover shadow-md" />
                         <div className="text-center sm:text-left">
                            <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary">{movieB.title}</CardTitle>
                            {movieB.releaseDate && <CardDescription>{new Date(movieB.releaseDate).getFullYear()}</CardDescription>}
                        </div>
                    </Card>
                 </Link>
            </div>

            <Card className="shadow-lg rounded-xl overflow-hidden">
                 <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="w-1/4 font-semibold text-foreground">Caractéristique</TableHead>
                            <TableHead className="text-center font-semibold text-foreground">{movieA.title}</TableHead>
                            <TableHead className="text-center font-semibold text-foreground">{movieB.title}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className={getRowClass(movieA.averageRating, movieB.averageRating)}>
                            <TableCell className="font-medium flex items-center gap-2"><Star className="text-yellow-500 h-4 w-4"/>Note</TableCell>
                            <TableCell className={`text-center ${getWinnerClass(movieA.averageRating, movieB.averageRating)}`}>{movieA.averageRating.toFixed(1)} / 10</TableCell>
                            <TableCell className={`text-center ${getWinnerClass(movieB.averageRating, movieA.averageRating)}`}>{movieB.averageRating.toFixed(1)} / 10</TableCell>
                        </TableRow>

                         <TableRow className={getRowClass(movieA.popularity, movieB.popularity)}>
                            <TableCell className="font-medium flex items-center gap-2"><Award className="text-blue-500 h-4 w-4"/>Popularité</TableCell>
                            <TableCell className={`text-center ${getWinnerClass(movieA.popularity, movieB.popularity)}`}>{movieA.popularity?.toFixed(0)}</TableCell>
                            <TableCell className={`text-center ${getWinnerClass(movieB.popularity, movieA.popularity)}`}>{movieB.popularity?.toFixed(0)}</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className="font-medium flex items-center gap-2"><CalendarDays className="text-muted-foreground h-4 w-4"/>Date de sortie</TableCell>
                            <TableCell className="text-center">{movieA.releaseDate ? new Date(movieA.releaseDate).toLocaleDateString('fr-FR') : 'N/A'}</TableCell>
                            <TableCell className="text-center">{movieB.releaseDate ? new Date(movieB.releaseDate).toLocaleDateString('fr-FR') : 'N/A'}</TableCell>
                        </TableRow>
                        
                         <TableRow className={getRowClass(movieB.runtime, movieA.runtime)}>
                            <TableCell className="font-medium flex items-center gap-2"><Clock className="text-muted-foreground h-4 w-4"/>Durée</TableCell>
                            <TableCell className={`text-center ${getWinnerClass(movieB.runtime, movieA.runtime, true)}`}>{movieA.runtime ? `${movieA.runtime} min` : 'N/A'}</TableCell>
                            <TableCell className={`text-center ${getWinnerClass(movieA.runtime, movieB.runtime, true)}`}>{movieB.runtime ? `${movieB.runtime} min` : 'N/A'}</TableCell>
                        </TableRow>

                        <TableRow className={getRowClass(movieA.budget, movieB.budget)}>
                            <TableCell className="font-medium flex items-center gap-2"><DollarSign className="text-green-600 h-4 w-4"/>Budget</TableCell>
                            <TableCell className={`text-center ${getWinnerClass(movieA.budget, movieB.budget)}`}>{formatCurrency(movieA.budget)}</TableCell>
                            <TableCell className={`text-center ${getWinnerClass(movieB.budget, movieA.budget)}`}>{formatCurrency(movieB.budget)}</TableCell>
                        </TableRow>
                        
                        <TableRow className={getRowClass(movieA.revenue, movieB.revenue)}>
                            <TableCell className="font-medium flex items-center gap-2"><DollarSign className="text-green-600 h-4 w-4"/>Recettes (Box Office)</TableCell>
                            <TableCell className={`text-center ${getWinnerClass(movieA.revenue, movieB.revenue)}`}>{formatCurrency(movieA.revenue)}</TableCell>
                            <TableCell className={`text-center ${getWinnerClass(movieB.revenue, movieA.revenue)}`}>{formatCurrency(movieB.revenue)}</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className="font-medium flex items-center gap-2"><FilmIcon className="text-muted-foreground h-4 w-4"/>Genres</TableCell>
                            <TableCell className="text-center">
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {movieA.genres?.map(g => <Badge key={g.id} variant="secondary">{g.name}</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {movieB.genres?.map(g => <Badge key={g.id} variant="secondary">{g.name}</Badge>)}
                                </div>
                            </TableCell>
                        </TableRow>
                        
                        <TableRow>
                           <TableCell className="font-medium flex items-center gap-2"><Users className="text-muted-foreground h-4 w-4"/>Réalisateur(s)</TableCell>
                           <TableCell className="text-center">{directorsA}</TableCell>
                           <TableCell className="text-center">{directorsB}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function ComparePageSkeleton() {
    return (
        <div className="space-y-10 animate-pulse">
            <Skeleton className="h-10 w-64 mx-auto" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <Card className="flex items-center gap-4 p-4">
                    <Skeleton className="w-[100px] h-[150px] rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-4">
                    <Skeleton className="w-[100px] h-[150px] rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                </Card>
            </div>

            <Card className="shadow-lg rounded-xl">
                 <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead><Skeleton className="h-6 w-32"/></TableHead>
                            <TableHead className="text-center"><Skeleton className="h-6 w-40 mx-auto"/></TableHead>
                            <TableHead className="text-center"><Skeleton className="h-6 w-40 mx-auto"/></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({length: 7}).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                <TableCell className="text-center"><Skeleton className="h-5 w-28 mx-auto"/></TableCell>
                                <TableCell className="text-center"><Skeleton className="h-5 w-28 mx-auto"/></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </Card>
        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<ComparePageSkeleton />}>
            <ComparePageComponent />
        </Suspense>
    )
}
