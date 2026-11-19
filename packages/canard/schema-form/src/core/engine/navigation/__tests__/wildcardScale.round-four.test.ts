import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

it('four times as many wildcard matches costs less than eight times the CPU', () => {
  const measure = (count: number) => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'array',
        items: { type: 'object', properties: { name: { type: 'string' } } },
      },
      defaultValue: Array.from({ length: count }, () => ({ name: 'n' })),
    });
    expect(root.findNodes('/*/name')).toHaveLength(count);
    const samples = Array.from({ length: 5 }, () => {
      const start = process.cpuUsage();
      root.findNodes('/*/name');
      const cpu = process.cpuUsage(start);
      return cpu.user + cpu.system;
    }).sort((a, b) => a - b);
    return samples[2];
  };
  const small = measure(5000),
    large = measure(20000);
  expect(large / small).toBeLessThan(8);
});

it('wildcard aliases preserve distinct node order and parent deduplication', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: { start: { type: 'string' }, end: { type: 'string' } },
      options: { virtual: { period: { fields: ['start', 'end'] } } },
    },
  });
  expect(root.findNodes('/*/*')).toEqual([
    root.find('/start'),
    root.find('/end'),
  ]);
  expect(root.findNodes('/*/..')).toEqual([root]);
});
