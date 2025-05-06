'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import {
  getMediaDetails,
  getMediaActors,
  getMediaDirector,
  getSeriesSeasons,
  getMediaRecommendations,
  type Media,
  type Actor,
  type Director,
  type Season,
} from '@/services/tmdb';
import { useMediaLists } from '@/hooks/use-media-lists';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star, Users, User, Clapperboard, Tv, CalendarDays, Clock, Eye, CheckCircle, Film, ServerCrash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from '@/components/media-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MediaDetailsPage() {
  const params = useParams();
  const mediaId = params.id as string;
  const mediaType = params.mediaType as 'movie' | 'tv';

  const [media, setMedia] = useState<Media | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [director, setDirector] = useState<Director | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToList, removeFromList, isInList } = useMediaLists();

  useEffect(() => {
    if (!mediaId || !mediaType || (mediaType !== 'movie' && mediaType !== 'tv')) {
      setError("Invalid media type or ID.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [
          mediaDetails,
          mediaActors,
          mediaDirectorData,
          mediaRecommendationsData,
        ] = await Promise.all([
          getMediaDetails(mediaId, mediaType),
          getMediaActors(mediaId, mediaType),
          getMediaDirector(mediaId, mediaType),
          getMediaRecommendations(mediaId, mediaType),
        ]);

        if (!mediaDetails) {
          setError(`Could not find details for this ${mediaType}.`);
          setIsLoading(false);
          return;
        }

        setMedia(mediaDetails);
        setActors(mediaActors);
        setDirector(mediaDirectorData);
        setRecommendations(mediaRecommendationsData);

        if (mediaType === 'tv' && mediaDetails.id) {
          const seriesSeasons = await getSeriesSeasons(mediaDetails.id);
          setSeasons(seriesSeasons);
        }
      } catch (err) {
        console.error('Error fetching media details:', err);
        setError(`Failed to load ${mediaType} details. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [mediaId, mediaType]);

  if (isLoading) {
    return <MediaDetailsSkeleton mediaType={mediaType} />;
  }

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Alert variant="destructive" className="max-w-md">
          <ServerCrash className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!media) {
    notFound(); // Should be caught by error state, but as a fallback
  }
  
  const isToWatch = isInList(media.id, 'toWatch');
  const isWatched = isInList(media.id, 'watched');

  const handleToggleList = (listType: 'toWatch' | 'watched') => {
    if (isInList(media.id, listType)) {
      removeFromList(media.id, listType);
    } else {
      addToList(media, listType);
      if (listType === 'watched' && isInList(media.id, 'toWatch')) {
        removeFromList(media.id, 'toWatch');
      } else if (listType === 'toWatch' && isInList(media.id, 'watched')) {
        removeFromList(media.id, 'watched');
      }
    }
  };

  return (
    <div className="space-y-12">
      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <Card className="overflow-hidden shadow-xl">
            <Image
              src={media.posterUrl}
              alt={`Poster for ${media.title}`}
              width={500}
              height={750}
              className="object-cover w-full h-auto"
              priority
              data-ai-hint={`${mediaType === 'movie' ? 'movie poster' : 'series poster'}`}
               onError={(e) => { e.currentTarget.src = 'https://picsum.photos/500/750?grayscale&blur=2'; }}
            />
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary" className="text-sm">
              {media.mediaType === 'movie' ? 'Movie' : 'Series'}
            </Badge>
            <h1 className="text-4xl font-bold text-primary">{media.title}</h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-1 text-yellow-400 fill-yellow-400" />
                <span>{media.averageRating > 0 ? media.averageRating.toFixed(1) : 'N/A'}</span>
              </div>
              {media.releaseDate && (
                <div className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-1" />
                  <span>{new Date(media.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {media.mediaType === 'movie' && media.runtime && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-1" />
                  <span>{media.runtime} min</span>
                </div>
              )}
              {media.mediaType === 'tv' && media.numberOfSeasons && (
                <div className="flex items-center">
                  <Tv className="w-5 h-5 mr-1" />
                  <span>{media.numberOfSeasons} Season{media.numberOfSeasons > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-foreground/80 leading-relaxed">{media.description}</p>

          <div className="flex flex-wrap gap-3">
            <Button 
              variant={isToWatch ? "default" : "outline"}
              onClick={() => handleToggleList('toWatch')} 
              aria-pressed={isToWatch}
              className="gap-2"
            >
              <Eye className="h-4 w-4" /> {isToWatch ? 'On "To Watch" List' : 'Add to "To Watch"'}
            </Button>
            <Button 
              variant={isWatched ? "default" : "outline"}
              onClick={() => handleToggleList('watched')} 
              aria-pressed={isWatched}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" /> {isWatched ? 'Watched' : 'Mark as Watched'}
            </Button>
          </div>

          {actors.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2"><Users />Main Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {actors.map(actor => (
                  <Card key={actor.id} className="text-center p-3 shadow-md">
                    <Image
                      src={actor.profileUrl}
                      alt={actor.name}
                      width={100}
                      height={150}
                      className="rounded-md object-cover mx-auto mb-2 aspect-[2/3]"
                      data-ai-hint="actor profile"
                       onError={(e) => { e.currentTarget.src = 'https://picsum.photos/100/150?grayscale'; }}
                    />
                    <p className="text-sm font-medium">{actor.name}</p>
                    {actor.character && <p className="text-xs text-muted-foreground">{actor.character}</p>}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {director && (
            <div>
              <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2"><User />Director</h2>
              <Card className="flex items-center p-3 gap-3 shadow-md w-full sm:w-auto sm:max-w-xs">
                <Image
                  src={director.profileUrl}
                  alt={director.name}
                  width={60}
                  height={90}
                  className="rounded-md object-cover aspect-[2/3]"
                  data-ai-hint="director profile"
                  onError={(e) => { e.currentTarget.src = 'https://picsum.photos/60/90?grayscale'; }}
                />
                <p className="text-md font-medium">{director.name}</p>
              </Card>
            </div>
          )}
        </div>
      </section>

      {mediaType === 'tv' && seasons.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6 text-primary flex items-center gap-2"><Tv />Seasons & Episodes</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {seasons.sort((a,b) => a.seasonNumber - b.seasonNumber).map(season => (
              <AccordionItem value={`season-${season.seasonNumber}`} key={season.id} className="border bg-card rounded-lg shadow-md">
                <AccordionTrigger className="px-6 py-4 text-lg hover:no-underline">
                  <div className="flex items-center gap-4">
                     <Image
                        src={season.posterUrl}
                        alt={`Poster for ${season.name}`}
                        width={60}
                        height={90}
                        className="rounded object-cover aspect-[2/3]"
                        data-ai-hint="season poster"
                         onError={(e) => { e.currentTarget.src = 'https://picsum.photos/60/90?grayscale&blur=1'; }}
                      />
                    <div className="text-left">
                      {season.name}
                      <p className="text-sm text-muted-foreground font-normal">{season.episodeCount} Episodes {season.airDate ? `• Aired ${new Date(season.airDate).getFullYear()}` : ''}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 space-y-3">
                  {season.overview && <p className="text-sm text-muted-foreground mb-4">{season.overview}</p>}
                  {season.episodes.length > 0 ? (
                    <ul className="space-y-3">
                    {season.episodes.sort((a,b) => a.episodeNumber - b.episodeNumber).map(episode => (
                      <li key={episode.id} className="p-3 border rounded-md bg-background/50">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold">{episode.episodeNumber}. {episode.title}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="w-3.5 h-3.5 mr-1 text-yellow-400 fill-yellow-400" />
                            <span>{episode.rating > 0 ? episode.rating.toFixed(1) : 'N/A'}</span>
                          </div>
                        </div>
                        {episode.airDate && <p className="text-xs text-muted-foreground">Aired: {new Date(episode.airDate).toLocaleDateString()}</p>}
                        <p className="text-sm text-foreground/80 mt-1 line-clamp-3">{episode.description}</p>
                      </li>
                    ))}
                  </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Episode information not yet available for this season.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {recommendations.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6 text-primary flex items-center gap-2"><Film />Recommendations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recommendations.slice(0,5).map(rec => ( // Show up to 5 recommendations
              <MediaCard
                key={rec.id}
                media={rec}
                onAddToList={addToList}
                onRemoveFromList={removeFromList}
                isInList={isInList}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


function MediaDetailsSkeleton({ mediaType }: { mediaType: 'movie' | 'tv' }) {
  return (
    <div className="space-y-12 animate-pulse">
      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <Skeleton className="w-full aspect-[2/3] rounded-lg" />
        </div>
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-6 w-24 rounded" /> {/* Badge */}
          <Skeleton className="h-10 w-3/4 rounded" /> {/* Title */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-5 w-16 rounded" /> {/* Rating */}
            <Skeleton className="h-5 w-32 rounded" /> {/* Release Date */}
            {mediaType === 'movie' && <Skeleton className="h-5 w-20 rounded" />} {/* Runtime */}
            {mediaType === 'tv' && <Skeleton className="h-5 w-24 rounded" />} {/* Seasons */}
          </div>
          <Skeleton className="h-20 w-full rounded" /> {/* Description */}
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-36 rounded" />
            <Skeleton className="h-10 w-36 rounded" />
          </div>
          <div>
            <Skeleton className="h-8 w-32 mb-3 rounded" /> {/* Cast Title */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-full aspect-[2/3] rounded-md" />
                  <Skeleton className="h-4 w-3/4 mx-auto rounded" />
                  <Skeleton className="h-3 w-1/2 mx-auto rounded" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-8 w-24 mb-3 rounded" /> {/* Director Title */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-[90px] w-[60px] rounded-md" />
              <Skeleton className="h-6 w-32 rounded" />
            </div>
          </div>
        </div>
      </section>

      {mediaType === 'tv' && (
        <section>
          <Skeleton className="h-9 w-48 mb-6 rounded" /> {/* Seasons Title */}
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border bg-card rounded-lg p-4">
                <Skeleton className="h-10 w-full rounded" /> {/* Accordion Trigger */}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <Skeleton className="h-9 w-56 mb-6 rounded" /> {/* Recommendations Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" /> {/* Reduced height for rec cards */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

