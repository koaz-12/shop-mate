import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import AuthCheck from '@/components/AuthCheck';
import BottomNav from '@/components/BottomNav';
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeApplicator from '@/components/ThemeApplicator';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  themeColor: '#10b981',
};

export const metadata: Metadata = {
  title: 'ShopMate',
  description: 'Collaborative Family Shopping List',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShopMate',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'min-h-screen bg-slate-50 text-slate-900')}>
        <Toaster position="bottom-center" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthCheck>
            <ThemeApplicator />
            <ServiceWorkerRegister />
            {children}
            <BottomNav />
          </AuthCheck>
        </ThemeProvider>
      </body>
    </html>
  );
}
