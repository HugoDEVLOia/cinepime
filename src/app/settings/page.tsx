
'use client';

import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMediaLists, type Media } from '@/hooks/use-media-lists';
import { useUser } from '@/contexts/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, AlertTriangle, Loader2, SettingsIcon, SunMoon, Heart, Coffee, LogOut, User as UserIcon, Save } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AvatarSelector, { encodeAvatarPath } from '@/components/avatar-selector';

export default function SettingsPage() {
  const { toWatchList, watchedList, setLists, isLoaded: listsAreLoaded } = useMediaLists();
  const { username, avatar, setUsernameAndAvatar, clearUserData, isLoaded: userIsLoaded } = useUser();
  const { toast } = useToast();

  const [exportedCode, setExportedCode] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // State for profile editing
  const [newUsername, setNewUsername] = useState(username || '');
  const [newAvatar, setNewAvatar] = useState(avatar || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userIsLoaded) {
      setNewUsername(username || '');
      setNewAvatar(avatar || '');
    }
  }, [username, avatar, userIsLoaded]);


  const handleGenerateExportCode = () => {
    if (!listsAreLoaded || !userIsLoaded) {
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
  
  const handleProfileUpdate = () => {
    if (!newUsername.trim()) {
      toast({ title: 'Pseudo requis', description: 'Veuillez choisir un pseudo.', variant: 'destructive' });
      return;
    }
    setUsernameAndAvatar(newUsername, newAvatar);
    setIsEditing(false);
    toast({ title: "Profil mis à jour !", description: "Votre pseudo et votre avatar ont été sauvegardés." });
  };
  
  const handleCancelEdit = () => {
    setNewUsername(username || '');
    setNewAvatar(avatar || '');
    setIsEditing(false);
  }

  const encodedAvatar = encodeAvatarPath(newAvatar);

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
        
        <TabsContent value="profile" className="mt-8 space-y-8">
            <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Gérer mon profil</CardTitle>
                    <CardDescription>Modifiez votre pseudo ou changez votre avatar ici.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-32 h-32">
                           {encodedAvatar && (
                            <Image 
                                src={encodedAvatar}
                                alt={newUsername || 'Avatar'}
                                fill
                                className="rounded-full object-cover border-4 border-primary"
                                key={newAvatar} // Force re-render on avatar change
                            />
                           )}
                        </div>
                        <h2 className="text-2xl font-bold">{newUsername || "Chargement..."}</h2>
                    </div>

                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="w-full">Modifier le profil</Button>
                    ) : (
                        <div className="space-y-6 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="font-semibold">Pseudo</Label>
                                <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                               <AvatarSelector currentAvatar={newAvatar} onSelectAvatar={setNewAvatar} />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button onClick={handleProfileUpdate} className="w-full"><Save className="mr-2 h-4 w-4" /> Enregistrer</Button>
                                <Button onClick={handleCancelEdit} variant="outline" className="w-full">Annuler</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
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
                  <Button onClick={handleGenerateExportCode} variant="default" className="w-full sm:w-auto" disabled={!listsAreLoaded || isExporting}>
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

            <Card className="max-w-2xl mx-auto shadow-lg rounded-xl border-destructive/50">
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
        
        <TabsContent value="settings" className="mt-6 space-y-8 max-w-2xl mx-auto">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
