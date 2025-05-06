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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <div className="space-y-2 p-2">
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
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-lg shadow-sm border border-border">
          <ListX className="w-20 h-20 text-muted-foreground mb-6" />
          <p className="text-2xl font-semibold text-foreground mb-2">Votre liste est vide.</p>
          <p className="text-md text-muted-foreground">
            {listType === 'toWatch' ? "Ajoutez des films ou séries que vous voulez regarder !" : "Marquez des éléments comme vus pour les voir ici."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8">
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
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-foreground tracking-tight">Mes Listes</h1>
      <Tabs defaultValue="toWatch" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex mb-8 bg-muted p-1.5 rounded-lg">
          <TabsTrigger value="toWatch" className="gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
            <Eye className="h-4 w-4" /> À Regarder ({isLoaded ? toWatchList.length : '...'})
          </TabsTrigger>
          <TabsTrigger value="watched" className="gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
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
