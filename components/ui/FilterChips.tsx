'use client';

import { X, Funnel } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (key: string) => void;
  onResetAll: () => void;
  className?: string;
}

export default function FilterChips({
  filters,
  onRemove,
  onResetAll,
  className,
}: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Funnel className="h-4 w-4" weight="bold" />
        <span>Filtres actifs ({filters.length}) :</span>
      </div>

      {filters.map((filter) => (
        <div
          key={filter.key}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-800"
        >
          <span className="text-slate-500 dark:text-slate-400">
            {filter.label}:
          </span>
          <span>{filter.value}</span>
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-1 p-0.5 hover:bg-primary-200 dark:hover:bg-primary-700 rounded-full transition-colors"
            aria-label={`Retirer le filtre ${filter.label}`}
          >
            <X className="h-3 w-3" weight="bold" />
          </button>
        </div>
      ))}

      <button
        onClick={onResetAll}
        className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 underline transition-colors"
      >
        Tout effacer
      </button>
    </div>
  );
}
