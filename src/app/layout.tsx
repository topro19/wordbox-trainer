import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wordbox Trainer — Plato Wordbox 5×5 400+ Mastery Engine',
  description:
    'Dedicated high-performance practice and training tool engineered to train players to hit 400+ points in Plato Wordbox 5×5 60-second mode. Features authentic Big Boggle dice simulation, ENABLE1 dictionary, interactive missed-word path inspector, and deep historical analytics.',
  keywords: [
    'Plato Wordbox',
    'Wordbox Trainer',
    'Wordbox 400 points',
    'Plato Wordbox strategy',
    'Boggle 5x5 practice',
    'Word search training',
    'ENABLE1 dictionary',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090E] text-[#E2E8F0] antialiased min-h-screen selection:bg-sky-500 selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
