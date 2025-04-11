import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Fn } from '@aileron/types';

import { withUploader } from '../withUploader';

interface TestComponentProps {
  onClick?: Fn<[e?: MouseEvent]>;
}

const TestComponent = ({ onClick }: TestComponentProps) => (
  <button onClick={(e) => onClick?.(e as unknown as MouseEvent)}>
    Click me
  </button>
);

describe('withUploader', () => {
  it('should render component with hidden file input', () => {
    const WrappedComponent = withUploader(TestComponent);
    const { container } = render(<WrappedComponent />);
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.style.display).toBe('none');
  });

  it('should handle file selection', () => {
    const onChange = vi.fn();
    const WrappedComponent = withUploader(TestComponent);
    const { container } = render(<WrappedComponent onChange={onChange} />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);
    expect(onChange).toHaveBeenCalledWith(file);
  });

  it('should handle click event', () => {
    const onClick = vi.fn();
    const WrappedComponent = withUploader(TestComponent);
    const { container } = render(<WrappedComponent onClick={onClick} />);

    const button = container.querySelector('button');
    fireEvent.click(button!);

    expect(onClick).toHaveBeenCalled();
  });

  it('should accept specific file formats', () => {
    const acceptFormat = ['.txt', '.pdf'];
    const WrappedComponent = withUploader(TestComponent);
    const { container } = render(
      <WrappedComponent acceptFormat={acceptFormat} />,
    );

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input.accept).toBe('.txt,.pdf');
  });
});
