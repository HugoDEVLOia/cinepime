'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery(''); // Optionally clear after search
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Input
        type="search"
        placeholder="Rechercher films ou séries..."
        value={query}
        onChange={handleChange}
        className="pr-10 h-10 text-sm"
        aria-label="Rechercher des films ou des séries"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
        aria-label="Lancer la recherche"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
