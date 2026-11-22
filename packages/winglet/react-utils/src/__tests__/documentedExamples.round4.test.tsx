import { act, render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Portal, useConstant, useLazyConstant, useMemorize, useDebounce, withErrorBoundary } from '../index';

it('documented hook signatures retain values, compute factories and schedule callbacks', () => {
  vi.useFakeTimers();
  class ExpensiveManager {}
  const callback = vi.fn(); const value = () => 1;
  const Probe = () => {
    expect(useConstant(value)).toBe(value);
    expect(useLazyConstant(() => new ExpensiveManager())).toBeInstanceOf(ExpensiveManager);
    expect(useMemorize(() => 'computed', [1])).toBe('computed');
    const { isIdle, cancel } = useDebounce(callback, [value], 50);
    expect(typeof isIdle).toBe('function'); expect(typeof cancel).toBe('function');
    return null;
  };
  try { render(<Probe />); act(() => vi.advanceTimersByTime(100)); expect(callback).toHaveBeenCalledTimes(1); }
  finally { vi.useRealTimers(); }
});

it('documented boundary and portal compound calls render their content', () => {
  const Widget = () => { throw new Error('widget failed'); };
  const SafeWidget = withErrorBoundary(Widget, <p>Something went wrong.</p>);
  const App = Portal.with(() => <><Portal.Anchor /><Portal><SafeWidget /></Portal></>);
  const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
  try { const view = render(<App />); expect(view.container.textContent).toBe('Something went wrong.'); }
  finally { silence.mockRestore(); }
});
