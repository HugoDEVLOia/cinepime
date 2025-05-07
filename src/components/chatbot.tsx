'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      // Allow a brief moment for the sheet and scroll area to render
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);
  
  // Auto scroll when sheet opens and new messages arrive
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
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
        text: 'Désolé, une erreur est survenue. Veuillez réessayer.',
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le chatbot CinéConseiller"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0" side="right">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-6 w-6 text-primary" />
              CinéConseiller
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 space-y-4 bg-muted/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-end gap-2.5 w-full',
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.sender === 'bot' && (
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={18} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-xl px-4 py-2.5 shadow-sm break-words',
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground rounded-bl-none border border-border'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                   <p className={cn("text-xs mt-1.5", msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left')}>
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8 self-start">
                     <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User size={18} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center justify-start gap-2.5">
                 <Avatar className="h-8 w-8 self-start">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={18} />
                    </AvatarFallback>
                  </Avatar>
                <div className="bg-card text-card-foreground rounded-xl rounded-bl-none px-4 py-3 shadow-sm border border-border">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </ScrollArea>

          <SheetFooter className="p-4 border-t border-border bg-background">
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
              <Input
                type="text"
                placeholder="Demandez une recommandation..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow h-11 text-sm"
                disabled={isLoading}
                autoFocus
              />
              <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={isLoading || !inputValue.trim()}>
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