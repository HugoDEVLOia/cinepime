
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Send, Bot, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { movieQuizFlow, type MovieQuizInput } from '@/ai/flows/movie-recommendation-flow';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'model'; // Changed from 'sender' to 'role' to match Genkit schema
  content: string; // Changed from 'text' to 'content'
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message when the sheet opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsLoading(true);
      async function startConversation() {
        try {
          const initialInput: MovieQuizInput = { messages: [] }; // Start with no history
          const response = await movieQuizFlow(initialInput);
          const botMessage: ChatMessage = {
            id: 'initial-bot-message',
            role: 'model',
            content: response.response,
            timestamp: new Date(),
          };
          setMessages([botMessage]);
        } catch (error) {
          console.error('Error starting conversation:', error);
          const errorMessage: ChatMessage = {
            id: 'initial-error',
            role: 'model',
            content: 'Désolé, une erreur est survenue. Veuillez réessayer d\'ouvrir le chat.',
            timestamp: new Date(),
          };
          setMessages([errorMessage]);
        } finally {
          setIsLoading(false);
        }
      }
      startConversation();
    }
  }, [isOpen, messages.length]);


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
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
       // We only need role and content for the API call
      const apiMessages = newMessages.map(({ role, content }) => ({ role, content }));
      const input: MovieQuizInput = { messages: apiMessages };
      const response = await movieQuizFlow(input);
      
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '-bot',
        role: 'model',
        content: response.response,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error with movie quiz flow:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        role: 'model',
        content: 'Désolé, une erreur est survenue lors de la récupération de la recommandation. Veuillez réessayer.',
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
                    'max-w-[80%] rounded-xl px-4 py-3 shadow-md break-words',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-lg'
                      : 'bg-card text-card-foreground rounded-bl-lg border border-border'
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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

          <SheetFooter className="p-4 border-t border-border bg-background sticky bottom-0 z-10">
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
              <Input
                type="text"
                placeholder="Votre réponse..."
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
