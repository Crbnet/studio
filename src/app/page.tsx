"use client";

import { Dashboard } from '@/components/app/dashboard';
import { Header } from '@/components/app/header';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Fuel, PoundSterling } from 'lucide-react';

function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                            Take Control of Your Shift Earnings
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Crbnet Calculator is the smart, simple way for retail workers to track shifts, calculate pay, claim fuel expenses, and estimate tax deductions. Stop guessing and start knowing exactly what you've earned.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg">
                                <Link href="/login">Get Started for Free</Link>
                            </Button>
                        </div>
                    </div>
                    <div>
                        <div className="p-4 bg-primary/10 rounded-xl shadow-lg">
                           <ul className="space-y-4">
                                <li className="flex items-center gap-4">
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                    <span className="font-medium">Effortlessly log your weekly shifts and breaks.</span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <PoundSterling className="h-6 w-6 text-primary" />
                                    <span className="font-medium">Automatically calculate gross pay with variable rates.</span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <Fuel className="h-6 w-6 text-primary" />
                                    <span className="font-medium">Calculate and claim fuel expenses for non-primary stores.</span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <Clock className="h-6 w-6 text-primary" />
                                    <span className="font-medium">View detailed history grouped by your pay cycles.</span>
                                </li>
                           </ul>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="py-4">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                    <p>Designed by Crbnet and built by AI</p>
                </div>
            </footer>
        </div>
    );
}

function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <Dashboard />
      </main>
      <footer className="py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Designed by Crbnet and built by AI</p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
    const { user, loading } = useAuth();

    if (loading) {
        // You might want a more sophisticated loading skeleton here
        return null; 
    }

    if (!user) {
        return <LandingPage />;
    }

    return <DashboardPage />;
}
