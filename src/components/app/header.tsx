"use client";

import { Wallet, BookCopy, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


export function Header() {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Success', description: 'You have been signed out.' });
      // The AuthProvider will handle redirecting to the login page
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Out Error',
        description: error.message,
      });
    }
  };
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4 py-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-4">
          <Wallet className="h-8 w-8" />
          <h1 className="text-2xl md:text-3xl font-headline font-bold tracking-tight">WageWise</h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/history" className="hidden md:flex items-center gap-2 text-sm font-medium hover:underline">
            <BookCopy className="h-5 w-5" />
            Shift History
          </Link>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/80">
                      <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.email || ''} />
                          <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                      </Avatar>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Hello!</p>
                          <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                          </p>
                      </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/history" className="flex items-center gap-2 text-sm font-medium">
                        <BookCopy className="h-5 w-5" />
                        Shift History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-5 w-5" />
                      Sign Out
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
}
