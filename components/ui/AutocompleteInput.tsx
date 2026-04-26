'use client';

import React, { useState, useRef, useEffect, useId, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CaretDown, X } from '@phosphor-icons/react';
import type { WithLabelError, WithIcon } from '@/types/common';

interface AutocompleteInputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSelect'>,
    WithLabelError,
    WithIcon {
  /** Options disponibles pour l'autocomplétion */
  options: string[];
  /** Fonction appelée lors de la sélection d'une option */
  onSelect?: (value: string) => void;
  /** Texte de placeholder */
  placeholder?: string;
  /** Si le champ doit être en lecture seule après sélection */
  readOnlyAfterSelect?: boolean;
}

const AutocompleteInput = React.forwardRef<
  HTMLInputElement,
  AutocompleteInputProps
>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      options,
      onSelect,
      placeholder,
      icon,
      readOnlyAfterSelect = false,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [searchValue, setSearchValue] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const generatedId = useId();
    const inputId = id || generatedId;

    useEffect(() => {
      if (value && readOnlyAfterSelect && !isReadOnly) {
        setIsReadOnly(true);
      }
    }, [value, readOnlyAfterSelect, isReadOnly]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    // Memoize filtered options for performance
    const filteredOptions = useMemo(() => {
      if (searchValue.length === 0) return [];
      return options.filter((option) =>
        option.toLowerCase().includes(searchValue.toLowerCase())
      );
    }, [options, searchValue]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (isReadOnly) return;

      const inputValue = e.target.value;
      onChange?.(e);
      setSearchValue(inputValue);

      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the dropdown opening
      debounceTimerRef.current = setTimeout(() => {
        setIsOpen(inputValue.length > 0 && filteredOptions.length > 0);
        setHighlightedIndex(-1);
      }, 150);
    }, [isReadOnly, onChange, filteredOptions]);

    const handleSelectOption = useCallback((option: string) => {
      onChange?.({
        target: { value: option },
      } as React.ChangeEvent<HTMLInputElement>);
      setIsOpen(false);
      setSearchValue('');
      onSelect?.(option);
      if (readOnlyAfterSelect) {
        setIsReadOnly(true);
      }
    }, [onChange, onSelect, readOnlyAfterSelect]);

    const handleClear = useCallback(() => {
      onChange?.({
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>);
      setIsReadOnly(false);
      setSearchValue('');
      setIsOpen(false);
      inputRef.current?.focus();
    }, [onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isReadOnly) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }, [isReadOnly, filteredOptions, highlightedIndex, handleSelectOption]);

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative group" ref={dropdownRef}>
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors duration-200">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={(el) => {
              if (el) inputRef.current = el;
              if (typeof ref === 'function') {
                ref(el);
              } else if (ref && 'current' in ref) {
                (
                  ref as React.MutableRefObject<HTMLInputElement | null>
                ).current = el;
              }
            }}
            className={cn(
              'flex h-12 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white ring-offset-gray-100 dark:ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow hover:shadow-md appearance-none',
              icon && 'pl-12',
              value && readOnlyAfterSelect && 'pr-12',
              error &&
                'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
              'text-base sm:text-sm',
              className
            )}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => !isReadOnly && setIsOpen(true)}
            placeholder={placeholder}
            readOnly={isReadOnly}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            aria-invalid={error ? 'true' : undefined}
            aria-autocomplete="list"
            aria-controls={`${inputId}-listbox`}
            aria-expanded={isOpen}
            {...props}
          />
          {value && readOnlyAfterSelect && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          )}
          {!isReadOnly && !value && (
            <CaretDown
              className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors duration-200"
              weight="bold"
            />
          )}

          {isOpen && filteredOptions.length > 0 && (
            <ul
              id={`${inputId}-listbox`}
              role="listbox"
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {filteredOptions.map((option, index) => (
                <li
                  key={`${option}-${index}`}
                  role="option"
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors',
                    index === highlightedIndex
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  )}
                  onClick={() => handleSelectOption(option)}
                  aria-selected={index === highlightedIndex}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
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
            id={`${inputId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AutocompleteInput.displayName = 'AutocompleteInput';

export default AutocompleteInput;
