import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { withErrorBoundary } from '../withErrorBoundary';

const ErrorComponent = () => {
  throw new Error('Test error');
};

const NormalComponent = () => <div>Normal Component</div>;

describe('withErrorBoundary', () => {
  it('should render normal component without error', () => {
    const WrappedComponent = withErrorBoundary(NormalComponent);
    const { container } = render(<WrappedComponent />);
    expect(container.textContent).toBe('Normal Component');
  });

  it('should render fallback when component throws error', () => {
    const fallback = <div>Error occurred</div>;
    const WrappedComponent = withErrorBoundary(ErrorComponent, fallback);
    const { container } = render(<WrappedComponent />);
    expect(container.textContent).toBe('Error occurred');
  });

  it('should render default fallback when no fallback provided', () => {
    const WrappedComponent = withErrorBoundary(ErrorComponent);
    const { container } = render(<WrappedComponent />);
    expect(container.textContent).toBe('An unexpected error has occurred');
  });
});
