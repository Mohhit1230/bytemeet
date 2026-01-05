import type { Metadata } from 'next';
import { Montserrat, Quicksand } from 'next/font/google';
import { GSAPProvider } from '@/providers/GSAPProvider';
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
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${quicksand.variable}`}>
      <body className="antialiased">
        <GSAPProvider>
          <AuthProvider>
            <ToastProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </ToastProvider>
          </AuthProvider>
        </GSAPProvider>
      </body>
    </html>
  );
}

