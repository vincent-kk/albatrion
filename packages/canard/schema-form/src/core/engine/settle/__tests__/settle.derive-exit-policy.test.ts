import { describe, expect, it } from 'vitest';

import { FieldNodeState } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-derive-exit-policy
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
      [FieldNodeState.Edited]: true,
      [FieldNodeState.Touched]: true,
    };
    writeFieldNode(target, 'b', 'input', WriteOption.Overwrite);
    expect(target.raw).toBe('b');
    expect(target.interactionState[FieldNodeState.Edited]).toBe(true);
  });
});
