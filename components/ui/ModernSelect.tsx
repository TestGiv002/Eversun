'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CaretDown, Check } from '@phosphor-icons/react';
import type { WithLabelError, WithIcon, SelectOption } from '@/types/common';

interface ModernSelectProps extends WithLabelError, WithIcon {
  /** Options disponibles dans le sélecteur */
  options: SelectOption[];
  /** Valeur sélectionnée */
  value?: string;
  /** Fonction appelée lors du changement de valeur */
  onChange: (value: string) => void;
  /** Texte de placeholder pour l'option par défaut */
  placeholder?: string;
  /** Nom du champ */
  name?: string;
  /** ID personnalisé */
  id?: string;
  /** Classes supplémentaires */
  className?: string;
}

const ModernSelect = forwardRef<HTMLDivElement, ModernSelectProps>(
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
      value,
      onChange,
      name,
      ...props
    },
    ref
  ) => {
    const selectId =
      id || `select-${name || Math.random().toString(36).substr(2, 9)}`;
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(!isOpen);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown' && isOpen) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp' && isOpen) {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
    };

    return (
      <div className="space-y-2" ref={containerRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-amber-500 transition-colors duration-200 z-10">
              {icon}
            </div>
          )}
          <div
            ref={ref}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-labelledby={selectId}
            className={cn(
              'flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 focus-visible:border-amber-500 dark:focus-visible:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 shadow hover:shadow-md cursor-pointer',
              icon && 'pl-12',
              error &&
                'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
              'text-base sm:text-sm',
              className
            )}
            {...props}
          >
            <span
              className={cn(
                'flex-1 truncate',
                !value && 'text-gray-400 dark:text-gray-500'
              )}
            >
              {selectedOption
                ? selectedOption.label
                : placeholder || 'Sélectionner...'}
            </span>
            <CaretDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              weight="bold"
            />
          </div>

          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
              <div role="listbox" className="max-h-60 overflow-auto">
                {options.map((option, index) => (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 cursor-pointer transition-colors',
                      index === highlightedIndex &&
                        'bg-amber-50 dark:bg-amber-900/30',
                      option.value === value
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    )}
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.value === value && (
                      <Check
                        className="h-4 w-4 text-amber-600 dark:text-amber-400"
                        weight="bold"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
          <p
            id={`${selectId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ModernSelect.displayName = 'ModernSelect';

export default ModernSelect;
