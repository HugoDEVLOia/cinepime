'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Send, Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMovieRecommendation, type MovieRecommendationInput, type MovieRecommendationOutput } from '@/ai/flows/movie-recommendation-flow';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-bot-message',
      sender: 'bot',
      text: 'Bonjour ! Je suis CinéConseiller. Demandez-moi une recommandation de film ou série ! Par exemple: "un film de science-fiction récent" ou "une série comique légère".',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };
  
  // Auto scroll when sheet opens and new messages arrive
  useEffect(() => {
    if (isOpen) {
      // A small delay helps ensure the DOM is updated before scrolling
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const input: MovieRecommendationInput = { userQuery: userMessage.text };
      const response: MovieRecommendationOutput = await getMovieRecommendation(input);
      
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '-bot',
        sender: 'bot',
        text: response.recommendationText,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error getting movie recommendation:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        sender: 'bot',
        text: 'Désolé, une erreur est survenue lors de la récupération de la recommandation. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
              CinéConseiller
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 space-y-6 bg-muted/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-start gap-3 w-full', // Changed to items-start for better avatar alignment
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.sender === 'bot' && (
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl px-4 py-3 shadow-md break-words',
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-lg' // Adjusted rounding
                      : 'bg-card text-card-foreground rounded-bl-lg border border-border' // Adjusted rounding
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                   <p className={cn("text-xs mt-2 opacity-70", msg.sender === 'user' ? 'text-right' : 'text-left')}>
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {msg.sender === 'user' && (
                  <Avatar className="h-9 w-9 shrink-0">
                     <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start justify-start gap-3"> {/* Changed to items-start */}
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

          <SheetFooter className="p-4 border-t border-border bg-background sticky bottom-0 z-10">
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
              <Input
                type="text"
                placeholder="Votre message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow h-12 text-sm rounded-lg focus:ring-primary focus:ring-2 transition-shadow shadow-sm"
                disabled={isLoading}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
                  }
                }}
              />
              <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-lg shadow-sm hover:bg-primary/90 transition-colors" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="sr-only">Envoyer</span>
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
