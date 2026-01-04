
'use client';

import type { FormEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Send, Bot, User, Loader2, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getPopularMedia } from '@/services/tmdb';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

// --- Types de données ---

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: React.ReactNode;
  timestamp: Date;
}

type QuizState = 'initial' | 'type' | 'genre' | 'decade' | 'popularity' | 'rating' | 'results' | 'finished';

interface QuizAnswers {
  mediaType: 'movie' | 'tv' | null;
  genre: { id: number; name: string } | null;
  decade: string | null;
  popularity: 'popular' | 'niche' | null;
  rating: number | null;
}

interface QuizOption {
    value: string;
    label: string;
}

// --- Contenu du Quiz ---

const GENRES = [
    { id: 28, name: "Action" }, { id: 12, name: "Aventure" }, { id: 16, name: "Animation" }, 
    { id: 35, name: "Comédie" }, { id: 80, name: "Crime" }, { id: 99, name: "Documentaire" }, 
    { id: 18, name: "Drame" }, { id: 10751, name: "Famille" }, { id: 14, name: "Fantastique" }, 
    { id: 36, name: "Histoire" }, { id: 27, name: "Horreur" }, { id: 10402, name: "Musique" }, 
    { id: 9648, name: "Mystère" }, { id: 10749, name: "Romance" }, { id: 878, name: "Science-Fiction" }, 
    { id: 10770, name: "Téléfilm" }, { id: 53, name: "Thriller" }, { id: 10752, name: "Guerre" }, 
    { id: 37, name: "Western" }
];

const DECADES = ["2020", "2010", "2000", "1990", "1980", "1970"];

const RATINGS = ["8", "7", "6", "5", "Peu importe"];

const QUIZ_QUESTIONS: Record<Exclude<QuizState, 'initial' | 'results' | 'finished'>, { question: string; options: QuizOption[] }> = {
  type: {
    question: "Salut ! 👋 Je suis Popito, votre guide personnel pour trouver la perle rare.\n\nCommençons : cherchez-vous un **Film** ou une **Série** ?",
    options: [{ value: 'movie', label: 'Film' }, { value: 'tv', label: 'Série' }]
  },
  genre: {
    question: "Super ! Quel genre vous tente le plus ? Voici quelques options :",
    options: GENRES.map(g => ({ value: g.name, label: g.name }))
  },
  decade: {
    question: "Noté ! Dans quelle décennie devrions-nous chercher ?",
    options: DECADES.map(d => ({ value: d, label: `Années ${d}`})),
  },
  popularity: {
    question: "Préférez-vous un grand succès populaire ou une pépite plus confidentielle ?",
    options: [
        { value: 'popular', label: 'Populaire' },
        { value: 'niche', label: 'Pépite méconnue' }
    ]
  },
  rating: {
    question: "Quelle note minimale (sur 10) des spectateurs attendez-vous ?",
    options: RATINGS.map(r => ({ value: r, label: r === "Peu importe" ? r : `${r}/10 et plus` }))
  }
};


