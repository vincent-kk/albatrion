import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DEFAULT_Z_INDEX } from '@/promise-modal/app';

import {
  ConfigurationContextProvider,
  useConfigurationOptions,
} from '../ConfigurationContext';

/**
 * `options` resolution in ConfigurationContextProvider.
 *
 * The provider stabilizes its `options` prop through `useSnapshot` before merging it
 * over `DEFAULT_OPTIONS`, so emptying the prop is a non-empty -> empty transition —
 * the case @winglet/react-utils 5aade140 fixed. Before that fix the snapshot kept its
 * previous contents, so options could be changed but never reset to the defaults.
 *
 * The provider is mounted directly rather than through `ModalProvider`: `bootstrap`
 * renders the configuration provider inside a portal wrapping only the modal `Anchor`,
 * so a probe placed in `ModalProvider`'s children sits outside this context. The public
 * path reaches the same prop unchanged (`bootstrap` passes `options={options}` through).
 */

/** Surfaces the resolved options so a reset to defaults is visible in the DOM. */
const OptionsProbe = () => {
  const { zIndex, closeOnBackdropClick } = useConfigurationOptions();
  return (
    <span data-testid="options">{`${zIndex}|${closeOnBackdropClick}`}</span>
  );
};

const mount = (options: Record<string, unknown>) => (
  <ConfigurationContextProvider options={options}>
    <OptionsProbe />
  </ConfigurationContextProvider>
);

describe('configuration options resolution', () => {
  it('falls back to the defaults once the options prop is emptied', () => {
    const { getByTestId, rerender } = render(
      mount({ zIndex: 9999, closeOnBackdropClick: false }),
    );
    expect(getByTestId('options').textContent).toBe('9999|false');

    rerender(mount({}));
    expect(getByTestId('options').textContent).toBe(`${DEFAULT_Z_INDEX}|true`);
  });

  it('applies a replacement options object', () => {
    const { getByTestId, rerender } = render(mount({ zIndex: 9999 }));
    expect(getByTestId('options').textContent).toBe('9999|true');

    rerender(mount({ zIndex: 4242, closeOnBackdropClick: false }));
    expect(getByTestId('options').textContent).toBe('4242|false');
  });
});
