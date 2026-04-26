'use client';

import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { CaretDown } from '@phosphor-icons/react';
import type { WithLabelError, WithIcon, SelectOption } from '@/types/common';

interface SelectProps
  extends
    React.SelectHTMLAttributes<HTMLSelectElement>,
    WithLabelError,
    WithIcon {
  /** Options disponibles dans le sélecteur */
  options: SelectOption[];
  /** Texte de placeholder pour l'option par défaut */
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      options,
      placeholder,
      icon,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-semibold text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors duration-200">
              {icon}
            </div>
          )}
          <select
            id={selectId}
            className={cn(
              'flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white ring-offset-gray-100 dark:ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow appearance-none',
              icon && 'pl-12',
              error &&
                'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
              'text-base sm:text-sm',
              className
            )}
            ref={ref}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                  ? `${selectId}-helper`
                  : undefined
            }
            aria-invalid={error ? 'true' : undefined}
            style={{ backgroundImage: 'none' }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <CaretDown
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors duration-200"
            weight="bold"
          />
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1"
            role="alert"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="text-sm text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
