import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '../makeFieldNodeTree';

// filid:contract factory-single-path
describe('round9 edge-case controls under the current local policy', () => {
  it('edge-cases.mjs:49 CONTROLS-042 outer fragment does not lock a nested branch', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        kind: { type: 'string' },
      },
      allOf: [
        {
          controls: { readOnly: true },
          if: { properties: { kind: { const: 'yes' } }, required: ['kind'] },
          then: { properties: { a: { type: 'string' } } },
          else: { properties: { b: { type: 'string' } } },
        },
      ],
    });
    root.setValue({ kind: 'no', b: 'B' });
    expect(root.find('/b')?.isReadOnly).toBe(false);
  });

  it('edge-cases.mjs:66 CONTROLS-045 GOAL-048 local readOnly stays true without Form lock', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      readOnly: true,
      properties: {
        x: { type: 'string', readOnly: true, controls: { readOnly: false } },
      },
    });
    root.setValue({ x: 'X' });
    expect(root.find('/x')?.isReadOnly).toBe(true);
  });

  it('edge-cases.mjs:67 CONTROLS-045 GOAL-048 root disabled does not inherit', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      controls: { disabled: true },
      properties: {
        x: { type: 'string', controls: { disabled: false } },
      },
    });
    root.setValue({ x: 'X' });
    expect(root.isDisabled).toBe(true);
    expect(root.find('/x')?.isDisabled).toBe(false);
  });
});
