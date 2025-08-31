import type { Media } from '@/services/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, Star, CalendarDays, Film, TvIcon, User, Briefcase } from 'lucide-react';
import type { ListType } from '@/hooks/use-media-lists';
import { Badge } from './ui/badge';
import { useState, useCallback } from 'react';
import { Skeleton } from './ui/skeleton';
import { useMediaLists } from '@/hooks/use-media-lists';


interface MediaCardProps {
  media: Media;
  onAddToList: (media: Media, list: ListType) => Promise<void>;
  onRemoveFromList: (mediaId: string, list: ListType) => void;
  isInList: (mediaId: string, list: ListType) => boolean;
  imageLoading?: 'eager' | 'lazy';
}

export default function MediaCard({ media, onAddToList, onRemoveFromList, isInList, imageLoading = 'lazy' }: MediaCardProps) {

  const getBadge = () => {
    switch (media.mediaType) {
      case 'movie':
        return (
          <Badge variant={'default'} className="absolute top-3 right-3 capitalize !px-2.5 !py-1.5 text-xs font-semibold shadow">
            <Film className="h-3.5 w-3.5 mr-1.5"/> Film
          </Badge>
        );
      case 'tv':
        return (
          <Badge variant={'secondary'} className="absolute top-3 right-3 capitalize !px-2.5 !py-1.5 text-xs font-semibold shadow">
            <TvIcon className="h-3.5 w-3.5 mr-1.5"/> Série
          </Badge>
        );
      case 'person':
        return (
          <Badge variant={'outline'} className="absolute top-3 right-3 capitalize !px-2.5 !py-1.5 text-xs font-semibold shadow bg-background/80">
             <Briefcase className="h-3.5 w-3.5 mr-1.5"/> {media.knownForDepartment === "Acting" ? "Acteur" : "Artiste"}
          </Badge>
        );
      default:
        return null;
    }
  };

  const linkUrl = media.mediaType === 'person' ? `/person/${media.id}` : `/media/${media.mediaType}/${media.id}`;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full group border border-border/60 hover:border-primary/50 bg-card rounded-xl">
      <CardHeader className="p-0 relative">
        <Link href={linkUrl} aria-label={`Voir les détails de ${media.title}`} className="block">
          <div className="aspect-[2/3] w-full overflow-hidden rounded-t-xl bg-muted">
            <Image
              src={media.posterUrl}
              alt={`Affiche de ${media.title}`}
              width={500}
              height={750}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${media.mediaType === 'person' ? 'profil personne' : 'affiche'}`}
              loading={imageLoading}
              onError={(e) => {
                e.currentTarget.src = 'https://picsum.photos/500/750?grayscale&blur=2';
              }}
              priority={imageLoading === 'eager'} 
            />
          </div>
        </Link>
        {getBadge()}
      </CardHeader>
      <CardContent className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <Link href={linkUrl} className="hover:text-primary transition-colors">
            <CardTitle className="text-md font-bold mb-1.5 line-clamp-2 leading-tight text-foreground group-hover:text-primary">
              {media.title}
            </CardTitle>
          </Link>
          {media.mediaType !== 'person' ? (
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
          ) : (
             <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {media.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MediaCardSkeleton() {
  return (
     <div className="flex flex-col space-y-3">
      <Skeleton className="h-[270px] sm:h-[330px] w-full rounded-xl" />
      <div className="space-y-2 p-1">
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
