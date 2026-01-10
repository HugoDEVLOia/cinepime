
'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { useMediaLists, type Media } from '@/hooks/use-media-lists';
import { useUser } from '@/contexts/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, AlertTriangle, Loader2, SettingsIcon, SunMoon, Heart, Coffee, LogOut, User as UserIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const { toWatchList, watchedList, setLists, isLoaded } = useMediaLists();
  const { username, avatar, clearUserData } = useUser();
  const { toast } = useToast();

  const [exportedCode, setExportedCode] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateExportCode = () => {
    if (!isLoaded || !username || !avatar) {
      toast({ title: "Exportation impossible", description: "Les données ne sont pas encore chargées.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    setExportedCode(null); 

    try {
      const dataToExport = { username, avatar, toWatchList, watchedList };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const base64String = btoa(unescape(encodeURIComponent(jsonString)));
      setExportedCode(base64String);
      toast({ title: "Code de sauvegarde généré", description: "Copiez ce code pour restaurer votre profil et vos listes." });
    } catch (error) {
      toast({ title: "Erreur d'exportation", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!exportedCode) return;
    navigator.clipboard.writeText(exportedCode).then(() => {
      toast({ title: "Code copié !", description: "Le code a été copié dans le presse-papiers." });
    }).catch(() => {
      toast({ title: "Erreur de copie", variant: "destructive" });
    });
  };

  const handleLogout = () => {
    clearUserData();
    toast({ title: "Déconnecté", description: "Vos données locales ont été effacées."});
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <UserIcon className="h-8 w-8 text-primary"/> Profil et Paramètres
        </h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="profile">
            <UserIcon className="mr-2 h-4 w-4"/> Profil
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="mr-2 h-4 w-4"/> Paramètres
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-8">
            <Card className="max-w-md mx-auto shadow-lg rounded-xl">
                <CardHeader className="items-center text-center">
                    {avatar && (
                        <div className="relative w-32 h-32 rounded-full border-4 border-primary shadow-lg">
                           <Image 
                             src={avatar.startsWith('http') ? avatar : avatar.startsWith('/') ? avatar : `/${avatar}`}
                             alt={username || 'Avatar'}
                             fill
                             className="rounded-full object-cover"
                           />
                        </div>
                    )}
                    <CardTitle className="text-3xl font-bold pt-4">{username || 'Utilisateur'}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                     <p className="text-muted-foreground">Voici votre espace personnel.</p>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6 space-y-8">
           <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                <Heart className="h-6 w-6 text-primary"/>Soutenir le projet
              </CardTitle>
              <CardDescription>
                CinéPrime est un projet personnel développé avec passion. Si vous appréciez l'application, vous pouvez soutenir son développement et aider à couvrir les frais avec un don. Chaque contribution, même la plus modeste, est grandement appréciée !
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700 text-white w-full sm:w-auto">
                  <a href="https://paypal.me/hugodevlo" target="_blank" rel="noopener noreferrer">
                    <Heart className="mr-2 h-5 w-5" /> Faire un don PayPal
                  </a>
                </Button>
                 <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black">
                    <a href="https://ko-fi.com/hugodevlo" target="_blank" rel="noopener noreferrer">
                        <Coffee className="mr-2 h-5 w-5" /> Soutenir sur Ko-fi
                    </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                <SunMoon className="h-6 w-6 text-primary"/>Thème de l'application
              </CardTitle>
              <CardDescription>
                Choisissez votre thème préféré pour l'interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSwitcher />
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                <Copy className="h-6 w-6 text-primary"/>Gérer mes données
              </CardTitle>
              <CardDescription>
                Exportez toutes vos données (profil et listes) sous forme d'un code de sauvegarde unique.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="default" className="bg-accent/20 border-accent/50 text-accent-foreground [&>svg]:text-accent">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-semibold">Important : Code de Sauvegarde</AlertTitle>
                <AlertDescription>
                  Ce code contient TOUTES vos données. Conservez-le précieusement pour vous connecter sur un autre appareil ou navigateur. N'utilisez la fonction d'importation que sur la page de bienvenue.
                </AlertDescription>
              </Alert>

              <div>
                <Button onClick={handleGenerateExportCode} variant="default" className="w-full sm:w-auto" disabled={!isLoaded || isExporting}>
                  {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                  Générer mon code de sauvegarde
                </Button>
                {exportedCode && (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      readOnly
                      value={exportedCode}
                      className="h-32 resize-none bg-muted/50 font-mono text-xs"
                      aria-label="Code de sauvegarde généré"
                    />
                    <Button onClick={handleCopyToClipboard} variant="outline" size="sm" className="w-full sm:w-auto">
                      <Copy className="mr-2 h-4 w-4" /> Copier le code
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-xl border-destructive/50">
              <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2 text-destructive">
                    <LogOut className="h-6 w-6"/> Zone de Danger
                  </CardTitle>
                  <CardDescription>
                    Cette action est irréversible. Elle supprimera toutes vos données locales (profil et listes) de ce navigateur.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive">Se déconnecter</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Cette action supprimera votre profil et toutes vos listes de ce navigateur. Assurez-vous d'avoir sauvegardé votre code si vous souhaitez les récupérer plus tard.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={handleLogout}>Oui, me déconnecter</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
