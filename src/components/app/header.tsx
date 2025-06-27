import { Wallet, BookCopy } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4 py-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-4">
          <Wallet className="h-8 w-8" />
          <h1 className="text-2xl md:text-3xl font-headline font-bold tracking-tight">WageWise</h1>
        </Link>
        <nav>
          <Link href="/history" className="flex items-center gap-2 text-sm font-medium hover:underline">
            <BookCopy className="h-5 w-5" />
            Shift History
          </Link>
        </nav>
      </div>
    </header>
  );
}
