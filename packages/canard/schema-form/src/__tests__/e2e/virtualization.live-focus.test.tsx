import { startTransition } from 'react';

import { act } from '@testing-library/react';
import { flushSync } from 'react-dom';
import { describe, expect, it, vi } from 'vitest';

import { liveOptions, mountVirtualization } from './helpers/liveVirtualization';

describe.each([false, true])(
  'live virtualization focus (StrictMode=%s)',
  (strict) => {
    it('preserves an in-progress focus request across an unrelated option change', () => {
      const form = mountVirtualization(strict);
      const removed = vi.spyOn(document, 'removeEventListener');
      const focus = vi.spyOn(HTMLElement.prototype, 'focus');
      act(() => {
        startTransition(() => form.ref.current!.focus('/3'));
        flushSync(() => form.options({ ...liveOptions, rootMargin: '40px' }));
      });
      expect(document.activeElement?.id).toBe('/3');
      expect(focus).toHaveBeenCalledTimes(1);
      expect(
        removed.mock.calls.filter(([type]) => type === 'focusin'),
      ).toHaveLength(1);
      expect(
        removed.mock.calls.filter(([type]) => type === 'focusout'),
      ).toHaveLength(1);
      expect(form.deferred()).toHaveLength(2);
    });

    it('settles a request when disabling reveals its gate, without leaving focus listeners', async () => {
      const form = mountVirtualization(strict);
      const added = vi.spyOn(document, 'addEventListener');
      const removed = vi.spyOn(document, 'removeEventListener');
      const focus = vi.spyOn(HTMLElement.prototype, 'focus');
      act(() => {
        startTransition(() => form.ref.current!.focus('/3'));
        flushSync(() => form.options(false));
      });
      await act(async () => {});
      expect(form.deferred()).toHaveLength(0);
      expect(document.activeElement?.id).toBe('/3');
      expect(focus).toHaveBeenCalledTimes(1);
      for (const type of ['focusin', 'focusout']) {
        const listener = added.mock.calls.find(
          ([event]) => event === type,
        )?.[1];
        expect(listener).toBeDefined();
        expect(
          removed.mock.calls.filter(
            ([event, fn]) => event === type && fn === listener,
          ),
        ).toHaveLength(1);
      }
    });
    it('releases a pending request when its gate is removed during an option change', async () => {
      const form = mountVirtualization(strict);
      const added = vi.spyOn(document, 'addEventListener');
      const removed = vi.spyOn(document, 'removeEventListener');
      const focus = vi.spyOn(HTMLElement.prototype, 'focus');
      act(() => {
        startTransition(() => form.ref.current!.focus('/3'));
        flushSync(() => {
          const node = form.ref.current!.node!;
          if (node.type !== 'array') throw new Error('Expected array');
          node.remove(3);
          form.options({ ...liveOptions, estimateHeight: 70 });
        });
      });
      await act(async () => {});
      expect(focus).not.toHaveBeenCalled();
      for (const type of ['focusin', 'focusout']) {
        const listener = added.mock.calls.find(
          ([event]) => event === type,
        )?.[1];
        expect(listener).toBeDefined();
        expect(
          removed.mock.calls.filter(
            ([event, fn]) => event === type && fn === listener,
          ),
        ).toHaveLength(1);
      }
    });
  },
);
