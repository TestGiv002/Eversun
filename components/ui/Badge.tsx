'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Size } from '@/types/common';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Variante de style du badge */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Taille du badge */
  size?: Extract<Size, 'sm' | 'md' | 'lg'>;
  /** Contenu du badge */
  children: React.ReactNode;
}

const Badge = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) => {
  const variants = {
    default: 'bg-secondary text-text-primary border border-border dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600',
    success: 'bg-green-50 text-success border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    warning: 'bg-yellow-50 text-warning border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    error: 'bg-red-50 text-error border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
    info: 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-all duration-200',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
