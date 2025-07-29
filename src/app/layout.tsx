import type {Metadata} from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { UserDataProvider } from '@/hooks/use-user-data';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    default: 'Crbnet Calculator',
    template: '%s | Crbnet Calculator',
  },
  description: 'A retail shift and pay management app to automatically calculate earnings and estimate tax.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} scroll-smooth`}>
      <body className="font-body antialiased">
        <AuthProvider>
            <UserDataProvider>
                {children}
            </UserDataProvider>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
