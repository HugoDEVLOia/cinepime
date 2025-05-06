'use client';

import { useMediaLists } from '@/hooks/use-media-lists';
import MediaCard from '@/components/media-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, CheckCircle, ListX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyListsPage() {
  const { toWatchList, watchedList, addToList, removeFromList, isInList, isLoaded } = useMediaLists();

  const renderList = (list: any[], listType: 'toWatch' | 'watched') => {
    if (!isLoaded) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ListX className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Votre liste est vide.</p>
          <p className="text-sm text-muted-foreground">
            {listType === 'toWatch' ? "Ajoutez des films ou séries que vous voulez regarder !" : "Marquez des éléments comme vus pour les voir ici."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {list.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            onAddToList={addToList}
            onRemoveFromList={removeFromList}
            isInList={isInList}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-primary">Mes Listes</h1>
      <Tabs defaultValue="toWatch" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="toWatch" className="gap-2">
            <Eye className="h-4 w-4" /> À Regarder ({isLoaded ? toWatchList.length : '...'})
          </TabsTrigger>
          <TabsTrigger value="watched" className="gap-2">
            <CheckCircle className="h-4 w-4" /> Vus ({isLoaded ? watchedList.length : '...'})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="toWatch">
          {renderList(toWatchList, 'toWatch')}
        </TabsContent>
        <TabsContent value="watched">
          {renderList(watchedList, 'watched')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
