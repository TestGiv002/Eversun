'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { Section } from '@/types/client';

function DashboardContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section') as Section | null;

  return <Dashboard initialSection={sectionParam || 'dp-en-cours'} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
