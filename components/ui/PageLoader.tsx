'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '@phosphor-icons/react';

interface PageLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Message de chargement personnalisé */
  message?: string;
  /** Progression de chargement (0-100) */
  progress?: number;
  /** Afficher la progression */
  showProgress?: boolean;
}

export default function PageLoader({ 
  message = 'Chargement...', 
  progress,
  showProgress = false,
  className,
  ...props 
}: PageLoaderProps) {
  return (
    <div 
      className={cn(
        'fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
        'flex items-center justify-center z-50',
        className
      )}
      {...props}
    >
      <div className="text-center space-y-6">
        {/* Logo/Icon Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-2xl">
            <Spinner 
              size={48} 
              weight="bold" 
              className="text-primary-500 animate-spin" 
            />
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {message}
          </p>
          <div className="flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && typeof progress === 'number' && (
          <div className="w-64 mx-auto space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
