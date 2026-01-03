
'use client';

import DiscoveryDeck from '@/components/discovery-deck';

export default function DiscoverPage() {
  return (
    <div className="fixed inset-0 top-[var(--header-height)] flex items-center justify-center bg-background">
      <DiscoveryDeck />
    </div>
  );
}
