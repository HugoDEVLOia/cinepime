
'use client';

import type { ChangeEvent } from 'react';
import { useMediaLists, type Media } from '@/hooks/use-media-lists';
import MediaCard from '@/components/media-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, CheckCircle, ListX, Upload, Download, FileJson, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function MyListsPage() {
  const { toWatchList, watchedList, addToList, removeFromList, isInList, isLoaded, setLists } = useMediaLists();
  const { toast } = useToast();

  const handleExportLists = () => {
    if (!isLoaded) {
      toast({
        title: "Exportation impossible",
        description: "Les listes ne sont pas encore chargées.",
        variant: "destructive",
      });
      return;
    }

    const dataToExport = {
      toWatchList,
      watchedList,
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'cinecollection_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);

    toast({
      title: "Exportation réussie",
      description: "Vos listes ont été exportées au format JSON.",
    });
  };

  const handleImportLists = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner un fichier JSON à importer.",
        variant: "destructive",
      });
      return;
    }

    if (file.type !== 'application/json') {
        toast({
          title: "Type de fichier invalide",
          description: "Veuillez sélectionner un fichier JSON (.json).",
          variant: "destructive",
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);

        if (Array.isArray(importedData.toWatchList) && Array.isArray(importedData.watchedList)) {
          // Basic validation for media items structure (can be more thorough)
          const isValidMediaArray = (arr: any[]): arr is Media[] => 
            arr.every(item => typeof item.id === 'string' && typeof item.title === 'string' && (item.mediaType === 'movie' || item.mediaType === 'tv'));

          if (isValidMediaArray(importedData.toWatchList) && isValidMediaArray(importedData.watchedList)) {
            setLists(importedData.toWatchList, importedData.watchedList);
            toast({
              title: "Importation réussie",
              description: "Vos listes ont été importées avec succès.",
            });
          } else {
            throw new Error("Le fichier JSON importé ne contient pas de données de listes valides.");
          }
        } else {
          throw new Error("Le fichier JSON importé n'a pas la structure attendue (toWatchList et watchedList).");
        }
      } catch (error) {
        console.error("Erreur lors de l'importation :", error);
        toast({
          title: "Erreur d'importation",
          description: error instanceof Error ? error.message : "Un problème est survenu lors de la lecture du fichier. Assurez-vous qu'il s'agit d'un fichier JSON valide exporté depuis CinéCollection.",
          variant: "destructive",
        });
      } finally {
        // Reset file input value to allow re-importing the same file if needed
        event.target.value = '';
      }
    };
    reader.onerror = () => {
        toast({
            title: "Erreur de lecture du fichier",
            description: "Impossible de lire le fichier sélectionné.",
            variant: "destructive",
        });
        event.target.value = '';
    }
    reader.readAsText(file);
  };


  const renderList = (list: Media[], listType: 'toWatch' | 'watched') => {
    if (!isLoaded) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
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
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl shadow-sm border border-border">
          <ListX className="w-20 h-20 text-muted-foreground mb-6" />
          <p className="text-2xl font-semibold text-foreground mb-2">Votre liste est vide.</p>
          <p className="text-md text-muted-foreground">
            {listType === 'toWatch' ? "Ajoutez des films ou séries que vous voulez regarder !" : "Marquez des éléments comme vus pour les voir ici."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
        {list.map((media) => (
          <MediaCard
            key={`${media.id}-${media.mediaType}`} // Ensure unique key if IDs can repeat across types (though unlikely with TMDB IDs)
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
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Mes Listes</h1>
        <Card className="shadow-md rounded-xl w-full sm:w-auto">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <FileJson className="h-5 w-5 text-primary"/>Gestion des données
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-col sm:flex-row gap-3">
            <Button onClick={handleExportLists} variant="outline" className="w-full sm:w-auto" disabled={!isLoaded}>
              <Download className="mr-2 h-4 w-4" /> Exporter mes listes
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto" disabled={!isLoaded}>
              <label htmlFor="import-file-input" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" /> Importer des listes
                <input
                  id="import-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleImportLists}
                  className="sr-only"
                  disabled={!isLoaded}
                />
              </label>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Alert variant="default" className="bg-accent/20 border-accent/50 text-accent-foreground [&>svg]:text-accent">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="font-semibold">Fonctionnalité d'import/export</AlertTitle>
        <AlertDescription>
          Vous pouvez exporter vos listes actuelles "À Regarder" et "Vus" dans un fichier JSON. Ce fichier peut ensuite être réimporté pour restaurer vos listes. L'importation remplacera les listes existantes.
        </AlertDescription>
      </Alert>

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
