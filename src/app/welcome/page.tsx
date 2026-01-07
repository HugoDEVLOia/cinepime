
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-provider';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMediaLists, type Media } from '@/hooks/use-media-lists';
import { cn } from '@/lib/utils';
import { User, LogIn, Key, Users, Film, Check, Loader2 } from 'lucide-react';

const netflixAvatars = [
    "/assets/avatars/Netflix/1.png",
    "/assets/avatars/Netflix/2.png",
    "/assets/avatars/Netflix/3.png",
    "/assets/avatars/Netflix/4.png",
    "/assets/avatars/Netflix/5.png",
    "/assets/avatars/Netflix/6.png"
];
const disneyAvatars = [
    "/assets/avatars/Disney+/1.png",
    "/assets/avatars/Disney+/2.png",
    "/assets/avatars/Disney+/3.png",
    "/assets/avatars/Disney+/4.png",
    "/assets/avatars/Disney+/5.png",
    "/assets/avatars/Disney+/6.png"
];


export default function WelcomePage() {
    const [username, setUsername] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(netflixAvatars[0]);
    const [importCode, setImportCode] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const { setUsernameAndAvatar, markOnboardingAsComplete } = useUser();
    const { setLists } = useMediaLists();
    const { toast } = useToast();
    const router = useRouter();

    const handleCreateProfile = () => {
        if (!username.trim()) {
            toast({ title: 'Pseudo requis', description: 'Veuillez choisir un pseudo.', variant: 'destructive' });
            return;
        }
        if (!selectedAvatar) {
            toast({ title: 'Avatar requis', description: 'Veuillez choisir un avatar.', variant: 'destructive' });
            return;
        }
        setUsernameAndAvatar(username, selectedAvatar);
        markOnboardingAsComplete();
        router.push('/');
    };
    
    const handleImportFromCode = () => {
        if (!importCode.trim()) {
          toast({ title: "Aucun code à importer", description: "Veuillez coller votre code.", variant: "destructive" });
          return;
        }
        setIsImporting(true);
        try {
          const jsonString = decodeURIComponent(escape(atob(importCode.trim())));
          const importedData = JSON.parse(jsonString);

          if (importedData.username && importedData.avatar && Array.isArray(importedData.toWatchList) && Array.isArray(importedData.watchedList)) {
            const isValidMediaArray = (arr: any[]): arr is Media[] => arr.every(item => typeof item.id === 'string' && typeof item.title === 'string' && (item.mediaType === 'movie' || item.mediaType === 'tv'));
            if (isValidMediaArray(importedData.toWatchList) && isValidMediaArray(importedData.watchedList)) {
              setLists(importedData.toWatchList, importedData.watchedList);
              setUsernameAndAvatar(importedData.username, importedData.avatar);
              markOnboardingAsComplete();
              router.push('/');
            } else { throw new Error("Données de listes invalides."); }
          } else { throw new Error("La structure du code est incorrecte."); }
        } catch (error: any) {
          toast({ title: "Erreur d'importation", description: "Le code est invalide ou corrompu.", variant: "destructive" });
        } finally {
          setIsImporting(false);
        }
    };


    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 flex flex-col items-center justify-center text-center bg-primary rounded-t-lg md:rounded-tr-none md:rounded-l-lg">
                        <Image src="/assets/mascotte/mascotte.svg" alt="Popito Mascotte" width={120} height={120} className="mb-4" />
                        <h1 className="text-3xl font-bold text-primary-foreground">Bienvenue !</h1>
                        <p className="text-primary-foreground/80 mt-2">Votre nouvelle aventure cinéma commence ici.</p>
                    </div>

                    <div className="p-8">
                        <Tabs defaultValue="create">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="create"><User className="mr-2 h-4 w-4" /> Créer un profil</TabsTrigger>
                                <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4" /> Se connecter</TabsTrigger>
                            </TabsList>
                            <TabsContent value="create" className="mt-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-base font-semibold">Choisissez un pseudo</Label>
                                    <Input id="username" placeholder="Ex: PopcornLover" value={username} onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">Choisissez un avatar</Label>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Netflix</p>
                                        <div className="grid grid-cols-6 gap-2">
                                            {netflixAvatars.map(src => (
                                                <button key={src} onClick={() => setSelectedAvatar(src)} className={cn("rounded-full overflow-hidden border-2 transition-all", selectedAvatar === src ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary/50')}>
                                                    <Image src={src} alt={`Avatar ${src}`} width={64} height={64} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                     <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Disney+</p>
                                        <div className="grid grid-cols-6 gap-2">
                                            {disneyAvatars.map(src => (
                                                <button key={src} onClick={() => setSelectedAvatar(src)} className={cn("rounded-full overflow-hidden border-2 transition-all", selectedAvatar === src ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary/50')}>
                                                    <Image src={src} alt={`Avatar ${src}`} width={64} height={64} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleCreateProfile} className="w-full text-lg py-6">Commencer</Button>
                            </TabsContent>
                            <TabsContent value="login" className="mt-6 space-y-4">
                                <CardHeader className="p-0 text-center mb-4">
                                    <CardTitle>Restaurer vos données</CardTitle>
                                    <CardDescription>Collez votre code de sauvegarde pour retrouver votre profil et vos listes.</CardDescription>
                                </CardHeader>
                                <div className="space-y-2">
                                    <Label htmlFor="import-code" className="font-semibold">Code de sauvegarde</Label>
                                    <Textarea id="import-code" placeholder="Collez votre code ici..." value={importCode} onChange={(e) => setImportCode(e.target.value)} className="min-h-[120px] font-mono text-xs" />
                                </div>
                                <Button onClick={handleImportFromCode} className="w-full text-lg py-6" disabled={isImporting}>
                                    {isImporting ? <Loader2 className="animate-spin mr-2"/> : <LogIn className="mr-2"/>} Se Connecter
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </Card>
        </div>
    );
}
