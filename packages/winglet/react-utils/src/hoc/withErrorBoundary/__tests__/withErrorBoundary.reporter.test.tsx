import {
  StrictMode,
  createContext,
  createRef,
  forwardRef,
  useContext,
} from 'react';

import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { withErrorBoundary } from '../withErrorBoundary';
import { withErrorBoundaryForwardRef } from '../withErrorBoundaryForwardRef';

describe('withErrorBoundary reporter', () => {
  const error = new Error('Reporter render error');
  const Boom = () => {
    throw error;
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('68C-08 calls onError once with only the component stack', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError} fallback={<div>Failed</div>}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error, {
      componentStack: expect.any(String),
    });
    expect(Object.keys(onError.mock.calls[0][1])).toEqual(['componentStack']);
  });

  it('68C-08 preserves the fallback without onError', () => {
    const { container } = render(
      <ErrorBoundary fallback={<div>Failed</div>}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(container.textContent).toBe('Failed');
  });

  it('68C-08 reads the reporter hook during render and reports the error', () => {
    const onError = vi.fn();
    const ReporterContext = createContext(onError);
    const useReporter = vi.fn(() => useContext(ReporterContext));
    const Safe = withErrorBoundary(Boom, <div>Failed</div>, useReporter);
    const { container } = render(<Safe />);

    expect(useReporter).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error, {
      componentStack: expect.any(String),
    });
    expect(container.textContent).toBe('Failed');
  });

  it('68C-08 renders with and without the reporter under StrictMode without hook warnings', () => {
    const ReporterContext = createContext(undefined);
    const useReporter = vi.fn(() => useContext(ReporterContext));
    const Normal = vi.fn(() => <div>Normal</div>);
    const SafeWithReporter = withErrorBoundary(Normal, undefined, useReporter);
    const SafeWithoutReporter = withErrorBoundary(Normal);
    const { unmount } = render(
      <StrictMode>
        <SafeWithReporter />
      </StrictMode>,
    );
    const renderCount = Normal.mock.calls.length;
    expect(useReporter).toHaveBeenCalledTimes(renderCount);
    unmount();
    Normal.mockClear();

    render(
      <StrictMode>
        <SafeWithoutReporter />
      </StrictMode>,
    );

    expect(Normal).toHaveBeenCalledTimes(renderCount);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('68C-08 forwards the ref and reports through the forwardRef wrapper', () => {
    const onError = vi.fn();
    const useReporter = vi.fn(() => onError);
    const Input = forwardRef<HTMLInputElement, { fail: boolean }>(
      ({ fail }, ref) => {
        if (fail) throw error;
        return <input ref={ref} />;
      },
    );
    const Safe = withErrorBoundaryForwardRef(
      Input,
      <div>Failed</div>,
      useReporter,
    );
    const ref = createRef<HTMLInputElement>();
    const { container, rerender } = render(<Safe fail={false} ref={ref} />);

    expect(ref.current).toBe(container.querySelector('input'));
    expect(ref.current).not.toBeNull();
    expect(useReporter).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    rerender(<Safe fail ref={ref} />);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error, {
      componentStack: expect.any(String),
    });
    expect(container.textContent).toBe('Failed');
  });
});
