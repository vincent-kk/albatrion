import { describe, expect, it } from 'vitest';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    a: { type: 'number' },
    d: { type: 'number', controls: { derived: '(../a ?? 0) * 2' } },
    grp: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        dx: { type: 'number', controls: { derived: '(../x ?? 0) + 1' } },
      },
    },
    qty: { type: 'number', default: 5 },
  },
} as const;

describe('EQ2 resetSubtree against a load for derived and default fields', () => {
  it('R1 resetSubtree of a derived field leaves it derived from its source', () => {
    const { root } = build(schema, { a: 3 });
    const loaded = root.find('/d').value;
    root.find('/d').setValue(100);
    root.find('/d').resetSubtree();
    diag('R1', { loaded, after: root.find('/d').value, value: root.value });
    expect(root.find('/d').value).toBe(loaded);
  });

  it('R2 resetSubtree of the source re-derives the target outside the scope', () => {
    const { root } = build(schema, { a: 3 });
    root.find('/a').setValue(10);
    root.find('/a').resetSubtree();
    diag('R2', root.value);
    expect(root.find('/d').value).toBe(6);
  });

  it('R3 resetSubtree of an object re-derives its own derived child', () => {
    const { root } = build(schema, { grp: { x: 1 } });
    const loaded = root.find('/grp').value;
    root.find('/grp/dx').setValue(50);
    root.find('/grp').resetSubtree();
    diag('R3', { loaded, after: root.find('/grp').value });
    expect(root.find('/grp').value).toEqual(loaded);
  });

  it('R4 resetSubtree of a defaulted field restores the default', () => {
    const { root } = build(schema, {});
    const loaded = root.find('/qty').value;
    root.find('/qty').setValue(9);
    root.find('/qty').resetSubtree();
    diag('R4', { loaded, after: root.find('/qty').value });
    expect(root.find('/qty').value).toBe(loaded);
  });
});
