import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Production Request — FME Studios',
  description: 'Submit a production request to FME Studios — a creative digital agency in Indianapolis.',
  icons: {
    icon: '/fme-logo.png',
    shortcut: '/fme-logo.png',
    apple: '/fme-logo.png',
  },
  openGraph: {
    title: 'Production Request — FME Studios',
    description: 'Tell us about your next production.',
    siteName: 'FME Studios',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
