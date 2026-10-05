import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Newsreader } from 'next/font/google';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const display = Newsreader({ subsets: ['latin'], variable: '--font-display', style: ['normal', 'italic'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: { default: 'GrantFinder', template: '%s · GrantFinder' },
  description:
    'Find the Singapore government grants your business actually qualifies for, read the rules in plain English, and draft the application narrative.',
};

export const viewport: Viewport = {
  themeColor: '#0F4C81',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
