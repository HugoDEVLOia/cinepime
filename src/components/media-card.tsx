import type { Media } from '@/services/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, CheckCircle, Star, CalendarDays } from 'lucide-react';
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
      // If adding to 'watched', remove from 'toWatch' and vice-versa (optional behavior)
      if (list === 'watched' && isInList(media.id, 'toWatch')) {
        onRemoveFromList(media.id, 'toWatch');
      } else if (list === 'toWatch' && isInList(media.id, 'watched')) {
        onRemoveFromList(media.id, 'watched');
      }
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Link href={`/media/${media.mediaType}/${media.id}`} aria-label={`Voir les détails de ${media.title}`}>
          <div className="aspect-[2/3] w-full overflow-hidden">
            <Image
              src={media.posterUrl}
              alt={`Affiche de ${media.title}`}
              width={500}
              height={750}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${media.mediaType === 'movie' ? 'affiche film' : 'affiche série'}`}
              onError={(e) => {
                // Fallback for broken images
                e.currentTarget.src = 'https://picsum.photos/500/750?grayscale&blur=2';
              }}
            />
          </div>
        </Link>
        <Badge variant="secondary" className="absolute top-2 right-2">
          {media.mediaType === 'movie' ? 'Film' : 'Série'}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/media/${media.mediaType}/${media.id}`} className="hover:text-accent transition-colors">
          <CardTitle className="text-lg font-semibold mb-2 line-clamp-2 leading-tight">
            {media.title}
          </CardTitle>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
          <span>{media.averageRating > 0 ? media.averageRating.toFixed(1) : 'N/A'}</span>
        </div>
        {media.releaseDate && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 mr-1" />
            <span>{new Date(media.releaseDate).getFullYear()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2 justify-between items-center">
        <div className="flex gap-2">
        <Button
            variant={isToWatch ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleList('toWatch')}
            aria-pressed={isToWatch}
            title={isToWatch ? "Retirer de 'À Regarder'" : "Ajouter à 'À Regarder'"}
          >
            <Eye className="mr-1 h-4 w-4" />
            À Regarder
          </Button>
          <Button
            variant={isWatched ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleList('watched')}
            aria-pressed={isWatched}
            title={isWatched ? "Retirer de 'Vus'" : "Marquer comme 'Non Vu'"}
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            Vu
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