export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>('initial');
  const [answers, setAnswers] = useState<QuizAnswers>({ mediaType: null, genre: null, decade: null, popularity: null, rating: null });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // --- Fonctions utilitaires ---
  const addMessage = (role: 'user' | 'model', content: React.ReactNode) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${role}-${Math.random()}`,
      role,
      content,
      timestamp: new Date()
    }]);
  };
  
  const scrollToBottom = () => {
     if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
          setTimeout(() => {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
          }, 50);
        }
      }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);
  
  const createOptionButtons = (options: QuizOption[], onSelect: (value: string, label: string) => void) => (
      <div className="flex flex-wrap gap-2 mt-3">
          {options.map(option => (
              <Button key={option.value} variant="outline" size="sm" onClick={() => onSelect(option.value, option.label)} className="text-xs h-auto py-1.5 px-3" disabled={isLoading}>
                  {option.label}
              </Button>
          ))}
      </div>
  );

  // --- Logique du Quiz ---
   const startQuiz = () => {
    setMessages([]);
    setAnswers({ mediaType: null, genre: null, decade: null, popularity: null, rating: null });
    setQuizState('type');
  };
  
  useEffect(() => {
    if (isOpen && quizState === 'initial') {
        startQuiz();
    }
  }, [isOpen, quizState]);

  useEffect(() => {
    if (!isOpen || isLoading) return;

    const currentQuestionKey = quizState as keyof typeof QUIZ_QUESTIONS;
    const lastMessage = messages[messages.length - 1];
    
    // Only ask a question if the state requires it and if the last message was from the user or if it's the first message.
    if (QUIZ_QUESTIONS[currentQuestionKey] && (messages.length === 0 || (lastMessage && lastMessage.role === 'user'))) {
        const questionData = QUIZ_QUESTIONS[currentQuestionKey];
        addMessage('model', 
            <div>
                <p className="whitespace-pre-wrap">{questionData.question}</p>
                {createOptionButtons(questionData.options, (value, label) => handleAnswer(value, label))}
            </div>
        );
    } else if (quizState === 'results' && lastMessage && lastMessage.role === 'user') {
        setIsLoading(true);
        findResults(answers);
    }
  }, [quizState, isOpen, messages, isLoading, answers]);


  const handleAnswer = (value: string, label: string) => {
    if (isLoading) return;
    addMessage('user', label);
    setIsLoading(true);

    let nextState: QuizState = quizState;
    const newAnswers = { ...answers };

    switch (quizState) {
        case 'type':
            newAnswers.mediaType = value as 'movie' | 'tv';
            nextState = 'genre';
            break;
        case 'genre':
            newAnswers.genre = GENRES.find(g => g.name === value) || null;
            nextState = 'decade';
            break;
        case 'decade':
            newAnswers.decade = value;
            nextState = 'popularity';
            break;
        case 'popularity':
            newAnswers.popularity = value as 'popular' | 'niche';
            nextState = 'rating';
            break;
        case 'rating':
            newAnswers.rating = value === "Peu importe" ? 0 : parseInt(value);
            nextState = 'results';
            break;
    }
    
    setAnswers(newAnswers);
    
    setTimeout(() => {
      setQuizState(nextState);
      setIsLoading(false);
    }, 500);
  };


  const findResults = async (finalAnswers: QuizAnswers) => {
      addMessage('model', 
        <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Excellent choix ! Je cherche...
        </div>
      );
      
      try {
        const randomPage = Math.floor(Math.random() * 20) + 1; // Pick a random page from 1 to 20 for more diversity
        const results = await getPopularMedia(
            finalAnswers.mediaType!, 
            randomPage,
            undefined, 
            finalAnswers.genre?.id, 
            finalAnswers.decade ? parseInt(finalAnswers.decade) : undefined,
            finalAnswers.popularity ?? undefined,
            finalAnswers.rating ?? undefined,
        );

        if (results.media.length >= 3) {
            const top3 = results.media.slice(0, 3);
            const resultMessage = (
                <div className="space-y-4">
                    <p>Voici mon top 3 pour vous :</p>
                    <div className="space-y-3">
                        {top3.map((media, index) => (
                           <Link key={media.id} href={`/media/${media.mediaType}/${media.id}`} className="block" onClick={() => setIsOpen(false)}>
                             <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
                                <CardContent className="p-3 flex gap-3 items-start">
                                   <div className="w-16 shrink-0">
                                        <Image src={media.posterUrl} alt={media.title} width={64} height={96} className="rounded-md" />
                                   </div>
                                   <div className="space-y-1">
                                        <p className="font-bold text-sm leading-tight text-foreground">{index + 1}. {media.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-3">{media.description}</p>
                                   </div>
                                </CardContent>
                             </Card>
                           </Link>
                        ))}
                    </div>
                     <p className="mt-4">J'espère que cela vous plaît !</p>
                </div>
            );
            addMessage('model', resultMessage);
        } else {
            addMessage('model', "Oups, je n'ai pas trouvé assez de résultats avec ces critères. Relançons une recherche !");
            // Automatically restart if no results
            setTimeout(startQuiz, 2000);
        }

    } catch (error) {
        console.error("Erreur lors de la recherche TMDB:", error);
        addMessage('model', "Désolé, une erreur s'est produite lors de la recherche. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
      setQuizState('finished');
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };


  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 flex items-center justify-center group hover:scale-105 transition-transform"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le chatbot Popito"
      >
        <Image src="/icon/mascotte.svg" alt="Popito" width={32} height={32} className="transition-transform group-hover:rotate-[5deg]" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 bg-background shadow-2xl" side="right">
          <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
            <SheetTitle className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
              <Image src="/icon/mascotte.svg" alt="Popito" width={24} height={24}/>
              Popito
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 space-y-6 bg-muted/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-start gap-3 w-full',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'model' && (
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src="/icon/mascotte.svg" alt="Popito" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-xl px-4 py-3 shadow-md break-words',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-lg'
                      : 'bg-card text-card-foreground rounded-bl-lg border border-border'
                  )}
                >
                    <div className="text-sm leading-relaxed">{msg.content}</div>
                   <p className={cn("text-xs mt-2 opacity-70", msg.role === 'user' ? 'text-right' : 'text-left')}>
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {msg.role === 'user' && (
                  <Avatar className="h-9 w-9 shrink-0">
                     <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && quizState !== 'results' && (
              <div className="flex items-start justify-start gap-3">
                 <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src="/icon/mascotte.svg" alt="Popito" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                <div className="bg-card text-card-foreground rounded-xl rounded-bl-lg px-4 py-3 shadow-md border border-border">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </ScrollArea>
           
          <SheetFooter className="p-4 border-t border-border bg-background sticky bottom-0 z-10">
            {quizState === 'finished' ? (
                <Button onClick={startQuiz} className="w-full h-12 text-base">
                    <ThumbsUp className="mr-2 h-5 w-5" /> Recommencer un nouveau quiz
                </Button>
            ) : (
                <form onSubmit={handleFormSubmit} className="flex w-full items-center gap-3">
                   <Input
                        type="text"
                        placeholder="Cliquez sur une option ci-dessus..."
                        className="flex-grow h-12 text-sm rounded-lg"
                        disabled={true}
                    />
                </form>
            )}
            </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
