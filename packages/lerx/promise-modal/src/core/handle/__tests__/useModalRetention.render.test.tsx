import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { useModal } from '../hooks/useModal';
import * as alertModule from '../utils/alert';
import * as confirmModule from '../utils/confirm';
import * as promptModule from '../utils/prompt';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it.each([false, true])(
  'R20 drops all settled handles before owner cleanup (rejected=%s)',
  async (rejected) => {
    const read = vi.fn();
    const error = new Error('request failed');
    vi.spyOn(alertModule, 'alertHandler').mockImplementation(() => ({
      get modalNode() {
        read();
        return undefined;
      },
      cancel: vi.fn(),
      promiseHandler: rejected ? Promise.reject(error) : Promise.resolve(),
    }));
    vi.spyOn(confirmModule, 'confirmHandler').mockImplementation(() => ({
      get modalNode() {
        read();
        return undefined;
      },
      cancel: vi.fn(),
      promiseHandler: rejected ? Promise.reject(error) : Promise.resolve(false),
    }));
    vi.spyOn(promptModule, 'promptHandler').mockImplementation(() => ({
      get modalNode() {
        read();
        return undefined;
      },
      cancel: vi.fn(),
      promiseHandler: rejected ? Promise.reject(error) : Promise.resolve(null),
    }));
    let open!: () => Promise<unknown>;
    const Owner = () => {
      const modal = useModal();
      open = () =>
        Promise.allSettled([
          modal.alert({}),
          modal.confirm({}),
          modal.prompt({ Input: () => null }),
        ]);
      return null;
    };
    const view = render(<Owner />);
    await act(async () => {
      await open();
    });
    view.unmount();
    expect(read).not.toHaveBeenCalled();
  },
);
