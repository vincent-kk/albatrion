import { describe, expect, it } from 'vitest';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    factor: { type: 'number', default: 1 },
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          n: { type: 'number', default: 1 },
          scaled: { type: 'number', controls: { derived: '(../n ?? 0) * (/factor ?? 1)' } },
          shown: { type: 'string', controls: { visible: '/factor > 0' } },
        },
      },
    },
  },
} as const;

const timeFactorWrites = (root: any, count: number) => {
  const factor = root.find('/factor');
  const start = performance.now();
  for (let i = 0; i < count; i++) factor.setValue(i + 2);
  return performance.now() - start;
};

describe('[measurement] LC4 removed items do not keep costing later writes', () => {
  it('writes to an outer dependency cost the same after 3,000 items came and went', () => {
    const fresh = build(schema, { list: [{ n: 1 }] }).root;
    timeFactorWrites(fresh, 200);
    const freshMs = timeFactorWrites(fresh, 2000);

    const churned = build(schema, { list: [{ n: 1 }] }).root;
    const list = churned.find('/list');
    for (let i = 0; i < 3000; i++) {
      list.push({ n: i });
      list.pop();
    }
    for (let i = 0; i < 30; i++) {
      list.setValue(Array.from({ length: 100 }, (_, k) => ({ n: k })));
      list.setValue([{ n: 1 }]);
    }
    timeFactorWrites(churned, 200);
    const churnedMs = timeFactorWrites(churned, 2000);
    const ratio = churnedMs / freshMs;
    diag('churnCost', { freshMs, churnedMs, ratio, value: churned.find('/list').value });
    expect(ratio).toBeLessThan(2);
  });
});
