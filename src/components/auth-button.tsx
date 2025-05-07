
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AuthButton() {
  const { user, signInWithGoogle, signOutUser, loading } = useAuth();

  if (loading) {
    return (
      <Button variant="ghost" disabled className="px-4 py-2">
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
      </Button>
    );
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User Avatar'} data-ai-hint="utilisateur avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle2 size={20}/>}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">
                {user.displayName || 'Utilisateur'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOutUser} className="cursor-pointer group">
            <LogOut className="mr-2 h-4 w-4 text-destructive group-hover:text-destructive" />
            <span className="text-destructive group-hover:text-destructive">Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="outline" onClick={signInWithGoogle} className="gap-2 px-4 py-2 ml-2 shadow-sm hover:bg-primary/5 hover:border-primary">
      <LogIn className="h-4 w-4" />
      Connexion
    </Button>
  );
}
