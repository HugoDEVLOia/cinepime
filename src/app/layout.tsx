import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { Film, Clapperboard, Search, Tv, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchBar from '@/components/search-bar'; // Will create this component

const geistSans = GeistSans({
  variable: '--font-geist-sans',
});

const geistMono = GeistMono({
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'CinéCollection',
  description: 'Track movies and series you watch, want to watch, and get personalized stats.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Clapperboard className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">CinéCollection</span>
            </Link>
            <nav className="hidden items-center gap-4 md:flex">
              <Link href="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                <Button variant="ghost" className="gap-2">
                  <Film className="h-4 w-4" /> Trending
                </Button>
              </Link>
              <Link href="/my-lists" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                <Button variant="ghost" className="gap-2">
                  <Tv className="h-4 w-4" /> My Lists
                </Button>
              </Link>
               {/* Placeholder for future stats page */}
              <Link href="#" className="text-sm font-medium text-foreground hover:text-accent transition-colors opacity-50 cursor-not-allowed" aria-disabled="true" tabIndex={-1}>
                 <Button variant="ghost" className="gap-2" disabled>
                    <BarChart3 className="h-4 w-4" /> Stats
                 </Button>
              </Link>
            </nav>
            <div className="w-full max-w-xs">
              <SearchBar />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8 md:px-6 md:py-12">
          {children}
        </main>
        <footer className="border-t bg-card py-6">
          <div className="container px-4 text-center text-sm text-muted-foreground md:px-6">
            © {new Date().getFullYear()} CinéCollection. All rights reserved.
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
