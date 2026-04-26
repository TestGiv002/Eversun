'use client';

import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import { cn } from '@/lib/utils';
import { Calendar } from '@phosphor-icons/react';
import 'react-datepicker/dist/react-datepicker.css';
import type { WithLabelError, WithIcon } from '@/types/common';

interface ModernDatePickerProps extends WithLabelError, WithIcon {
  /** Date sélectionnée (string ISO ou Date) */
  value?: string | Date | null;
  /** Fonction appelée lors du changement de date (reçoit une string ISO) */
  onChange: (value: string) => void;
  /** Texte de placeholder */
  placeholderText?: string;
  /** Format de la date */
  dateFormat?: string;
  /** Date minimum sélectionnable */
  minDate?: Date;
  /** Date maximum sélectionnable */
  maxDate?: Date;
  /** Nom du champ */
  name?: string;
  /** ID personnalisé */
  id?: string;
  /** Classes supplémentaires */
  className?: string;
  /** Désactiver le champ */
  disabled?: boolean;
}

const ModernDatePicker = forwardRef<ReactDatePicker, ModernDatePickerProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      icon,
      name,
      value,
      onChange,
      placeholderText,
      minDate,
      maxDate,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId =
      id || `datepicker-${name || Math.random().toString(36).substr(2, 9)}`;

    // Convertir string ISO vers Date
    const getDateObject = (): Date | null => {
      if (!value) return null;
      if (value instanceof Date) return value;
      if (typeof value === 'string') {
        const date = new Date(value + 'T00:00:00Z');
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    };

    // Handler pour la modification
    const handleDateChange = (date: Date | null) => {
      if (date) {
        const isoString = date.toISOString().split('T')[0];
        onChange(isoString);
      } else {
        onChange('');
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
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
          <ReactDatePicker
            selected={getDateObject()}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText={placeholderText || 'JJ/MM/AAAA'}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            className={cn(
              'flex h-12 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base ring-offset-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 focus-visible:border-amber-500 dark:focus-visible:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 shadow hover:shadow-md',
              icon && 'pl-12',
              error &&
                'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
              'dark:[color-scheme:dark]',
              className
            )}
            wrapperClassName="w-full"
            popperClassName="!z-50"
            calendarClassName="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
            dayClassName={(date) => {
              const today = new Date();
              const selectedDate = getDateObject();

              if (date.toDateString() === today.toDateString()) {
                return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold';
              }
              if (
                selectedDate &&
                date.toDateString() === selectedDate.toDateString()
              ) {
                return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold';
              }
              return 'text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-full transition-colors';
            }}
            renderCustomHeader={({
              monthDate,
              customHeaderCount,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {monthDate.toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <button
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
            {...props}
          />
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

ModernDatePicker.displayName = 'ModernDatePicker';

export default ModernDatePicker;
