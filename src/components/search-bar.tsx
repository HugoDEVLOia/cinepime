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
      // setQuery(''); // Decided against clearing to allow users to refine search
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full group">
      <Input
        type="search"
        placeholder="Rechercher films, séries..."
        value={query}
        onChange={handleChange}
        className="pr-12 h-11 text-sm border-border focus:border-primary transition-colors duration-300"
        aria-label="Rechercher des films ou des séries"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Lancer la recherche"
      >
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );
}
