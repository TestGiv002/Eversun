'use client';

import React, { forwardRef, useId } from 'react';
import ReactDatePicker from 'react-datepicker';
import { cn } from '@/lib/utils';
import type { WithLabelError, WithIcon } from '@/types/common';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps extends WithLabelError, WithIcon {
  value?: string | Date | null;
  onChange: (value: string) => void;
  placeholderText?: string;
  minDate?: Date;
  maxDate?: Date;
  name?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const DatePicker = forwardRef<ReactDatePicker, DatePickerProps>(
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
      readOnly,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const getDateObject = (): Date | null => {
      if (!value) return null;
      if (value instanceof Date) return value;
      const parsed = new Date(`${value}T00:00:00`);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    const handleDateChange = (date: Date | null) => {
      if (!date) {
        onChange('');
        return;
      }
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISO = new Date(date.getTime() - tzOffset)
        .toISOString()
        .slice(0, 10);
      onChange(localISO);
    };

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
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors duration-200">
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
            readOnly={readOnly}
            id={inputId}
            name={name}
            className={cn(
              'flex h-12 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white ring-offset-gray-100 dark:ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow hover:shadow-md',
              icon && 'pl-12',
              error &&
                'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
              'text-base sm:text-sm',
              'dark:[color-scheme:dark]',
              className
            )}
            ref={ref}
            wrapperClassName="w-full"
            popperClassName="!z-50"
            calendarClassName="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md"
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            aria-invalid={error ? 'true' : undefined}
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

DatePicker.displayName = 'DatePicker';

export default DatePicker;
