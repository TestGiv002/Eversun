'use client';

import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({
  children,
  className = '',
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 20);

    return () => clearTimeout(timer);
  }, []);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      // La sortie sera gérée par le parent
    }, 200);
  };

  return (
    <div
      className={`
        transition-all duration-200 ease-out
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
        ${isExiting ? 'opacity-0 translate-y-[-4px] scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
