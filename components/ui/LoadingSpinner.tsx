'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Taille du spinner (xs, sm, md, lg, xl) */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Couleur personnalisée */
  color?: string;
  /** Classes supplémentaires */
  className?: string;
  /** Texte de chargement optionnel */
  text?: string;
  /** Variante d'animation (default, pulse, dots, bars) */
  variant?: 'default' | 'pulse' | 'dots' | 'bars';
  /** Afficher un overlay semi-transparent */
  overlay?: boolean;
}

const sizeClasses = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'text-primary-500',
  className,
  text,
  variant = 'default',
  overlay = false
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {variant === 'default' && (
        <svg
          className={cn('animate-spin', sizeClasses[size], color, className)}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {variant === 'pulse' && (
        <div className={cn('relative', sizeClasses[size])}>
          <div className={cn('absolute inset-0 rounded-full bg-current opacity-25 animate-ping', color)} />
          <div className={cn('relative rounded-full bg-current', sizeClasses[size], color)} />
        </div>
      )}
      
      {variant === 'dots' && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full bg-current animate-bounce',
                size === 'xs' ? 'h-1 w-1' : size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-5 w-5',
                color
              )}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}
      
      {variant === 'bars' && (
        <div className="flex items-end gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-current animate-pulse',
                size === 'xs' ? 'w-1' : size === 'sm' ? 'w-1.5' : size === 'md' ? 'w-2' : size === 'lg' ? 'w-3' : 'w-4',
                size === 'xs' ? 'h-3' : size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-10',
                color
              )}
              style={{ 
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      )}
      
      {text && (
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}
