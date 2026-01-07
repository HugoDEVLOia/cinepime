
'use client'; 

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { Film, Clapperboard, Search, Tv, BarChart3, Menu, SettingsIcon, X, Gamepad2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/search-bar';
import Chatbot from '@/components/chatbot';
import { Sheet, SheetContent, SheetClose, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ThemeProvider } from '@/contexts/theme-provider';
import { UserProvider } from '@/contexts/user-provider';
import OnboardingDialog from '@/components/onboarding-dialog';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    document.documentElement.style.setProperty('--header-height', '80px');
  }, []);

  return (
    <html lang="fr" className="scrollbar-thin" suppressHydrationWarning>
      <head>
        <title>CinéPrime</title>
        <meta name="description" content="Explorez, collectionnez et analysez vos films et séries préférés. Suivez ce que vous avez vu et ce que vous voulez voir, le tout en un seul endroit." />
        <meta name="application-name" content="CinéPrime" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CinéPrime" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />
        
        <meta name="google-site-verification" content="hpSnb8QC163Oqt1-hTO2vUz9fqTOdFDlyH5C3JtKleI" />

        <link rel="apple-touch-icon" href="/assets/icon/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/assets/icon/favicon.svg" />
        <link rel="icon" href="/assets/icon/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          defaultTheme="dark"
          storageKey="cineprime-ui-theme"
        >
          <UserProvider>
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg" style={{ height: 'var(--header-height)' }}>
              <div className="container flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
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
                      <span className="text-2xl font-bold text-primary tracking-tight">CinéPrime</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                      <nav className="flex items-center gap-1">
                        <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          <Button variant="ghost" className="gap-2 px-4 py-2">
                            <Film className="h-4 w-4" /> Tendances
                          </Button>
                        </Link>
                         <Link href="/discover" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          <Button variant="ghost" className="gap-2 px-4 py-2">
                              <Compass className="h-4 w-4" /> Découverte
                          </Button>
                        </Link>
                        <Link href="/my-lists" className="text_sm font-medium text-foreground hover:text-primary transition-colors">
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
                      {isClient && (
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
                                <Link href="/discover">
                                  <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2.5 text-base">
                                    <Compass className="h-5 w-5 text-muted-foreground" /> Découverte
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
                      )}
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
                CinéPrime - HugoDEVLO - 2025
              </div>
            </footer>
            <Toaster />
            <Chatbot />
            <OnboardingDialog />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
