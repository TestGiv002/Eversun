'use client';

import { useEffect, useState } from 'react';

interface SectionTransitionProps {
  children: React.ReactNode;
  sectionKey: string;
  className?: string;
  isLoading?: boolean;
}

export default function SectionTransition({
  children,
  sectionKey,
  className = '',
  isLoading = false,
}: SectionTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(sectionKey);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (currentSection !== sectionKey) {
      // Changement de section - animation de sortie
      setIsExiting(true);
      setIsVisible(false);

      const timer = setTimeout(() => {
        setCurrentSection(sectionKey);
        setIsExiting(false);
        setIsVisible(true);
      }, 75);

      return () => clearTimeout(timer);
    } else {
      // Première apparition
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 25);

      return () => clearTimeout(timer);
    }
  }, [sectionKey, currentSection]);

  if (isLoading && currentSection !== sectionKey) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`
        transition-all duration-200 ease-out
        ${isVisible && !isExiting ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
