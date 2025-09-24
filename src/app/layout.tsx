
'use client'; 

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { Film, Clapperboard, Search, Tv, BarChart3, Menu, SettingsIcon, X, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/search-bar';
import Chatbot from '@/components/chatbot';
import { Sheet, SheetContent, SheetClose, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ThemeProvider } from '@/contexts/theme-provider';
import { useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <html lang="fr" className="scrollbar-thin" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="CinéCollection" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CinéCollection" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />
        
        {/* === GOOGLE SITE VERIFICATION (REMPLACEZ PAR VOTRE CODE) === */}
        <meta name="google-site-verification" content="VOTRE_CODE_DE_VERIFICATION_GOOGLE" />

        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />


        <title>CinéCollection</title>
        <meta name="description" content="Suivez les films et séries que vous regardez, voulez regarder, et obtenez des statistiques personnalisées." />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          defaultTheme="dark"
          storageKey="cinecollection-ui-theme"
        >
          <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
            <div className="container flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
              {isSearchActive ? (
                <div className="flex items-center w-full gap-2">
                  <div className="flex-grow">
                    <SearchBar />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsSearchActive(false)} aria-label="Fermer la recherche">
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/" className="flex items-center gap-2 group mr-auto">
                    <Clapperboard className="h-8 w-8 text-primary transition-transform group-hover:rotate-[-10deg]" />
                    <span className="text-2xl font-bold text-primary tracking-tight">CinéCollection</span>
                  </Link>

                  <div className="hidden md:flex items-center gap-1">
                    <nav className="flex items-center gap-1">
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
                      <Link href="/stats" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <Button variant="ghost" className="gap-2 px-4 py-2">
                            <BarChart3 className="h-4 w-4" /> Statistiques
                        </Button>
                      </Link>
                      <Link href="/games" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <Button variant="ghost" className="gap-2 px-4 py-2">
                            <Gamepad2 className="h-4 w-4" /> Jeux
                        </Button>
                      </Link>
                      <Link href="/settings" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <Button variant="ghost" className="gap-2 px-4 py-2">
                            <SettingsIcon className="h-4 w-4" /> Paramètres
                        </Button>
                      </Link>
                    </nav>
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchActive(true)} className="ml-3" aria-label="Ouvrir la recherche">
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="md:hidden flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchActive(true)} aria-label="Ouvrir la recherche">
                      <Search className="h-6 w-6" />
                    </Button>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Menu className="h-6 w-6" />
                          <span className="sr-only">Ouvrir le menu</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full max-w-xs p-0 bg-background text-foreground">
                        <SheetHeader className="p-4 border-b border-border">
                          <SheetTitle className="text-lg font-semibold text-primary">Menu</SheetTitle>
                        </SheetHeader>
                        <div className="p-4 space-y-4">
                          <div className="mb-4">
                            <SearchBar />
                          </div>
                          <nav className="flex flex-col space-y-1">
                            <SheetClose asChild>
                              <Link href="/">
                                <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2.5 text-base">
                                  <Film className="h-5 w-5 text-muted-foreground" /> Tendances
                                </Button>
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link href="/my-lists">
                                <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2.5 text-base">
                                  <Tv className="h-5 w-5 text-muted-foreground" /> Mes Listes
                                </Button>
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link href="/stats">
                                <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2.5 text-base">
                                  <BarChart3 className="h-5 w-5 text-muted-foreground" /> Statistiques
                                </Button>
                              </Link>
                            </SheetClose>
                             <SheetClose asChild>
                              <Link href="/games">
                                <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2.5 text-base">
                                  <Gamepad2 className="h-5 w-5 text-muted-foreground" /> Jeux
                                </Button>
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link href="/settings">
                                <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2.5 text-base">
                                  <SettingsIcon className="h-5 w-5 text-muted-foreground" /> Paramètres
                                </Button>
                              </Link>
                            </SheetClose>
                          </nav>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </>
              )}
            </div>
          </header>
          <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 md:py-12">
            {children}
          </main>
          <footer className="border-t border-border/60 bg-transparent py-8">
            <div className="container px-4 text-center text-sm text-muted-foreground md:px-6">
              CinéCollection - HugoDEVLO - 2025
            </div>
          </footer>
          <Toaster />
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
