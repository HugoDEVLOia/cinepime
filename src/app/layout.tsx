import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { Film, Clapperboard, Search, Tv, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/search-bar';

export const metadata: Metadata = {
  title: 'CinéCollection',
  description: 'Suivez les films et séries que vous regardez, voulez regarder, et obtenez des statistiques personnalisées.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scrollbar-thin">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased flex flex-col min-h-screen bg-background`}>
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md shadow-sm">
          <div className="container flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Clapperboard className="h-8 w-8 text-primary transition-transform group-hover:rotate-[-10deg]" />
              <span className="text-2xl font-bold text-primary tracking-tight">CinéCollection</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                <Button variant="ghost" className="gap-2 px-4 py-2">
                  <Film className="h-4 w-4" /> Tendances
                </Button>
              </Link>
              <Link href="/my-lists" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                <Button variant="ghost" className="gap-2 px-4 py-2">
                  <Tv className="h-4 w-4" /> Mes Listes
                </Button>
              </Link>
               {/* Placeholder for future stats page */}
              <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors opacity-60 cursor-not-allowed" aria-disabled="true" tabIndex={-1}>
                 <Button variant="ghost" className="gap-2 px-4 py-2" disabled>
                    <BarChart3 className="h-4 w-4" /> Statistiques
                 </Button>
              </Link>
            </nav>
            <div className="w-full max-w-xs md:max-w-sm">
              <SearchBar />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 md:py-12">
          {children}
        </main>
        <footer className="border-t border-border bg-card/50 py-8">
          <div className="container px-4 text-center text-sm text-muted-foreground md:px-6">
            © {new Date().getFullYear()} CinéCollection. Tous droits réservés. Conçu avec soin.
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
