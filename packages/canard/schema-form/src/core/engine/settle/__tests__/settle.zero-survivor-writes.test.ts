import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import { DetachedWriteAddress } from '../utils/detached/DetachedWriteAddress';
import * as slotWriter from '../utils/slots/writeSlotPath';
import { getDispatchNode } from './fixtures/getDispatchNode';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-zero-survivor-discard
it.each([false, true])(
  'drops zero-survivor latent writes with keep declarations=%s',
  (declaredKeep) => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: 'array',
          controls: { active: '#/open', unsetOnInactive: true },
          items: {
            type: 'object',
            properties: {
              drop: { type: 'number' },
              ...(declaredKeep
                ? {
                    keep: {
                      type: 'number' as const,
                      controls: { unsetOnInactive: false },
                    },
                  }
                : {}),
            },
          },
        },
        kept: {
          type: 'number',
          controls: { active: '#/open', unsetOnInactive: false },
        },
      },
    });
    dispatchMount(root, { open: true, list: [{ drop: 1 }], kept: 2 });
    const item = getDispatchNode(root, 'list', '0');
    const child = getDispatchNode(root, 'list', '0', 'drop');
    const kept = getDispatchNode(root, 'kept');
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    const writer = vi.spyOn(slotWriter, 'writeSlotPath');
    dispatchSetValue(kept, 3);
    expect(writer).toHaveBeenCalledTimes(1);
    writer.mockClear();
    dispatchSetValue(child, 99);
    dispatchSetValue(item, { drop: 100 });
    expect(writer).not.toHaveBeenCalled();
    expect(DetachedWriteAddress.read(item)).toMatchObject({ discarded: true });
    expect(DetachedWriteAddress.read(child)).toMatchObject({ discarded: true });
  },
);
