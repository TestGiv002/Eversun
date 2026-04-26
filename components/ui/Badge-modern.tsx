'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante de couleur */
  variant?: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'primary';
  /** Taille du badge */
  size?: 'sm' | 'md' | 'lg';
  /** Afficher un point indicateur */
  dot?: boolean;
  /** Icon à afficher */
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = 'info',
      size = 'md',
      dot = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      // Modern Success: Emerald
      success:
        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-700/50',

      // Modern Warning: Amber
      warning:
        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50',

      // Modern Error: Rose
      error:
        'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-300/50 dark:border-rose-700/50',

      // Modern Info: Sky
      info: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-300/50 dark:border-sky-700/50',

      // Modern Pending: Slate
      pending:
        'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700/50',

      // Modern Primary: Cyan
      primary:
        'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300/50 dark:border-primary-700/50',
    };

    const sizes = {
      sm: 'px-2.5 py-1 text-xs font-medium rounded-md',
      md: 'px-3 py-1.5 text-sm font-medium rounded-lg',
      lg: 'px-4 py-2 text-base font-semibold rounded-xl',
    };

    const dotColors = {
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      error: 'bg-rose-500',
      info: 'bg-sky-500',
      pending: 'bg-slate-500',
      primary: 'bg-primary-500',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium transition-all duration-200',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <div className={cn('h-2 w-2 rounded-full', dotColors[variant])} />
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
