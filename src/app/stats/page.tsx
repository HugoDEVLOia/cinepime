
'use client';

import { useMediaLists } from '@/hooks/use-media-lists';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChartBig, Film, Tv, PlaySquare, Clock, Users, Pyramid, Info, Hourglass } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

  const chartData = useMemo(() => [
    { name: 'Films', value: stats.totalMoviesWatched, fill: 'var(--chart-1)' },
    { name: 'Séries', value: stats.totalSeriesWatched, fill: 'var(--chart-2)' },
  ], [stats.totalMoviesWatched, stats.totalSeriesWatched]);

  const chartConfig = {
    films: { label: "Films", color: "hsl(var(--chart-1))" },
    series: { label: "Séries", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  if (isLoadingClient) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-foreground tracking-tight">Mes Statistiques</h1>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 md:w-auto md:inline-flex mb-8 bg-muted p-1.5 rounded-lg">
            <TabsTrigger value="stats" className="gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md"><BarChartBig className="h-4 w-4" />Statistiques</TabsTrigger>
            <TabsTrigger value="genres" disabled className="gap-2 px-4 py-2.5 text-sm"><Pyramid className="h-4 w-4" />Genres</TabsTrigger>
            <TabsTrigger value="actors" disabled className="gap-2 px-4 py-2.5 text-sm"><Users className="h-4 w-4" />Acteurs</TabsTrigger>
          </TabsList>
          <TabsContent value="stats">
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
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-foreground tracking-tight">Mes Statistiques</h1>
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 md:w-auto md:inline-flex mb-8 bg-muted p-1.5 rounded-lg">
          <TabsTrigger value="stats" className="gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
            <BarChartBig className="h-4 w-4" />Statistiques
          </TabsTrigger>
          <TabsTrigger value="genres" className="gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
            <Pyramid className="h-4 w-4" />Genres
          </TabsTrigger>
          <TabsTrigger value="actors" className="gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
            <Users className="h-4 w-4" />Acteurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-8">
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
                <ChartContainer config={chartConfig} className="w-full aspect-square max-h-[300px]">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel nameKey="name" />}
                    />
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.25;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs fill-foreground">
                            {`${chartData[index].name} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        );
                      }}>
                      {chartData.map((entry) => (
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
        </TabsContent>

        <TabsContent value="genres">
            <Alert className="shadow-md rounded-xl">
              <Pyramid className="h-5 w-5" />
              <AlertTitle>Bientôt disponible !</AlertTitle>
              <AlertDescription>
                Les statistiques par genres sont en cours de développement et arriveront prochainement.
              </AlertDescription>
            </Alert>
        </TabsContent>
        <TabsContent value="actors">
           <Alert className="shadow-md rounded-xl">
              <Users className="h-5 w-5" />
              <AlertTitle>Bientôt disponible !</AlertTitle>
              <AlertDescription>
                Les statistiques sur vos acteurs préférés sont en cours de développement.
              </AlertDescription>
            </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
