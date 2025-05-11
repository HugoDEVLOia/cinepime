
'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useMediaLists, type Media } from '@/hooks/use-media-lists';
import MediaCard from '@/components/media-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, CheckCircle, ListX, Copy, ClipboardPaste, Code2, AlertTriangle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

export default function MyListsPage() {
  const { toWatchList, watchedList, addToList, removeFromList, isInList, isLoaded, setLists } = useMediaLists();
  const { toast } = useToast();

  const [exportedCode, setExportedCode] = useState<string | null>(null);
  const [importCode, setImportCode] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleGenerateExportCode = () => {
    if (!isLoaded) {
      toast({
        title: "Exportation impossible",
        description: "Les listes ne sont pas encore chargées.",
        variant: "destructive",
      });
      return;
    }
    setIsExporting(true);
    setExportedCode(null); // Clear previous code

    try {
      const dataToExport = {
        toWatchList,
        watchedList,
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const base64String = btoa(jsonString); // Encode to Base64
      setExportedCode(base64String);
      toast({
        title: "Code d'exportation généré",
        description: "Copiez le code ci-dessous pour sauvegarder vos listes.",
      });
    } catch (error) {
      console.error("Erreur lors de la génération du code d'exportation:", error);
      toast({
        title: "Erreur d'exportation",
        description: "Un problème est survenu lors de la génération du code.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!exportedCode) {
      toast({
        title: "Aucun code à copier",
        description: "Veuillez d'abord générer le code d'exportation.",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(exportedCode)
      .then(() => {
        toast({
          title: "Code copié !",
          description: "Le code d'exportation a été copié dans le presse-papiers.",
        });
      })
      .catch(err => {
        console.error("Erreur lors de la copie du code:", err);
        toast({
          title: "Erreur de copie",
          description: "Impossible de copier le code automatiquement. Veuillez le copier manuellement.",
          variant: "destructive",
        });
      });
  };

  const handleImportFromCode = () => {
    if (!importCode.trim()) {
      toast({
        title: "Aucun code à importer",
        description: "Veuillez coller votre code d'importation dans la zone de texte.",
        variant: "destructive",
      });
      return;
    }
    setIsImporting(true);

    try {
      const jsonString = atob(importCode.trim()); // Decode from Base64
      const importedData = JSON.parse(jsonString);

      if (Array.isArray(importedData.toWatchList) && Array.isArray(importedData.watchedList)) {
        const isValidMediaArray = (arr: any[]): arr is Media[] => 
          arr.every(item => typeof item.id === 'string' && typeof item.title === 'string' && (item.mediaType === 'movie' || item.mediaType === 'tv'));

        if (isValidMediaArray(importedData.toWatchList) && isValidMediaArray(importedData.watchedList)) {
          setLists(importedData.toWatchList, importedData.watchedList);
          toast({
            title: "Importation réussie",
            description: "Vos listes ont été importées avec succès.",
          });
          setImportCode(''); // Clear input after successful import
          setExportedCode(null); // Clear any previously generated export code
        } else {
          throw new Error("Le code importé ne contient pas de données de listes valides.");
        }
      } else {
        throw new Error("Le code importé n'a pas la structure attendue (toWatchList et watchedList).");
      }
    } catch (error) {
      console.error("Erreur lors de l'importation depuis le code :", error);
      let errorMessage = "Un problème est survenu lors du traitement du code. Assurez-vous qu'il s'agit d'un code valide exporté depuis CinéCollection.";
      if (error instanceof Error) {
        if (error.message.includes("not correctly encoded") || error.name === "InvalidCharacterError") {
            errorMessage = "Le code fourni n'est pas un code Base64 valide.";
        } else if (error instanceof SyntaxError) {
            errorMessage = "Le code décodé n'est pas un JSON valide.";
        } else {
            errorMessage = error.message;
        }
      }
      toast({
        title: "Erreur d'importation",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
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
            key={`${media.id}-${media.mediaType}`}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Mes Listes</h1>
      </div>
      
      <Alert variant="default" className="bg-accent/20 border-accent/50 text-accent-foreground [&>svg]:text-accent">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="font-semibold">Gestion des données par code</AlertTitle>
        <AlertDescription>
          Vous pouvez générer un code unique (format Base64) pour sauvegarder vos listes "À Regarder" et "Vus".
          Collez ce code ultérieurement pour restaurer vos listes. L'importation remplacera les listes existantes.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <Code2 className="h-6 w-6 text-primary"/>Gérer mes données
          </CardTitle>
          <CardDescription>
            Exportez vos listes sous forme de code ou importez un code pour restaurer vos données.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button onClick={handleGenerateExportCode} variant="default" className="w-full sm:w-auto" disabled={!isLoaded || isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
              Générer le code d'exportation
            </Button>
            {exportedCode && (
              <div className="mt-4 space-y-2">
                <Textarea
                  readOnly
                  value={exportedCode}
                  className="h-32 resize-none bg-muted/50 font-mono text-xs"
                  aria-label="Code d'exportation généré"
                />
                <Button onClick={handleCopyToClipboard} variant="outline" size="sm" className="w-full sm:w-auto">
                  <Copy className="mr-2 h-4 w-4" /> Copier le code
                </Button>
              </div>
            )}
          </div>
          
          <hr className="border-border"/>

          <div>
            <h3 className="text-lg font-medium mb-2 text-foreground">Importer depuis un code</h3>
            <Textarea
              placeholder="Collez votre code d'exportation ici..."
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              className="h-32 resize-none font-mono text-xs mb-3"
              aria-label="Zone de texte pour coller le code d'importation"
              disabled={isImporting}
            />
            <Button onClick={handleImportFromCode} variant="default" className="w-full sm:w-auto" disabled={!isLoaded || isImporting || !importCode.trim()}>
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardPaste className="mr-2 h-4 w-4" />}
              Importer depuis le code
            </Button>
          </div>
        </CardContent>
      </Card>


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

