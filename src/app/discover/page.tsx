
'use client';

import DiscoveryDeck from '@/components/discovery-deck';

export default function DiscoverPage() {
  return (
    <div className="relative -m-4 sm:-m-6 lg:-m-8 -mt-8 md:-mt-12 flex flex-col items-center justify-center w-[100vw] h-[calc(100vh-80px)] md:h-[calc(100vh-80px)]">
      <DiscoveryDeck />
    </div>
  );
}
