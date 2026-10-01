import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

// filid:contract factory-single-path
describe('round9 edge-case controls under the current local policy', () => {
  it('edge-cases.mjs:49 CONTROLS-042 outer fragment does not lock a nested branch', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      kind: { type: 'string' },
    }, allOf: [{ controls: { readOnly: true }, if: {},
      then: { properties: { a: { type: 'string' } } },
      else: { properties: { b: { type: 'string' } } },
    }] }, { ifPredicate: () => input => input !== null &&
      typeof input === 'object' && 'kind' in input && input.kind === 'yes' });
    root.setValue({ kind: 'no', b: 'B' });
    expect(root.find('/b')?.readOnly).toBe(false);
  });

  it('edge-cases.mjs:66 CONTROLS-045 GOAL-048 local readOnly stays true without Form lock', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', readOnly: true,
      properties: { x: { type: 'string', readOnly: true,
        controls: { readOnly: false } } },
    });
    root.setValue({ x: 'X' });
    expect(root.find('/x')?.readOnly).toBe(true);
  });

  it('edge-cases.mjs:67 CONTROLS-045 GOAL-048 root disabled does not inherit', () => {
    const { root } = makeSchemaNodeTree({ type: 'object',
      controls: { disabled: true }, properties: {
        x: { type: 'string', controls: { disabled: false } },
      },
    });
    root.setValue({ x: 'X' });
    expect(root.disabled).toBe(true);
    expect(root.find('/x')?.disabled).toBe(false);
  });
});
