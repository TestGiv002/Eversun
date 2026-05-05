'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function Tooltip({ children, content, position = 'top', delay = 300 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-100',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-100',
    left: 'left-full top-1/2 transform -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-gray-100',
    right: 'right-full top-1/2 transform -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-gray-900 dark:border-l-gray-100',
  };

  return (
    <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-2 py-1 text-xs text-white dark:text-gray-900 bg-gray-900 dark:bg-gray-100 rounded shadow-lg whitespace-nowrap ${positionClasses[position]}`}>
          {content}
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
}
