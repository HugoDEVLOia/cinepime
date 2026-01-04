
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/user-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Download, Code, User as UserIcon } from 'lucide-react';

export default function OnboardingDialog() {
  const { isLoaded, hasCompletedOnboarding, username, setUsername, markOnboardingAsComplete } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isLoaded && !hasCompletedOnboarding && isClient) {
      setIsOpen(true);
    }
  }, [isLoaded, hasCompletedOnboarding, isClient]);

  useEffect(() => {
    setCurrentUsername(username || '');
  }, [username]);

  const handleFinish = () => {
    if (currentUsername.trim()) {
      setUsername(currentUsername.trim());
    }
    markOnboardingAsComplete();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleFinish()}>
      <DialogContent className="max-w-md p-0 overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-6 pb-0 text-center">
          <div className="mx-auto w-20 h-20 mb-4">
             <Image src="/icon/mascotte.svg" alt="Mascotte Popito" width={80} height={80} />
          </div>
          <DialogTitle className="text-2xl font-bold">Bienvenue sur CinéPrime !</DialogTitle>
          <DialogDescription>
            Ravi de vous rencontrer ! Configurons rapidement votre expérience.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2 font-semibold">
                <UserIcon className="h-4 w-4 text-primary" />
                Quel est votre nom ou pseudo ?
            </Label>
            <Input
              id="username"
              placeholder="Ex: Jean, cinéphile75..."
              value={currentUsername}
              onChange={(e) => setCurrentUsername(e.target.value)}
              className="h-10"
            />
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold text-base">
                <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary"/>
                    Sauvegarder et transférer vos données
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                <p>
                  Toutes vos listes sont sauvegardées dans votre navigateur. Pour les transférer vers un autre appareil ou les sauvegarder, rendez-vous dans les <strong>Paramètres</strong>.
                </p>
                <p>
                  Vous pourrez y générer un <strong>code d'exportation</strong> à copier-coller. Simple et sécurisé !
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-0">
              <AccordionTrigger className="font-semibold text-base">
                <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary"/>
                    Installer l'application (PWA)
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                <p>
                  Pour une expérience optimale, installez CinéPrime directement sur votre appareil.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Sur ordinateur :</strong> Cherchez l'icône d'installation (souvent un écran avec une flèche) dans la barre d'adresse de votre navigateur.</li>
                  <li><strong>Sur mobile :</strong> Utilisez l'option "Ajouter à l'écran d'accueil" depuis le menu de votre navigateur.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter className="p-6 bg-muted/30">
          <Button onClick={handleFinish} className="w-full">C'est parti !</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
