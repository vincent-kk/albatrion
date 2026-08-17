import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { withErrorBoundary } from '../withErrorBoundary';

/**
 * `null` 은 "에러 시 아무것도 렌더하지 않는다" 라는 유효한 fallback 이다.
 * truthiness 로 판정하면 그 의사를 기본 메시지로 덮어쓴다.
 */
describe('withErrorBoundary fallback', () => {
  const Boom = () => {
    throw new Error('boom');
  };

  it('should honour an explicit null fallback', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Safe = withErrorBoundary(Boom, null);

    const { container } = render(<Safe />);

    expect(container.textContent).toBe('');
    consoleError.mockRestore();
  });

  it('should still show the default message when no fallback is given', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Safe = withErrorBoundary(Boom);

    const { container } = render(<Safe />);

    expect(container.textContent).not.toBe('');
    consoleError.mockRestore();
  });
});
