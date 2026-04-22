'use client';

import { useAppStore } from '@/store/useAppStore';
import { Sun, Moon } from '@phosphor-icons/react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-[1.01] group"
      aria-label={
        theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'
      }
      title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
    >
      <div className="relative">
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-teal-500 transition-colors" weight="bold" />
        ) : (
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-teal-500 transition-colors" weight="bold" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-10 rounded-full blur-md transition-opacity duration-200" />
      </div>
    </button>
  );
}
