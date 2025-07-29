import { AuthForm } from '@/components/app/auth-form';
import { Wallet } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login or Sign Up',
    description: 'Log in to your Crbnet Calculator account or sign up for free to start tracking your shifts, pay, and tax estimates.'
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="flex items-center gap-4 mb-2 text-primary">
                    <Wallet className="h-10 w-10" />
                    <h1 className="text-4xl font-headline font-bold tracking-tight">Crbnet Calculator</h1>
                </div>
                <p className="text-muted-foreground text-center">Sign in or create an account to manage your shifts.</p>
            </div>
            <AuthForm />
        </div>
    </div>
  );
}
