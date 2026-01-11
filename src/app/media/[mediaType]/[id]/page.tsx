

'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  getMediaDetails,
  getSeriesSeasons,
  getMediaRecommendations,
  searchMedia,
  type Media,
  type Actor,
  type Director,
  type Season,
  type Video,
  type CountryProviderDetails,
  type ProviderDetail,
} from '@/services/tmdb';
import { useMediaLists } from '@/hooks/use-media-lists';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star, Users, User, Clapperboard, Tv, CalendarDays, Clock, Eye, CheckCircle, FilmIcon, ServerCrash, Info, ChevronRight, Loader2, PlaySquare, Radio, ExternalLink, Shield, Link2, XCircle, GitCompare, Search, SearchX, DollarSign, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from '@/components/media-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { useDebounce } from '@/hooks/use-debounce';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, PanInfo } from 'framer-motion';

interface ProviderCategoryProps {
  title: string;
  providers?: ProviderDetail[];
  baseLink?: string;
}

const ProviderLogoSection: React.FC<ProviderCategoryProps> = ({ title, providers, baseLink }) => {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {providers.map(provider => (
          <a
            key={provider.provider_id}
            href={baseLink} 
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
            title={`Regarder sur ${provider.provider_name}`}
          >
            <div className="flex flex-col items-center text-center">
              {provider.logo_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                  alt={provider.provider_name}
                  width={60}
                  height={60}
                  className="rounded-md object-contain mb-2 h-[60px] w-[60px]"
                  data-ai-hint="logo streaming"
                  onError={(e) => { e.currentTarget.src = 'https://picsum.photos/60/60?grayscale'; }}
                />
              ) : (
                <div className="h-[60px] w-[60px] flex items-center justify-center bg-muted rounded-md mb-2">
                  <FilmIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs font-medium text-foreground line-clamp-2">{provider.provider_name}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

interface WatchProviderSectionProps {
  providers?: CountryProviderDetails;
  mediaTitle: string;
}

const WatchProviderDisplay: React.FC<WatchProviderSectionProps> = ({ providers, mediaTitle }) => {
  if (!providers) {
    return (
       <Card className="shadow-md rounded-xl p-6 bg-card">
        <div className="flex flex-col items-center text-center text-muted-foreground">
          <Info className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">Aucune information de diffusion trouvée en France pour {mediaTitle}.</p>
        </div>
      </Card>
    );
  }

  const { link, flatrate, rent, buy, ads, free } = providers;
  const isEmpty = (!flatrate?.length && !rent?.length && !buy?.length && !ads?.length && !free?.length);

  if (isEmpty) {
    return (
      <Card className="shadow-md rounded-xl p-6 bg-card">
        <div className="flex flex-col items-center text-center text-muted-foreground">
          <Info className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">Aucune information de diffusion trouvée en France pour {mediaTitle}.</p>
          {link && (
             <Button asChild variant="link" className="mt-4">
                <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  Voir les options sur TMDB <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-xl p-4 md:p-6 bg-card">
      <CardContent className="p-0">
        <ProviderLogoSection title="Streaming (Abonnement)" providers={flatrate?.sort((a,b) => a.display_priority - b.display_priority)} baseLink={link} />
        <ProviderLogoSection title="Streaming (Gratuit avec pub)" providers={ads?.sort((a,b) => a.display_priority - b.display_priority)} baseLink={link} />
        <ProviderLogoSection title="Streaming (Gratuit)" providers={free?.sort((a,b) => a.display_priority - b.display_priority)} baseLink={link} />
        <ProviderLogoSection title="Louer" providers={rent?.sort((a,b) => a.display_priority - b.display_priority)} baseLink={link} />
        <ProviderLogoSection title="Acheter" providers={buy?.sort((a,b) => a.display_priority - b.display_priority)} baseLink={link} />
        
        {link && (
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                Voir toutes les options sur TMDB <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function CompareDialog({ mediaToCompare, onCompare }: { mediaToCompare: Media, onCompare: (media: Media) => void }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      setIsSearching(true);
      searchMedia(debouncedSearchTerm).then(results => {
        setSearchResults(results.filter(r => r.mediaType === 'movie' && r.id !== mediaToCompare.id));
        setIsSearching(false);
      });
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, mediaToCompare.id]);

  const handleSelect = (movie: Media) => {
    onCompare(movie);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto py-3 px-6 text-base">
          <GitCompare className="h-5 w-5" /> Comparer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Comparer "{mediaToCompare.title}" avec...</DialogTitle>
          <DialogDescription>
            Recherchez et sélectionnez un film pour lancer la comparaison.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-0">
          <Command shouldFilter={false} className="mt-4 bg-transparent">
            <CommandInput
              placeholder="Rechercher un film..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-12 text-base"
            />
          </Command>
        </div>
        <ScrollArea className="flex-grow px-6">
           <div className="pb-6">
            {isSearching && (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isSearching && searchResults.length === 0 && debouncedSearchTerm && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                <SearchX className="w-16 h-16 mb-4" />
                <p className="text-lg font-semibold">Aucun film trouvé pour "{debouncedSearchTerm}".</p>
              </div>
            )}
             {!isSearching && !debouncedSearchTerm && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                    <Search className="w-16 h-16 mb-4" />
                    <p className="text-lg font-semibold">Commencez votre recherche</p>
                    <p>Tapez le nom d'un film pour le trouver.</p>
                </div>
            )}
            {!isSearching && searchResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {searchResults.map((movie) => (
                  <div key={movie.id} className="relative group">
                    <MediaCard media={movie} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <Button
                        size="sm"
                        onClick={() => handleSelect(movie)}
                        className="w-4/5"
                      >
                        <GitCompare className="mr-2 h-4 w-4" /> Comparer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
           </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


export default function MediaDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mediaId = params.id as string;
  const mediaType = params.mediaType as 'movie' | 'tv';
  const cameFromDiscover = searchParams.get('from') === 'discover';

  const [media, setMedia] = useState<Media | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [director, setDirector] = useState<Director | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTogglingList, setIsTogglingList] = useState(false);
  const { toast } = useToast();


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
          mediaRecommendationsData,
        ] = await Promise.all([
          getMediaDetails(mediaId, mediaType), 
          getMediaRecommendations(mediaId, mediaType),
        ]);

        if (!mediaDetails) {
          setError(`Impossible de trouver les détails pour ce ${mediaType === 'movie' ? 'film' : 'cette série'}.`);
          setIsLoading(false);
          return;
        }

        setMedia(mediaDetails);
        setActors(mediaDetails.cast || []); 
        
        const directorData = mediaDetails.credits?.crew?.find((person: any) => person.job === 'Director');
        setDirector(directorData ? { id: directorData.id.toString(), name: directorData.name, profileUrl: getSafeProfileImageUrl(directorData.profile_path) } : null);
        
        setRecommendations(mediaRecommendationsData);

        if (mediaType === 'tv' && mediaDetails.id) {
          const seriesSeasons = await getSeriesSeasons(mediaDetails.id.toString());
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

  const formatCurrency = (amount: number | undefined) => {
    if(amount === undefined || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(amount);
  }
  
  const handleDragBack = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (cameFromDiscover && info.offset.x > 100 && info.velocity.x > 200) {
      router.back();
    }
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
    return null; 
  }
  
  const isToWatch = isInList(media.id, 'toWatch');
  const isWatched = isInList(media.id, 'watched');
  const trailerToDisplay = findBestTrailer(media.videos);
  const isAnime = media.keywords?.some(k => k.id === 210024);
  const animeSamaUrl = `https://anime-sama.si/catalogue/${media.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/`;


  const handleToggleList = async (listType: 'toWatch' | 'watched') => {
    if (!media) return;
    setIsTogglingList(true);

    if (isInList(media.id, listType)) {
      removeFromList(media.id, listType);
      toast({
        title: "Retiré de la liste",
        description: `"${media.title}" a été retiré de vos ${listType === 'watched' ? 'Vus' : 'À Regarder'}.`,
      });
    } else {
      await addToList(media, listType); 
      toast({
        title: "Ajouté à la liste",
        description: `"${media.title}" a été ajouté à vos ${listType === 'watched' ? 'Vus' : 'À Regarder'}.`,
      });
      // Logic to move between lists is handled in addToList hook
    }

    setIsTogglingList(false);
  };
  
  const handleStartCompare = (otherMedia: Media) => {
    if (!media) return;
    router.push(`/compare?a=${media.id}&b=${otherMedia.id}`);
  };

  return (
    <motion.div 
      drag={cameFromDiscover ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.5, right: 0 }}
      onDragEnd={handleDragBack}
      className="space-y-12 md:space-y-16"
    >
      <section className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="md:col-span-4 xl:col-span-3 flex justify-center md:justify-start">
          <Card className="overflow-hidden shadow-xl rounded-xl w-[250px] sm:w-[300px] md:w-full">
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

        <div className="md:col-span-8 xl:col-span-9 space-y-6">
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
              {media.contentRating && (
                <div className="flex items-center" title={`Classification : ${media.contentRating}`}>
                  <Shield className="w-5 h-5 mr-1.5 text-primary" />
                  <Badge
                    variant={
                      media.contentRating === 'TP' || media.contentRating === 'Tous publics'
                        ? 'secondary'
                        : ['16', '18', '18+', '-18', 'TV-MA'].some(r => media.contentRating?.includes(r))
                        ? 'destructive'
                        : 'outline'
                    }
                    className="text-xs font-semibold"
                  >
                    {media.contentRating}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {(media.budget || media.revenue) && media.mediaType === 'movie' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 bg-card/50">
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-7 w-7 text-green-600"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Budget</p>
                            <p className="text-lg font-bold text-foreground">{formatCurrency(media.budget)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-card/50">
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-7 w-7 text-green-600"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Recettes (Box Office)</p>
                            <p className="text-lg font-bold text-foreground">{formatCurrency(media.revenue)}</p>
                        </div>
                    </div>
                </Card>
            </div>
          )}

          <p className="text-foreground/80 leading-relaxed text-base md:text-lg">{media.description}</p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Button 
              size="lg"
              variant={isToWatch ? "default" : "outline"}
              onClick={() => handleToggleList('toWatch')} 
              aria-pressed={isToWatch}
              className="gap-2 w-full sm:w-auto py-3 px-6 text-base"
              disabled={isTogglingList}
            >
              {isTogglingList && !isInList(media.id, 'toWatch') ? <Loader2 className="h-5 w-5 animate-spin" /> : <Eye className="h-5 w-5" />}
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
              {isTogglingList && !isInList(media.id, 'watched') ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              {isWatched ? 'Déjà Vu' : 'Marquer comme Vu'}
            </Button>
            {mediaType === 'movie' && (
              <CompareDialog mediaToCompare={media} onCompare={handleStartCompare} />
            )}
          </div>

          {actors.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-foreground"><Users className="text-primary"/>Distribution Principale</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {actors.slice(0, mediaType === 'movie' ? 5 : 10).map(actor => (
                  <Link
                    key={actor.id} 
                    href={`/person/${actor.id}`}
                    className="block group"
                    title={`Voir le profil de ${actor.name}`}
                  >
                    <Card className="text-center p-3 shadow-md rounded-lg bg-card group-hover:shadow-lg transition-shadow h-full flex flex-col">
                      <div className="aspect-[2/3] w-full overflow-hidden rounded-md mb-2">
                        <Image
                          src={actor.profileUrl}
                          alt={actor.name}
                          width={100}
                          height={150}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint="profil acteur"
                          onError={(e) => { e.currentTarget.src = 'https://picsum.photos/100/150?grayscale'; }}
                        />
                      </div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{actor.name}</p>
                      {actor.character && <p className="text-xs text-muted-foreground line-clamp-2 mt-auto pt-1">{actor.character}</p>}
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {director && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-foreground"><User className="text-primary"/>Réalisation</h2>
              <Link 
                href={`/person/${director.id}`}
                className="inline-block group"
                title={`Voir le profil de ${director.name}`}
              >
                <Card className="flex items-center p-4 gap-4 shadow-md rounded-lg bg-card group-hover:shadow-lg transition-shadow w-full sm:w-auto sm:max-w-xs">
                  <div className="aspect-[2/3] w-[60px] h-[90px] rounded-md overflow-hidden">
                    <Image
                      src={director.profileUrl}
                      alt={director.name}
                      width={60}
                      height={90}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="profil realisateur"
                      onError={(e) => { e.currentTarget.src = 'https://picsum.photos/60/90?grayscale'; }}
                    />
                  </div>
                  <div>
                    <p className="text-md font-semibold text-foreground group-hover:text-primary transition-colors">{director.name}</p>
                    <p className="text-sm text-muted-foreground">Réalisateur</p>
                  </div>
                </Card>
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {media.watchProviders && media.watchProviders.FR && (
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
            <Radio className="text-primary h-7 w-7"/> Où Regarder
          </h2>
          <WatchProviderDisplay providers={media.watchProviders.FR} mediaTitle={media.title} />
        </section>
      )}

      <section>
        <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
          <Link2 className="text-primary h-7 w-7"/> Liens Directs
        </h2>
        <Card className="shadow-lg rounded-xl p-4 md:p-6 bg-card">
           <CardContent className="p-0 space-y-4">
              <Button asChild size="lg" className="w-full sm:w-auto" style={{ backgroundColor: '#1E1E1E' }}>
                <a
                  href={`https://cinepulse.lol/sheet/${media.mediaType}-${media.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-[#FF4545]"
                >
                  <Image src="https://cinepulse.lol/favicons/favicon.svg" alt="Cinepulse Logo" width={20} height={20}/>
                  Cinepulse (Recommandé)
                </a>
              </Button>
              
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                  <Button asChild style={{ backgroundColor: '#E50914', color: '#F5F5F1' }} className="hover:bg-red-800">
                      <a href={`https://movix.blog/search?q=${encodeURIComponent(media.title)}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <Image src="https://movix.blog/assets/movix-CzqwVOTS.png" alt="Movix Logo" width={20} height={20} className="mr-2 rounded-sm"/>
                          Movix
                      </a>
                  </Button>
                  
                  <Button asChild style={{ backgroundColor: '#4c1d95', color: '#fff' }} className="hover:bg-purple-900">
                      <a
                          href={`https://xalaflix.io/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                      >
                          <Image src="https://xalaflix.io/upload/images/logo/1.png" alt="Xalaflix Logo" width={20} height={20} className="mr-2 rounded-sm"/>
                          Xalaflix
                      </a>
                  </Button>
                  
                  <Button asChild style={{ backgroundColor: '#212121', color: '#fff' }} className="hover:bg-black/80">
                      <a
                          href={`https://purstream.to/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                      >
                          <Image src="https://purstream.to/assets/favicon.BYaz4d7M.ico" alt="PurStream Logo" width={20} height={20} className="mr-2 rounded-sm"/>
                          PurStream
                      </a>
                  </Button>

                  {isAnime && (
                    <Button asChild variant="secondary">
                      <a 
                        href={animeSamaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                         <Image src="https://cdn.statically.io/gh/Anime-Sama/IMG/img/autres/logo_icon.png" alt="Anime-Sama Logo" width={20} height={20} className="mr-2 rounded-sm"/>
                        Anime-Sama
                      </a>
                    </Button>
                  )}
              </div>
          </CardContent>
        </Card>
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
          <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2"><Tv className="text-primary h-7 w-7"/>Saisons &amp; Épisodes</h2>
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
          <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2"><FilmIcon className="text-primary h-7 w-7"/>Recommandations Similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {recommendations.slice(0, mediaType === 'movie' ? 5 : 10).map(rec => ( 
              <MediaCard
                key={rec.id}
                media={rec}
              />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}


function MediaDetailsSkeleton({ mediaType }: { mediaType: 'movie' | 'tv' }) {
  return (
    <div className="space-y-12 md:space-y-16 animate-pulse">
      <section className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="md:col-span-4 xl:col-span-3 flex justify-center md:justify-start">
          <Skeleton className="w-[250px] sm:w-[300px] md:w-full aspect-[2/3] rounded-xl" />
        </div>
        <div className="md:col-span-8 xl:col-span-9 space-y-6">
          <Skeleton className="h-8 w-28 rounded-md" /> {/* Badge */}
          <Skeleton className="h-12 w-4/5 rounded-lg" /> {/* Titre */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Skeleton className="h-6 w-20 rounded-md" /> {/* Note */}
            <Skeleton className="h-6 w-40 rounded-md" /> {/* Date de sortie */}
            {mediaType === 'movie' && <Skeleton className="h-6 w-24 rounded-md" />} {/* Durée */}
            {mediaType === 'tv' && <Skeleton className="h-6 w-28 rounded-md" />} {/* Saisons */}
            <Skeleton className="h-6 w-16 rounded-md" /> {/* Content Rating Skeleton */}
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

      {/* Watch Providers Skeleton */}
      <section>
        <Skeleton className="h-10 w-52 mb-6 rounded-lg" /> {/* Title "Où Regarder" */}
        <Card className="shadow-lg rounded-xl p-6 bg-card">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-40 mb-3 rounded" /> {/* Category title */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`provider-skel-${i}`} className="p-3 bg-muted/30 rounded-lg">
                    <Skeleton className="h-[60px] w-[60px] mx-auto mb-2 rounded-md" />
                    <Skeleton className="h-3 w-3/4 mx-auto rounded" />
                  </div>
                ))}
              </div>
            </div>
             <div> 
              <Skeleton className="h-6 w-32 mb-3 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <Skeleton className="p-3 bg-muted/30 rounded-lg">
                  <Skeleton className="h-[60px] w-[60px] mx-auto mb-2 rounded-md" />
                  <Skeleton className="h-3 w-3/4 mx-auto rounded" />
                </Skeleton>
              </div>
            </div>
          </div>
        </Card>
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
                <Skeleton className="h-12 w-full rounded-md" /> 
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

function getSafeProfileImageUrl(path: string | null | undefined): string {
  if (path) {
    return `https://image.tmdb.org/t/p/w500${path}`;
  }
  return 'https://picsum.photos/500/750?grayscale'; 
}
    
    

    















