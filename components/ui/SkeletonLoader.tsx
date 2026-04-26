'use client';

import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  /** Nombre de lignes à afficher */
  lines?: number;
  /** Afficher le cercle avatar */
  showAvatar?: boolean;
  /** Classes supplémentaires */
  className?: string;
}

export default function SkeletonLoader({ 
  lines = 3, 
  showAvatar = false,
  className 
}: SkeletonLoaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer" style={{ animationDelay: '0.1s' }} />
            <div className="h-3 w-1/2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}
      
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer',
            i === lines - 1 ? 'w-5/6' : 'w-full'
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

interface TableSkeletonProps {
  /** Nombre de lignes */
  rows?: number;
  /** Nombre de colonnes */
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 p-4 border-b dark:border-gray-700">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn(
                'h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer',
                colIndex === 0 ? 'w-32' : colIndex === cols - 1 ? 'w-20' : 'w-full'
              )}
              style={{ animationDelay: `${(rowIndex * cols + colIndex) * 0.08}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
