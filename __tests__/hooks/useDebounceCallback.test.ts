import { renderHook, act } from '@testing-library/react';
import useDebounceCallback from '@/hooks/useDebounceCallback';

describe('useDebounceCallback Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return a debounced function', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounceCallback(callback, 500));
    
    expect(typeof result.current).toBe('function');
  });

  it('should delay callback execution', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounceCallback(callback, 500));

    act(() => {
      result.current('arg1', 'arg2');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should reset timer on rapid calls', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounceCallback(callback, 500));

    act(() => {
      result.current('call1');
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      result.current('call2');
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      result.current('call3');
    });

    // Callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should be called only once with the last arguments
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('call3');
  });

  it('should use default delay of 500ms', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounceCallback(callback));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(499);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle custom delay', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounceCallback(callback, 1000));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(999);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cleanup timeout on unmount', () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useDebounceCallback(callback, 500));

    act(() => {
      result.current();
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Callback should not be called after unmount
    expect(callback).not.toHaveBeenCalled();
  });

  it('should preserve callback context', () => {
    const context = { value: 'test' };
    const callback = jest.fn(function(this: typeof context) {
      return this.value;
    });
    
    const { result } = renderHook(() => useDebounceCallback(callback, 500));

    act(() => {
      result.current.call(context);
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalled();
  });
});
