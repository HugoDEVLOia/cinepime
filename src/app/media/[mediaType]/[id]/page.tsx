
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
  type Video,
} from '@/services/tmdb';
import { useMediaLists } from '@/hooks/use-media-lists';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star, Users, User, Clapperboard, Tv, CalendarDays, Clock, Eye, CheckCircle, FilmIcon, ServerCrash, Info, ChevronRight, Loader2, PlaySquare } from 'lucide-react';
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
  const [isTogglingList, setIsTogglingList] = useState(false);


  const { addToList, removeFromList, isInList } = useMediaLists();

  useEffect(() => {
    if (!mediaId || !mediaType || (mediaType !== 'movie' && mediaType !== 'tv')) {
      setError("Type de média ou ID invalide.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [
          mediaDetails,
          // mediaActors, // Actors are now part of mediaDetails.credits.cast
          // mediaDirectorData, // Director is now part of mediaDetails.credits.crew
          mediaRecommendationsData,
        ] = await Promise.all([
          getMediaDetails(mediaId, mediaType), // This now also fetches videos and credits
          // getMediaActors(mediaId, mediaType), // No longer needed if details includes credits
          // getMediaDirector(mediaId, mediaType), // No longer needed if details includes credits
          getMediaRecommendations(mediaId, mediaType),
        ]);

        if (!mediaDetails) {
          setError(`Impossible de trouver les détails pour ce ${mediaType === 'movie' ? 'film' : 'cette série'}.`);
          setIsLoading(false);
          return;
        }

        setMedia(mediaDetails);
        setActors(mediaDetails.cast || []); // Use actors from mediaDetails.cast
        
        // Extract director from credits.crew
        const directorData = mediaDetails.credits?.crew?.find((person: any) => person.job === 'Director');
        setDirector(directorData ? { id: directorData.id.toString(), name: directorData.name, profileUrl: getSafeProfileImageUrl(directorData.profile_path) } : null);
        
        setRecommendations(mediaRecommendationsData);

        if (mediaType === 'tv' && mediaDetails.id) {
          const seriesSeasons = await getSeriesSeasons(mediaDetails.id);
          setSeasons(seriesSeasons);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des détails du média:', err);
        setError(`Échec du chargement des détails ${mediaType === 'movie' ? 'du film' : 'de la série'}. Veuillez réessayer plus tard.`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [mediaId, mediaType]);

  const findBestTrailer = (videos?: Video[]): Video | null => {
    if (!videos || videos.length === 0) return null;

    const youtubeVideos = videos.filter(v => v.site === 'YouTube');
    if (youtubeVideos.length === 0) return null;
  
    let trailer = youtubeVideos.find(v => v.type === 'Trailer' && v.official && v.iso_639_1 === 'fr');
    if (trailer) return trailer;
  
    trailer = youtubeVideos.find(v => v.type === 'Trailer' && v.official);
    if (trailer) return trailer;
    
    trailer = youtubeVideos.find(v => v.type === 'Trailer' && v.iso_639_1 === 'fr');
    if (trailer) return trailer;
  
    trailer = youtubeVideos.find(v => v.type === 'Trailer');
    if (trailer) return trailer;
  
    trailer = youtubeVideos.find(v => v.type === 'Teaser' && v.official && v.iso_639_1 === 'fr');
    if (trailer) return trailer;
  
    trailer = youtubeVideos.find(v => v.type === 'Teaser' && v.official);
    if (trailer) return trailer;
    
    trailer = youtubeVideos.find(v => v.official && v.iso_639_1 === 'fr');
    if (trailer) return trailer;
    trailer = youtubeVideos.find(v => v.official);
    if (trailer) return trailer;
  
    trailer = youtubeVideos.find(v => v.iso_639_1 === 'fr');
    if (trailer) return trailer;
  
    return youtubeVideos[0] || null;
  };

  if (isLoading) {
    return <MediaDetailsSkeleton mediaType={mediaType} />;
  }

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Alert variant="destructive" className="max-w-md shadow-lg">
          <ServerCrash className="h-5 w-5" />
          <AlertTitle>Erreur de Chargement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!media) {
    notFound();
    return null; // Should not be reached if notFound() works as expected
  }
  
  const isToWatch = isInList(media.id, 'toWatch');
  const isWatched = isInList(media.id, 'watched');
  const trailerToDisplay = findBestTrailer(media.videos);

  const handleToggleList = async (listType: 'toWatch' | 'watched') => {
    if (!media) return;
    setIsTogglingList(true);
    if (isInList(media.id, listType)) {
      removeFromList(media.id, listType);
    } else {
      await addToList(media, listType); 
      if (listType === 'watched' && isInList(media.id, 'toWatch')) {
        removeFromList(media.id, 'toWatch');
      } else if (listType === 'toWatch' && isInList(media.id, 'watched')) {
        removeFromList(media.id, 'watched');
      }
    }
    setIsTogglingList(false);
  };

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="overflow-hidden shadow-xl rounded-xl">
            <Image
              src={media.posterUrl}
              alt={`Affiche de ${media.title}`}
              width={500}
              height={750}
              className="object-cover w-full h-auto"
              priority
              data-ai-hint={`${mediaType === 'movie' ? 'affiche film' : 'affiche série'}`}
               onError={(e) => { e.currentTarget.src = 'https://picsum.photos/500/750?grayscale&blur=2'; }}
            />
          </Card>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="space-y-3">
            <Badge variant={media.mediaType === 'movie' ? 'default' : 'secondary'} className="text-sm capitalize !px-3 !py-1.5 shadow">
              {media.mediaType === 'movie' ? <FilmIcon className="h-4 w-4 mr-1.5"/> : <Tv className="h-4 w-4 mr-1.5" />}
              {media.mediaType === 'movie' ? 'Film' : 'Série'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{media.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm md:text-base">
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-1.5 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{media.averageRating > 0 ? media.averageRating.toFixed(1) : 'N/A'}</span>
              </div>
              {media.releaseDate && (
                <div className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-1.5" />
                  <span>{new Date(media.releaseDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {media.mediaType === 'movie' && media.runtime && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-1.5" />
                  <span>{media.runtime} min</span>
                </div>
              )}
              {media.mediaType === 'tv' && media.numberOfSeasons && (
                <div className="flex items-center">
                  <Tv className="w-5 h-5 mr-1.5" />
                  <span>{media.numberOfSeasons} Saison{media.numberOfSeasons > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-foreground/80 leading-relaxed text-base md:text-lg">{media.description}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              size="lg"
              variant={isToWatch ? "default" : "outline"}
              onClick={() => handleToggleList('toWatch')} 
              aria-pressed={isToWatch}
              className="gap-2 w-full sm:w-auto py-3 px-6 text-base"
              disabled={isTogglingList}
            >
              {isTogglingList && isInList(media.id, 'toWatch') === false ? <Loader2 className="h-5 w-5 animate-spin" /> : <Eye className="h-5 w-5" />}
              {isToWatch ? 'Dans "À Regarder"' : 'Ajouter à "À Regarder"'}
            </Button>
            <Button 
              size="lg"
              variant={isWatched ? "default" : "outline"}
              onClick={() => handleToggleList('watched')} 
              aria-pressed={isWatched}
              className="gap-2 w-full sm:w-auto py-3 px-6 text-base"
              disabled={isTogglingList}
            >
              {isTogglingList && isInList(media.id, 'watched') === false ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              {isWatched ? 'Déjà Vu' : 'Marquer comme Vu'}
            </Button>
          </div>

          {actors.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-foreground"><Users className="text-primary"/>Distribution Principale</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {actors.slice(0, mediaType === 'movie' ? 5 : 10).map(actor => (
                  <Card key={actor.id} className="text-center p-3 shadow-md rounded-lg bg-card hover:shadow-lg transition-shadow">
                    <Image
                      src={actor.profileUrl}
                      alt={actor.name}
                      width={100}
                      height={150}
                      className="rounded-md object-cover mx-auto mb-2 aspect-[2/3]"
                      data-ai-hint="profil acteur"
                       onError={(e) => { e.currentTarget.src = 'https://picsum.photos/100/150?grayscale'; }}
                    />
                    <p className="text-sm font-medium text-foreground">{actor.name}</p>
                    {actor.character && <p className="text-xs text-muted-foreground line-clamp-2">{actor.character}</p>}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {director && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-foreground"><User className="text-primary"/>Réalisation</h2>
              <Card className="flex items-center p-4 gap-4 shadow-md rounded-lg bg-card hover:shadow-lg transition-shadow w-full sm:w-auto sm:max-w-xs">
                <Image
                  src={director.profileUrl}
                  alt={director.name}
                  width={60}
                  height={90}
                  className="rounded-md object-cover aspect-[2/3]"
                  data-ai-hint="profil realisateur"
                  onError={(e) => { e.currentTarget.src = 'https://picsum.photos/60/90?grayscale'; }}
                />
                <div>
                  <p className="text-md font-semibold text-foreground">{director.name}</p>
                  <p className="text-sm text-muted-foreground">Réalisateur</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {trailerToDisplay && (
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
            <PlaySquare className="text-primary h-7 w-7"/> Bande-annonce
          </h2>
          <div className="aspect-video w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-muted">
            <iframe
              src={`https://www.youtube.com/embed/${trailerToDisplay.key}?autoplay=0&modestbranding=1&rel=0`}
              title={trailerToDisplay.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </section>
      )}

      {mediaType === 'tv' && seasons.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2"><Tv className="text-primary"/>Saisons &amp; Épisodes</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {seasons.sort((a,b) => a.seasonNumber - b.seasonNumber).map(season => (
              <AccordionItem value={`season-${season.seasonNumber}`} key={season.id} className="border border-border bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="px-6 py-4 text-lg hover:no-underline hover:bg-muted/50 rounded-t-xl transition-colors group">
                  <div className="flex items-center gap-4 w-full">
                     <Image
                        src={season.posterUrl}
                        alt={`Affiche de ${season.name}`}
                        width={60}
                        height={90}
                        className="rounded-md object-cover aspect-[2/3] shadow-sm"
                        data-ai-hint="affiche saison"
                         onError={(e) => { e.currentTarget.src = 'https://picsum.photos/60/90?grayscale&amp;blur=1'; }}
                      />
                    <div className="text-left flex-grow">
                      <span className="font-semibold text-foreground">{season.name}</span>
                      <p className="text-sm text-muted-foreground font-normal">{season.episodeCount} Épisodes {season.airDate ? `• Diffusée en ${new Date(season.airDate).getFullYear()}` : ''}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-3 bg-background/50 rounded-b-xl">
                  {season.overview && <p className="text-sm text-muted-foreground mb-4 italic">{season.overview}</p>}
                  {season.episodes.length > 0 ? (
                    <ul className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-2">
                    {season.episodes.sort((a,b) => a.episodeNumber - b.episodeNumber).map(episode => (
                      <li key={episode.id} className="p-4 border border-border rounded-lg bg-card shadow-sm hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-foreground flex-grow">{episode.episodeNumber}. {episode.title}</h4>
                          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                            <Star className="w-3.5 h-3.5 mr-1 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{episode.rating > 0 ? episode.rating.toFixed(1) : 'N/A'}</span>
                          </div>
                        </div>
                        {episode.airDate && <p className="text-xs text-muted-foreground mt-0.5">Diffusé le : {new Date(episode.airDate).toLocaleDateString('fr-FR')}</p>}
                        {episode.description && <p className="text-sm text-foreground/80 mt-2 line-clamp-3">{episode.description}</p>}
                        {!episode.description && <p className="text-sm text-muted-foreground mt-2 italic">Aucune description pour cet épisode.</p>}
                      </li>
                    ))}
                  </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg bg-muted/30">
                        <Info className="w-10 h-10 text-muted-foreground mb-3"/>
                        <p className="text-md font-medium text-muted-foreground">Informations sur les épisodes non encore disponibles.</p>
                        <p className="text-sm text-muted-foreground">Revenez bientôt pour les détails.</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {recommendations.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2"><FilmIcon className="text-primary"/>Recommandations Similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {recommendations.slice(0, mediaType === 'movie' ? 5 : 10).map(rec => ( 
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
    <div className="space-y-12 md:space-y-16 animate-pulse">
      <section className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-4 xl:col-span-3">
          <Skeleton className="w-full aspect-[2/3] rounded-xl" />
        </div>
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <Skeleton className="h-8 w-28 rounded-md" /> {/* Badge */}
          <Skeleton className="h-12 w-4/5 rounded-lg" /> {/* Titre */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Skeleton className="h-6 w-20 rounded-md" /> {/* Note */}
            <Skeleton className="h-6 w-40 rounded-md" /> {/* Date de sortie */}
            {mediaType === 'movie' && <Skeleton className="h-6 w-24 rounded-md" />} {/* Durée */}
            {mediaType === 'tv' && <Skeleton className="h-6 w-28 rounded-md" />} {/* Saisons */}
          </div>
          <Skeleton className="h-24 w-full rounded-lg" /> {/* Description */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-12 w-full sm:w-48 rounded-lg" />
            <Skeleton className="h-12 w-full sm:w-48 rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-8 w-40 mb-4 rounded-lg" /> {/* Titre Distribution */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-full aspect-[2/3] rounded-md" />
                  <Skeleton className="h-4 w-3/4 mx-auto rounded" />
                  <Skeleton className="h-3 w-1/2 mx-auto rounded" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-8 w-32 mb-4 rounded-lg" /> {/* Titre Réalisateur */}
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg">
              <Skeleton className="h-[90px] w-[60px] rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Skeleton */}
      <section>
        <Skeleton className="h-10 w-56 mb-6 rounded-lg" /> {/* Titre Bande-annonce */}
        <Skeleton className="aspect-video w-full max-w-3xl mx-auto rounded-xl" />
      </section>

      {mediaType === 'tv' && (
        <section>
          <Skeleton className="h-10 w-56 mb-6 rounded-lg" /> {/* Titre Saisons */}
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-border bg-card rounded-xl p-4">
                <Skeleton className="h-12 w-full rounded-md" /> {/* Déclencheur Accordéon */}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <Skeleton className="h-10 w-64 mb-6 rounded-lg" /> {/* Titre Recommandations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <div className="space-y-2 p-2">
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

// Helper function to get profile image URL (already in tmdb.ts, ensure it's available or define locally if needed)
function getSafeProfileImageUrl(path: string | null | undefined): string {
  if (path) {
    return `https://image.tmdb.org/t/p/w500${path}`;
  }
  return 'https://picsum.photos/100/150?grayscale'; 
}
