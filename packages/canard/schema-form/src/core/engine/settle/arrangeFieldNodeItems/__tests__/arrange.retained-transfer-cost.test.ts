import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import * as cloning from '../../utils/slots/cloneSlotSubtree';
import * as raw from '../../utils/slots/readSlotRawTree';
import * as addresses from '../../utils/slots/rekeySlotWriteAddresses';

afterEach(() => vi.restoreAllMocks());

it.each(['insert', 'remove', 'shift'] as const)(
  'transfers same-template retained sources for %s with linear visits and no cloning or composition',
  (operation) => {
    const visits: number[] = [];
    for (const count of [4, 12]) {
      const { root } = createDispatchTree({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            open: { type: 'boolean' },
            value: { type: 'string', controls: { active: '../open' } },
          },
        },
      });
      dispatchMount(
        root,
        Array.from({ length: count }, (_, index) => ({
          open: true,
          value: String(index),
        })),
      );
      for (const item of root.children ?? [])
        dispatchSetValue(getDispatchNode(item, 'open'), false);
      const clone = vi.spyOn(cloning, 'cloneSlotSubtree');
      const compose = vi.spyOn(raw, 'readSlotRawTree');
      const rekey = vi.spyOn(addresses, 'rekeySlotWriteAddresses');
      if (operation === 'insert') dispatchInsert(root, 0, { open: false });
      else if (operation === 'remove') dispatchRemove(root, 0);
      else {
        const first = root.children?.[0]?.local;
        dispatchRemove(root, 0);
        dispatchInsert(root, count - 1, first);
      }
      expect(clone).not.toHaveBeenCalled();
      expect(compose).not.toHaveBeenCalled();
      expect(rekey.mock.calls.length).toBeGreaterThan(0);
      expect(rekey.mock.calls.length).toBeLessThanOrEqual(count * 4);
      visits.push(rekey.mock.calls.length);
      vi.restoreAllMocks();
    }
    expect(visits[1]).toBeLessThanOrEqual(visits[0] * 4);
  },
);
