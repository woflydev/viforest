import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import React from 'react';
import { DragProvider } from '@/contexts/DragContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'viforest',
  description: 'An open-source, intuitive UI for managing files on the Viwoods AIPaper.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Only include this meta tag when not running in a Capacitor app */}
      {typeof window !== 'undefined' && 
       // @ts-ignore - Capacitor adds this to window
       !window?.Capacitor?.isNativePlatform() && (
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      )}
      <body className={inter.className + " min-h-screen bg-background"}>
        <Providers>
          <DragProvider> {/* Wrap with DragProvider */}
            <div className="flex flex-col min-h-screen">
              <main className="flex-1">{children}</main>
              <Navbar />
            </div>
          </DragProvider>
        </Providers>
      </body>
    </html>
  );
}