import type { Metadata } from 'next';
import { Montserrat, Quicksand } from 'next/font/google';
import { GSAPProvider } from '@/providers/GSAPProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { GraphQLProvider } from '@/providers/GraphQLProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { NotificationProvider } from '@/providers/NotificationProvider';
import './globals.css';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ByteMeet - Collaborative Learning Platform',
  description: 'Learn together with AI-powered tutoring and real-time collaboration.',
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.png',
  },
};

import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${quicksand.variable}`}>
      <body className="antialiased">
        <GSAPProvider>
          <GraphQLProvider>
            <QueryProvider>
              <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black/80"><div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /></div>}>
                <AuthProvider>
                  <ToastProvider>
                    <NotificationProvider>{children}</NotificationProvider>
                  </ToastProvider>
                </AuthProvider>
              </Suspense>
            </QueryProvider>
          </GraphQLProvider>
        </GSAPProvider>
      </body>
    </html>
  );
}
