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

const APP_NAME = 'Crbnet Calculator';
const APP_DESCRIPTION = 'A retail shift and pay management app to automatically calculate earnings and estimate tax.';
const APP_URL = 'https://wagewise-1cvfw.web.app'; // Replace with your actual deployed URL

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: ['retail', 'shift work', 'pay calculator', 'tax estimator', 'wage management'],
  authors: [{ name: 'Crbnet', url: APP_URL }],
  creator: 'Crbnet',
  publisher: 'Crbnet',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: APP_URL,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: `${APP_URL}/og-image.png`, // You should create this image and place it in the public folder
        width: 1200,
        height: 630,
        alt: `Logo for ${APP_NAME}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/og-image.png`], // You should create this image and place it in the public folder
  },
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
