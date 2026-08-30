import type { Metadata } from 'next';
import NavigationHeader from '@/components/NavigationHeader';
import Footer from '@/components/Footer';
import { AuthProvider, AuthGuard } from '../context/AuthContext';
import '../index.css';

export const metadata: Metadata = {
  title: 'TutorHQ - Academic Student Ledger',
  description: 'Academic student tracking ledger, daily log, exam marks, and database terminal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800" id="main-applet-root" suppressHydrationWarning>
        <AuthProvider>
          <NavigationHeader />
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-h-0 relative">
            <AuthGuard>
              {children}
            </AuthGuard>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
