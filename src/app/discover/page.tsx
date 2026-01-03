
'use client';

import DiscoveryDeck from '@/components/discovery-deck';

export default function DiscoverPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[calc(100vh-250px)]">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-8 text-center">
            Mode Découverte
        </h1>
        <DiscoveryDeck />
    </div>
  );
}
