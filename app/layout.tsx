import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/lib/contexts/UserContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToastProvider from '@/components/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The BlackSpot Project',
  description: 'Mental wellness and spirituality — a cosmos-inspired experience.',
  icons: {
    icon: '/Logos/black_icon.png',
    apple: '/Logos/black_icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <UserProvider>
            <Header />
              {children}
              <Footer />
            <ToastProvider />
        </UserProvider>
      </body>
    </html>
  );
}
