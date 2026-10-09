import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/authContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'FoodBridge AI — AI-Powered Food Waste Reduction & Hunger Management',
  description: 'Intelligently connects restaurants, college cafeterias, event organizers, and NGOs to rescue surplus food and eradicate hunger in real time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
