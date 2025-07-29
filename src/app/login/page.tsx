import { AuthForm } from '@/components/app/auth-form';
import { Wallet } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="flex items-center gap-4 mb-2 text-primary">
                    <Wallet className="h-10 w-10" />
                    <h1 className="text-4xl font-headline font-bold tracking-tight">WageWise</h1>
                </div>
                <p className="text-muted-foreground text-center">Sign in or create an account to manage your shifts.</p>
            </div>
            <AuthForm />
        </div>
    </div>
  );
}
