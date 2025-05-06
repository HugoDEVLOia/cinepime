import type { Media } from '@/services/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, CheckCircle, Star, CalendarDays, Film, TvIcon } from 'lucide-react';
import type { ListType } from '@/hooks/use-media-lists';
import { Badge } from './ui/badge';

interface MediaCardProps {
  media: Media;
  onAddToList: (media: Media, list: ListType) => void;
  onRemoveFromList: (mediaId: string, list: ListType) => void;
  isInList: (mediaId: string, list: ListType) => boolean;
}

export default function MediaCard({ media, onAddToList, onRemoveFromList, isInList }: MediaCardProps) {
  const isToWatch = isInList(media.id, 'toWatch');
  const isWatched = isInList(media.id, 'watched');

  const handleToggleList = (list: ListType) => {
    if (isInList(media.id, list)) {
      onRemoveFromList(media.id, list);
    } else {
      onAddToList(media, list);
      if (list === 'watched' && isInList(media.id, 'toWatch')) {
        onRemoveFromList(media.id, 'toWatch');
      } else if (list === 'toWatch' && isInList(media.id, 'watched')) {
        onRemoveFromList(media.id, 'watched');
      }
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full group border border-border/60 hover:border-primary/50 bg-card rounded-xl">
      <CardHeader className="p-0 relative">
        <Link href={`/media/${media.mediaType}/${media.id}`} aria-label={`Voir les détails de ${media.title}`} className="block">
          <div className="aspect-[2/3] w-full overflow-hidden rounded-t-xl">
            <Image
              src={media.posterUrl}
              alt={`Affiche de ${media.title}`}
              width={500}
              height={750}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${media.mediaType === 'movie' ? 'affiche film' : 'affiche serie'}`}
              onError={(e) => {
                e.currentTarget.src = 'https://picsum.photos/500/750?grayscale&blur=2';
              }}
              priority={false} 
            />
          </div>
        </Link>
        <Badge variant={media.mediaType === 'movie' ? 'default' : 'secondary'} className="absolute top-3 right-3 capitalize !px-2.5 !py-1.5 text-xs font-semibold shadow">
          {media.mediaType === 'movie' ? <Film className="h-3.5 w-3.5 mr-1.5"/> : <TvIcon className="h-3.5 w-3.5 mr-1.5" />}
          {media.mediaType === 'movie' ? 'Film' : 'Série'}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <Link href={`/media/${media.mediaType}/${media.id}`} className="hover:text-primary transition-colors">
            <CardTitle className="text-lg font-bold mb-1.5 line-clamp-2 leading-tight text-foreground">
              {media.title}
            </CardTitle>
          </Link>
          <div className="flex items-center text-xs text-muted-foreground mb-2 space-x-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{media.averageRating > 0 ? media.averageRating.toFixed(1) : 'N/A'}</span>
            </div>
            {media.releaseDate && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  <span className="font-medium">{new Date(media.releaseDate).getFullYear()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex flex-col sm:flex-row gap-2 justify-between items-center border-t border-border/50 mt-auto">
        <div className="flex gap-2 w-full">
        <Button
            variant={isToWatch ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleList('toWatch')}
            aria-pressed={isToWatch}
            title={isToWatch ? "Retirer de 'À Regarder'" : "Ajouter à 'À Regarder'"}
            className="flex-1 text-xs py-2.5"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            À Regarder
          </Button>
          <Button
            variant={isWatched ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleList('watched')}
            aria-pressed={isWatched}
            title={isWatched ? "Retirer de 'Vus'" : "Marquer comme Vu"}
            className="flex-1 text-xs py-2.5"
          >
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Vu
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
