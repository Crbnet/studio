"use client";

import { Wallet, BookCopy, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { toast } = useToast();

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

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4 py-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-4">
          <Wallet className="h-8 w-8" />
          <h1 className="text-2xl md:text-3xl font-headline font-bold tracking-tight">WageWise</h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/history" className="flex items-center gap-2 text-sm font-medium hover:underline">
            <BookCopy className="h-5 w-5" />
            Shift History
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-primary/80">
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </nav>
      </div>
    </header>
  );
}
