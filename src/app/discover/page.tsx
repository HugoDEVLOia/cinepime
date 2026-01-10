'use client';

import VerticalDiscovery from '@/components/vertical-discovery';

export default function DiscoverPage() {
  return (
    <div className="fixed inset-0 top-[var(--header-height)] bg-black">
      <VerticalDiscovery />
    </div>
  );
}
