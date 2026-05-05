import { Suspense } from 'react';
import Link from 'next/link';
import { HomeContent, HomeContentSkeleton } from './HomeContent';
import { ArrowRight, SquaresFour } from '@phosphor-icons/react/dist/ssr';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-end">
            <Link
              href="/dashboard?section=clients"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <SquaresFour className="w-4 h-4" />
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content avec Suspense pour streaming */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section - Rendu immédiatement */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Bienvenue
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Gérez vos dossiers d&apos;installations solaires à travers les différentes étapes du processus
          </p>
        </div>

        {/* Cards et Stats avec Suspense */}
        <Suspense fallback={<HomeContentSkeleton />}>
          <HomeContent />
        </Suspense>

        {/* Footer - Rendu immédiatement */}
        <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 Eversun - Dashboard de suivi des installations solaires
          </p>
        </footer>
      </main>
    </div>
  );
}
