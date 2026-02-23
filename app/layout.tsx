import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BodyLoaded from '@/components/BodyLoaded';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Peak NYU | See The Night Before You Go',
  description:
    'The real-time nightlife map that shows you what\'s actually happening — crowd levels, vibes, and where people are headed tonight.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark-theme">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={inter.variable} suppressHydrationWarning>
        <BodyLoaded />
        {children}
      </body>
    </html>
  );
}
