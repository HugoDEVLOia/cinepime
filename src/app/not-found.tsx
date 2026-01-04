'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-250px)]">
      <div className="relative w-48 h-48 mb-8">
        <Image 
            src="/icon/mascotte_offside.svg" 
            alt="Mascotte Popito Hors-jeu" 
            fill
            className="object-contain"
        />
      </div>
      <h1 className="text-6xl font-extrabold text-primary tracking-tighter mb-4">404</h1>
      <h2 className="text-3xl font-bold text-foreground mb-3">Oups, vous êtes hors-jeu !</h2>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        La page que vous cherchez semble s'être égarée dans les coulisses du cinéma.
      </p>
      <Button asChild size="lg">
        <Link href="/">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retourner à l'accueil
        </Link>
      </Button>
    </div>
  );
}
