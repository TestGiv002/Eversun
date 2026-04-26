'use client';

import { usePathname } from 'next/navigation';

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/reset-password';

  return (
    <main id="main-content" className={isAuthPage ? '' : 'pt-16'} role="main">
      {children}
    </main>
  );
}
