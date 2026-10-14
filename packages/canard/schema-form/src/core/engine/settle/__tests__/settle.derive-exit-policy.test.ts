import { describe, expect, it } from 'vitest';

import { FieldNodeState } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { loadFieldNodeAtMount } from '../utils/load/loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('derive baseline alongside exit policy', () => {
  it('SETTLE-004 exit-policy commit preserves the resetInteraction baseline', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        clear: { type: 'boolean' },
        f: { type: 'boolean' },
        g: {
          type: 'string',
          controls: {
            active: '../f',
            unsetOnInactive: '../f !== true',
          },
        },
        target: { type: 'string', controls: { resetInteraction: '../clear' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { clear: true, f: true, target: 'a' },
      WriteOption.Overwrite,
    );
    const target = root.structure!.target;
    target.interactionState = {
      [FieldNodeState.Dirty]: true,
      [FieldNodeState.Touched]: true,
    };
    writeFieldNode(target, 'b', 'input', WriteOption.Overwrite);
    expect(target.raw).toBe('b');
    expect(target.interactionState[FieldNodeState.Dirty]).toBe(true);
  });
});
