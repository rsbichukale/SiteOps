import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ConstructTrack SiteOps — Site Operations Companion',
  description: 'Mobile-First application for site logistics, material GRN, stock ledger, petty cash, rented machinery, safety compliance, and quality testing.',
};

export const viewport: Viewport = {
  themeColor: '#10b981',
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
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
