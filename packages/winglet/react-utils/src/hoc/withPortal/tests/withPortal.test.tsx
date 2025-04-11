import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { withPortal } from '../withPortal';

const TestComponent = ({ text }: { text: string }) => <div>{text}</div>;

describe('withPortal', () => {
  it('should render component with PortalContextProvider', () => {
    const WrappedComponent = withPortal(TestComponent);
    const { container } = render(<WrappedComponent text="Test Portal" />);
    expect(container.textContent).toBe('Test Portal');
  });

  it('should memoize the component', () => {
    const WrappedComponent = withPortal(TestComponent);
    const { container, rerender } = render(
      <WrappedComponent text="Test Portal" />,
    );
    const initialContent = container.textContent;

    rerender(<WrappedComponent text="Test Portal" />);
    expect(container.textContent).toBe(initialContent);
  });
});
