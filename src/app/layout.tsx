import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: "Let's Hang — Plan Perfect Hangouts",
  description:
    'Coordinate hangouts effortlessly with friends. Pick dates, choose spots, and make plans that actually happen.',
};

export const viewport: Viewport = {
  themeColor: '#FF6B35',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&f[]=general-sans@500,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] antialiased"
        style={{ fontFamily: "'General Sans', sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
