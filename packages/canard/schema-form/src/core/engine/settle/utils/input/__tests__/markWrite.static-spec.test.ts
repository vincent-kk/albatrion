import { describe, expect, it, vi } from 'vitest';

import { pinSlotShipping } from '../../../../../__tests__/fixtures/pinSlotShipping';
import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchWriteInput } from '../../../../write';
import * as specs from '../staticSpec';

describe('interpreted child static specs', () => {
  it.each(['all', 'one', 'equal'] as const)(
    'bounds N=1000 %s-key writes to N+1 lookups',
    (change) => {
      // Shipping static-spec lookup bounds exclude independent slot replay.
      pinSlotShipping();
      const count = 1000;
      const { root } = createDispatchTree({
        type: 'object',
        properties: Object.fromEntries(
          Array.from({ length: count }, (_, index) => [
            'k' + index,
            { type: 'number' },
          ]),
        ),
      });
      const input = Object.fromEntries(
        Array.from({ length: count }, (_, index) => ['k' + index, index]),
      );
      dispatchMount(root, input);
      const children = [...root.children!];
      const expected = Object.fromEntries(
        Array.from({ length: count }, (_, index) => [
          'k' + index,
          change === 'all' || (change === 'one' && index === 500)
            ? index + count
            : index,
        ]),
      );
      const strings = Object.fromEntries(
        Object.entries(expected).map(([key, value]) => [key, String(value)]),
      );
      const query = vi.spyOn(specs, 'staticSpec');
      let calls: number;
      try {
        dispatchWriteInput(root, strings);
        calls = query.mock.calls.length;
      } finally {
        query.mockRestore();
      }
      expect(root.emit).toEqual(expected);
      expect(
        root.children!.every((child, index) => child === children[index]),
      ).toBe(true);
      expect(calls).toBeLessThanOrEqual(count + 1);
    },
  );
});
