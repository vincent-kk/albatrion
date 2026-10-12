import { describe, expect, it } from 'vitest';

import { NodeState } from '../../types/state';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('derive baseline alongside exit policy', () => {
  it('SETTLE-004 exit-policy commit preserves the resetInteraction baseline', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      clear: { type: 'boolean' }, f: { type: 'boolean' },
      g: { type: 'string', controls: {
        active: '../f', unsetOnInactive: '../f !== true',
      } },
      target: { type: 'string', controls: { resetInteraction: '../clear' } },
    } });
    loadSchemaNodeAtMount(root, { clear: true, f: true, target: 'a' },
      SetValueOption.Overwrite);
    const target = root.structure!.target;
    target.interactionState = { [NodeState.Dirty]: true, [NodeState.Touched]: true };
    writeSchemaNode(target, 'b', 'input', SetValueOption.Overwrite);
    expect(target.raw).toBe('b');
    expect(target.interactionState[NodeState.Dirty]).toBe(true);
  });
});
