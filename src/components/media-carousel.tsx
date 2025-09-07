
'use client';

import type { ReactNode } from 'react';
import type { Media, MediaType } from '@/services/tmdb';
import MediaCard, { MediaCardSkeleton } from '@/components/media-card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface MediaCarouselProps {
  title: string;
  media: Media[];
  icon: ReactNode;
  isLoading?: boolean;
}

export default function MediaCarousel({
  title,
  media,
  icon,
  isLoading = false
}: MediaCarouselProps) {
  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-foreground flex items-center gap-3">
        {icon} {title}
      </h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex space-x-4 md:space-x-6 pb-4">
          {isLoading 
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="w-[180px] sm:w-[220px]">
                  <MediaCardSkeleton />
                </div>
              ))
            : media.map((item, index) => (
                <div key={item.id} className="w-[180px] sm:w-[220px]">
                  <MediaCard
                    media={item}
                    imageLoading={index < 4 ? 'eager' : 'lazy'} // Prioritize loading for first few items
                  />
                </div>
              ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
