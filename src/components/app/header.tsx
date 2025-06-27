import { Wallet } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center gap-4 py-4 px-4 md:px-6">
        <Wallet className="h-8 w-8" />
        <h1 className="text-2xl md:text-3xl font-headline font-bold tracking-tight">WageWise</h1>
      </div>
    </header>
  );
}
