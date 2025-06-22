import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Navbar from './components/Navbar';
import { Inter } from 'next/font/google';
import { Toaster } from './components/ui/toaster'
import { ThemeProvider } from './components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Swami - Fantasy Football Oracle',
  description: 'Your Fantasy Football Oracle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.className}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className="min-h-screen bg-base-200">
          <ThemeProvider>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
} 