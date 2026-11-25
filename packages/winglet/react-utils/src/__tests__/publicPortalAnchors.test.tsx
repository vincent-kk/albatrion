import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Portal } from '../index';

afterEach(() => {
  document.body.innerHTML = '';
});

/** Each prop mounts one anchor when defined; changing its number remounts that anchor. */
const Scope = Portal.with(
  ({ first, second }: { first?: number; second?: number }) => (
    <>
      <Portal>
        <span>content</span>
      </Portal>
      {first !== undefined && (
        <Portal.Anchor key={`first-${first}`} data-testid="first" />
      )}
      {second !== undefined && (
        <Portal.Anchor key={`second-${second}`} data-testid="second" />
      )}
    </>
  ),
);

describe('several Portal.Anchor elements in one provider scope', () => {
  it('the anchor that attaches last holds the content, whatever its tree position', async () => {
    const together = render(<Scope first={0} second={0} />);
    expect(together.getByTestId('second').textContent).toBe('content');
    expect(together.getByTestId('first').textContent).toBe('');
    together.unmount();

    const later = render(<Scope second={0} />);
    await act(async () => later.rerender(<Scope first={0} second={0} />));
    expect(later.getByTestId('first').textContent).toBe('content');
    expect(later.getByTestId('second').textContent).toBe('');
  });

  it('unmounting an anchor that is not current leaves the content in place', async () => {
    const view = render(<Scope first={0} second={0} />);
    await act(async () => view.rerender(<Scope second={0} />));
    expect(view.getByTestId('second').textContent).toBe('content');
  });

  it('unmounting the current anchor empties the scope in a microtask until a surviving anchor remounts', async () => {
    const view = render(<Scope first={0} second={0} />);
    const retired = view.getByTestId('second');
    view.rerender(<Scope first={0} />);
    expect(retired.textContent).toBe('content');
    await act(async () => {});
    expect(retired.textContent).toBe('');
    expect(view.getByTestId('first').textContent).toBe('');
    expect(view.queryByText('content')).toBeNull();

    await act(async () => view.rerender(<Scope first={1} />));
    expect(view.getByTestId('first').textContent).toBe('content');
  });
});
