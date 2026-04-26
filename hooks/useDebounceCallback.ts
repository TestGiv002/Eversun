import { useCallback, useRef } from 'react';

/**
 * Hook personnalisé pour debounce une fonction callback
 * @param callback La fonction à debounce
 * @param delay Le délai en millisecondes (par défaut 500ms)
 * @returns La fonction debouncée
 */
function useDebounceCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

export default useDebounceCallback;
