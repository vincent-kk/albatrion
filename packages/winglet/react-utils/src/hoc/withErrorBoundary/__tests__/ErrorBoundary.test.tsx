import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '../../index';

const Thrower = () => {
  throw new Error('boom');
};

describe('ErrorBoundary (hoc entry)', () => {
  it('renders children unchanged when nothing throws', () => {
    const { container } = render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <div>ok</div>
      </ErrorBoundary>,
    );
    expect(container.textContent).toBe('ok');
  });

  it('renders the fallback and reports the error when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    const { container } = render(
      <ErrorBoundary fallback={<div>fallback</div>} onError={onError}>
        <Thrower />
      </ErrorBoundary>,
    );
    expect(container.textContent).toBe('fallback');
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect((onError.mock.calls[0][0] as Error).message).toBe('boom');
    vi.restoreAllMocks();
  });
});
