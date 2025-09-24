
'use client';

import type { Actor } from '@/services/tmdb';
import { useMediaLists } from '@/hooks/use-media-lists';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartBig, Film, Tv, PlaySquare, Clock, Users, Pyramid, Info, Hourglass, Palette, UserCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function formatTotalWatchTime(totalMinutes: number): { display: string; subtitle: string } {
  const rawSubtitle = totalMinutes === 1 ? "1 minute" : `${totalMinutes} minutes`;
  
  if (totalMinutes === 0) {
    return { display: "0 minutes", subtitle: "0 minute" };
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let displayString = "";
  if (hours > 0) {
    displayString += `${hours} heure${hours > 1 ? 's' : ''}`;
  }
  
  if (minutes > 0) {
    if (hours > 0) displayString += " "; 
    displayString += `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  
  if (!displayString) { 
      displayString = rawSubtitle;
  }

  return { display: displayString, subtitle: rawSubtitle };
}


export default function StatsPage() {
  const { watchedList, isLoaded } = useMediaLists();
  const [activeTab, setActiveTab] = useState<'stats' | 'genres' | 'actors'>('stats');
  const [isLoadingClient, setIsLoadingClient] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setIsLoadingClient(false);
    }
  }, [isLoaded]);

  const stats = useMemo(() => {
    if (!isLoaded) return {
      totalMoviesWatched: 0,
      totalSeriesWatched: 0,
      totalMediaWatched: 0,
      totalWatchTimeMinutes: 0,
    };

    const movies = watchedList.filter(m => m.mediaType === 'movie');
    const series = watchedList.filter(m => m.mediaType === 'tv');

    const totalWatchTime = movies.reduce((acc, movie) => acc + (movie.runtime || 0), 0);

    return {
      totalMoviesWatched: movies.length,
      totalSeriesWatched: series.length,
      totalMediaWatched: watchedList.length,
      totalWatchTimeMinutes: totalWatchTime,
    };
  }, [watchedList, isLoaded]);

  const formattedWatchTime = formatTotalWatchTime(stats.totalWatchTimeMinutes);

  const mediaTypeChartData = useMemo(() => [
    { name: 'Films', value: stats.totalMoviesWatched, fill: 'hsl(var(--chart-1))' },
    { name: 'Séries', value: stats.totalSeriesWatched, fill: 'hsl(var(--chart-2))' },
  ], [stats.totalMoviesWatched, stats.totalSeriesWatched]);

  const mediaTypeChartConfig = {
    films: { label: "Films", color: "hsl(var(--chart-1))" },
    series: { label: "Séries", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  const genreStats = useMemo(() => {
    if (!isLoaded) return [];
    const genreCounts: Record<string, number> = {};
    watchedList.forEach(media => {
      media.genres?.forEach(genre => {
        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
      });
    });
    return Object.entries(genreCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 genres
  }, [watchedList, isLoaded]);

  const genreChartData = useMemo(() => {
    return genreStats.map((stat, index) => ({
      name: stat.name,
      total: stat.value,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }));
  }, [genreStats]);

  const genreChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    genreStats.forEach((stat, index) => {
      config[stat.name] = { // Use stat.name as key
        label: stat.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
    return config;
  }, [genreStats]);


  const actorStats = useMemo(() => {
    if (!isLoaded) return [];
    const actorCounts: Record<string, { actor: Actor; count: number }> = {};
    watchedList.forEach(media => {
      media.cast?.forEach(actor => {
        if (actorCounts[actor.id]) {
          actorCounts[actor.id].count++;
        } else {
          actorCounts[actor.id] = { actor, count: 1 };
        }
      });
    });
    return Object.values(actorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 actors
  }, [watchedList, isLoaded]);

  const renderContent = () => {
    if (isLoadingClient) {
       return (
        <div className="space-y-8">
            <Card className="bg-primary text-primary-foreground shadow-xl rounded-xl p-6">
            <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xl font-semibold flex items-center">
                <Clock className="mr-2.5 h-5 w-5" /> Temps total de visionnage (films)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Skeleton className="h-12 w-3/4 my-1" />
                <Skeleton className="h-5 w-1/2" />
            </CardContent>
            </Card>

            <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Contenu visionné</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                <Card key={i} className="shadow-lg rounded-xl p-5">
                    <CardContent className="p-0 flex flex-col items-center text-center">
                    <Skeleton className="h-8 w-8 mb-3 rounded-full" />
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-5 w-20" />
                    </CardContent>
                </Card>
                ))}
            </div>
            </div>
            
            <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Répartition des médias</h2>
            <Card className="shadow-lg rounded-xl p-6 min-h-[300px] flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
            </Card>
            </div>
        </div>
      );
    }
    
    if (watchedList.length === 0) {
      return (
          <Card className="shadow-lg rounded-xl p-10 bg-card">
              <div className="flex flex-col items-center text-center text-muted-foreground">
                  <Info className="w-12 h-12 mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">Aucune Statistique à Afficher</h2>
                  <p className="text-md">Vos statistiques apparaîtront ici une fois que vous aurez marqué des films ou séries comme "Vus".</p>
              </div>
          </Card>
      );
    }

    switch (activeTab) {
      case 'stats':
        return (
          <div className="space-y-8">
            <Card className="bg-primary text-primary-foreground shadow-xl rounded-xl p-6">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Clock className="mr-2.5 h-5 w-5" /> Temps total de visionnage (films)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-5xl font-bold my-1">{formattedWatchTime.display}</div>
                <p className="text-sm text-primary-foreground/80">{formattedWatchTime.subtitle}</p>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Contenu visionné</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-lg rounded-xl p-5 bg-card">
                  <CardContent className="p-0 flex flex-col items-center text-center">
                    <Film className="h-8 w-8 mb-3 text-primary" />
                    <p className="text-3xl font-bold text-foreground">{stats.totalMoviesWatched}</p>
                    <p className="text-sm text-muted-foreground">Films</p>
                  </CardContent>
                </Card>
                <Card className="shadow-lg rounded-xl p-5 bg-card">
                  <CardContent className="p-0 flex flex-col items-center text-center">
                    <Tv className="h-8 w-8 mb-3 text-primary" />
                    <p className="text-3xl font-bold text-foreground">{stats.totalSeriesWatched}</p>
                    <p className="text-sm text-muted-foreground">Séries</p>
                  </CardContent>
                </Card>
                <Card className="shadow-lg rounded-xl p-5 bg-card">
                  <CardContent className="p-0 flex flex-col items-center text-center">
                    <PlaySquare className="h-8 w-8 mb-3 text-primary" />
                    <p className="text-3xl font-bold text-foreground">{stats.totalMediaWatched}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Répartition des médias</h2>
              <Card className="shadow-lg rounded-xl p-6 min-h-[350px] flex items-center justify-center bg-card">
                {stats.totalMediaWatched > 0 ? (
                  <ChartContainer config={mediaTypeChartConfig} className="w-full aspect-square max-h-[300px]">
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel nameKey="name" />}
                      />
                      <Pie data={mediaTypeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 1.25;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs fill-foreground">
                              {`${mediaTypeChartData[index].name} (${(percent * 100).toFixed(0)}%)`}
                            </text>
                          );
                        }}>
                        {mediaTypeChartData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.fill} className="stroke-background focus:outline-none"/>
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex flex-col items-center text-center text-muted-foreground">
                    <Hourglass className="w-12 h-12 mb-4" />
                    <p className="text-lg font-medium">Aucune donnée de répartition disponible.</p>
                    <p className="text-sm">Commencez par marquer des films ou séries comme vus.</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        );
      case 'genres':
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" /> Top Genres Visionnés
            </h2>
            {genreStats.length > 0 ? (
              <Card className="shadow-lg rounded-xl p-6 bg-card">
                <ChartContainer config={genreChartConfig} className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={genreChartData} layout="vertical" margin={{ right: 30, left: 50, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={120} fontSize={12} interval={0} tick={{dy: 2}} />
                      <ChartTooltip 
                        cursor={{ fill: 'hsl(var(--accent)/0.3)'}}
                        content={<ChartTooltipContent />} 
                       />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="total" name="Nombre de titres">
                         {genreChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>
            ) : (
               <Card className="shadow-lg rounded-xl p-10 bg-card">
                  <div className="flex flex-col items-center text-center text-muted-foreground">
                    <Info className="w-12 h-12 mb-4" />
                    <p className="text-lg font-medium">Aucune donnée de genre disponible.</p>
                    <p className="text-sm">Les genres apparaissent ici après avoir visionné des contenus.</p>
                  </div>
              </Card>
            )}
          </div>
        );
      case 'actors':
        return (
          <div>
             <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <UserCircle className="h-6 w-6 text-primary" /> Acteurs les Plus Vus
            </h2>
            {actorStats.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {actorStats.map(({ actor, count }) => (
                  <Card key={actor.id} className="text-center p-3 shadow-md rounded-lg bg-card hover:shadow-lg transition-shadow">
                    <Image
                      src={actor.profileUrl}
                      alt={actor.name}
                      width={150}
                      height={225}
                      className="rounded-md object-cover mx-auto mb-2 aspect-[2/3]"
                      data-ai-hint="profil acteur"
                      onError={(e) => { e.currentTarget.src = 'https://picsum.photos/150/225?grayscale'; }}
                    />
                    <p className="text-sm font-semibold text-foreground">{actor.name}</p>
                    <p className="text-xs text-muted-foreground">Apparu dans {count} titre{count > 1 ? 's' : ''}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-lg rounded-xl p-10 bg-card">
                  <div className="flex flex-col items-center text-center text-muted-foreground">
                    <Info className="w-12 h-12 mb-4" />
                    <p className="text-lg font-medium">Aucune donnée d'acteur disponible.</p>
                    <p className="text-sm">Les acteurs apparaissent ici après avoir visionné des contenus.</p>
                  </div>
              </Card>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Mes Statistiques</h1>
        <Select value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <SelectTrigger className="w-full sm:w-[280px] h-11 text-base">
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stats">
              <div className="flex items-center gap-2">
                <BarChartBig className="h-4 w-4 text-muted-foreground" />
                <span>Statistiques Générales</span>
              </div>
            </SelectItem>
            <SelectItem value="genres">
              <div className="flex items-center gap-2">
                <Pyramid className="h-4 w-4 text-muted-foreground" />
                <span>Top Genres</span>
              </div>
            </SelectItem>
            <SelectItem value="actors">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Top Acteurs</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  );
}

    