import { describe, expect, it } from 'vitest';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['A', 'B'], default: 'A' },
    items: { type: 'array', items: { type: 'string' } },
  },
  oneOf: [
    {
      controls: { active: "./type === 'A'" },
      properties: { fieldA: { type: 'string' } },
    },
    {
      controls: { active: "./type === 'B'" },
      properties: { fieldB: { type: 'number' } },
    },
  ],
} as const;

const run = (write: (root: any) => void) => {
  const { root } = build(schema, { type: 'A', items: [] });
  root.find('/fieldA').setValue('typed in A');
  root.find('/type').setValue('B');
  write(root);
  root.find('/type').setValue('A');
  return root.value;
};

describe('EQ2 the documented updater bulk write against a direct array write', () => {
  it('U1 setValue(prev => ({ ...prev, items })) keeps what the inactive branch retained', () => {
    const viaUpdater = run((root) =>
      root.setValue((prev: any) => ({ ...prev, items: ['x', 'y'] })),
    );
    const viaNode = run((root) => root.find('/items').setValue(['x', 'y']));
    diag('U1', { viaUpdater, viaNode });
    expect(viaUpdater).toEqual(viaNode);
  });
});
