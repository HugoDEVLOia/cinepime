
'use client';

import type { FormEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Send, Bot, User, Loader2, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { searchMedia, getPopularMedia } from '@/services/tmdb';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// --- Types de données ---

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string | React.ReactNode;
  timestamp: Date;
}

type QuizState = 'initial' | 'type' | 'genre' | 'decade' | 'results' | 'finished';

interface QuizAnswers {
  mediaType: 'movie' | 'tv' | null;
  genre: { id: number; name: string } | null;
  decade: string | null;
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

const QUIZ_QUESTIONS: Record<Exclude<QuizState, 'initial' | 'results' | 'finished'>, { question: string; options?: { value: string; label: string }[] }> = {
  type: {
    question: "Bonjour ! Je suis CinéConseiller. Je vais vous poser quelques questions pour trouver votre film ou série idéal(e).\n\nCommençons : cherchez-vous un **Film** ou une **Série** ?",
    options: [{ value: 'movie', label: 'Film' }, { value: 'tv', label: 'Série' }]
  },
  genre: {
    question: "Super ! Quel genre vous tente le plus ? Voici quelques options :",
    options: GENRES.map(g => ({ value: g.name, label: g.name }))
  },
  decade: {
    question: "Noté ! Dans quelle décennie devrions-nous chercher ?",
    options: DECADES.map(d => ({ value: d, label: `Années ${d}`}))
  }
};


export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>('initial');
  const [answers, setAnswers] = useState<QuizAnswers>({ mediaType: null, genre: null, decade: null });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // --- Fonctions utilitaires ---

  const addMessage = (role: 'user' | 'model', content: string | React.ReactNode) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + `-${role}`,
      role,
      content,
      timestamp: new Date()
    }]);
  };
  
  const scrollToBottom = () => {
     if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
          // Use setTimeout to ensure the DOM has updated before scrolling
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

  // --- Logique du Quiz ---

  const startQuiz = () => {
    setMessages([]);
    setAnswers({ mediaType: null, genre: null, decade: null });
    setQuizState('type');
    addMessage('model', QUIZ_QUESTIONS.type.question);
  };
  
  useEffect(() => {
    if (isOpen && quizState === 'initial') {
      startQuiz();
    }
  }, [isOpen, quizState]);


  const handleAnswer = async (answer: string) => {
    addMessage('user', answer);
    setIsLoading(true);

    let nextState: QuizState = quizState;
    const newAnswers = { ...answers };

    if (quizState === 'type') {
        const selectedType = QUIZ_QUESTIONS.type.options?.find(o => o.label.toLowerCase() === answer.toLowerCase());
        if (selectedType) {
            newAnswers.mediaType = selectedType.value as 'movie' | 'tv';
            nextState = 'genre';
            addMessage('model', QUIZ_QUESTIONS.genre.question);
        } else {
            addMessage('model', `Désolé, je n'ai pas compris. Veuillez choisir entre "Film" et "Série".`);
        }
    } else if (quizState === 'genre') {
        const selectedGenre = GENRES.find(g => g.name.toLowerCase() === answer.toLowerCase());
        if (selectedGenre) {
            newAnswers.genre = selectedGenre;
            nextState = 'decade';
            addMessage('model', QUIZ_QUESTIONS.decade.question);
        } else {
             addMessage('model', `Genre non valide. Veuillez choisir parmi les options proposées.`);
        }
    } else if (quizState === 'decade') {
        if (DECADES.some(d => answer.includes(d))) {
            newAnswers.decade = answer.replace(/\D/g, ''); // Garde seulement les chiffres
            nextState = 'results';
        } else {
             addMessage('model', `Décennie non valide. Veuillez choisir parmi les options proposées.`);
        }
    }
    
    setAnswers(newAnswers);
    setQuizState(nextState);

    if (nextState === 'results') {
        await findResults(newAnswers);
    }

    setIsLoading(false);
  };

  const findResults = async (finalAnswers: QuizAnswers) => {
      addMessage('model', "Excellent choix ! Je cherche les meilleures correspondances pour vous...");
      
      try {
        const results = await getPopularMedia(
            finalAnswers.mediaType!, 1, 'week', 
            finalAnswers.genre?.id, 
            finalAnswers.decade ? parseInt(finalAnswers.decade) : undefined
        );

        if (results.media.length >= 3) {
            const top3 = results.media.slice(0, 3);
            const resultMessage = (
                <div className="space-y-4">
                    <p>Voici mon top 3 pour vous :</p>
                    <div className="space-y-3">
                        {top3.map((media, index) => (
                           <Link key={media.id} href={`/media/${media.mediaType}/${media.id}`} target="_blank" rel="noopener noreferrer" className="block">
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
            addMessage('model', "Oups, je n'ai pas trouvé assez de résultats avec ces critères. Essayons avec des choix différents !");
        }

    } catch (error) {
        console.error("Erreur lors de la recherche TMDB:", error);
        addMessage('model', "Désolé, une erreur s'est produite lors de la recherche. Veuillez réessayer.");
    } finally {
      setQuizState('finished');
    }
  };


  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    if (quizState === 'finished') {
        startQuiz();
    } else {
        handleAnswer(inputValue.trim());
    }

    setInputValue('');
  };


  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 flex items-center justify-center group hover:scale-105 transition-transform"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le chatbot CinéConseiller"
      >
        <MessageSquareText className="h-8 w-8 transition-transform group-hover:rotate-[5deg]" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 bg-background shadow-2xl" side="right">
          <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
            <SheetTitle className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
              <Bot className="h-6 w-6 text-primary" />
              CinéConseiller (Quiz)
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
                    {typeof msg.content === 'string' ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                        <div className="text-sm leading-relaxed">{msg.content}</div>
                    )}
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
            {isLoading && (
              <div className="flex items-start justify-start gap-3">
                 <Avatar className="h-9 w-9 shrink-0">
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
           
          {quizState !== 'results' && (
            <SheetFooter className="p-4 border-t border-border bg-background sticky bottom-0 z-10">
                <form onSubmit={handleFormSubmit} className="flex w-full items-center gap-3">
                <Input
                    type="text"
                    placeholder={quizState === 'finished' ? "Écrire pour recommencer..." : "Votre réponse..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-grow h-12 text-sm rounded-lg focus:ring-primary focus:ring-2 transition-shadow shadow-sm"
                    disabled={isLoading}
                    autoFocus
                />
                <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-lg shadow-sm hover:bg-primary/90 transition-colors" disabled={isLoading || !inputValue.trim()}>
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Envoyer</span>
                </Button>
                </form>
            </SheetFooter>
           )}
           {quizState === 'finished' && (
            <SheetFooter className="p-4 border-t border-border bg-background sticky bottom-0 z-10">
                <Button onClick={startQuiz} className="w-full h-12 text-base">
                    <ThumbsUp className="mr-2 h-5 w-5" /> Recommencer un nouveau quiz
                </Button>
            </SheetFooter>
           )}
        </SheetContent>
      </Sheet>
    </>
  );
}

