import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'C8 Blogger - AI-Powered Social Media Automation',
  description: 'Generate engaging content with AI and post to all your social media platforms simultaneously.',
  keywords: 'social media, automation, AI, content generation, Twitter, Facebook, Instagram',
  authors: [{ name: 'C8 Blogger Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}