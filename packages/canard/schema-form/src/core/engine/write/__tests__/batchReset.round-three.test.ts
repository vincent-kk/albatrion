import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { isArrayNode } from '@/schema-form/core/surface';

it('round-3: parent write followed by subtree reset equals sequential calls', () => {
  const run = (batch: boolean) => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          o: { type: 'object', properties: { a: { type: 'string' } } },
          s: { type: 'string' },
        },
      },
      defaultValue: { o: { a: 'loaded' }, s: 'loaded' },
    });
    const o = root.find('/o')!;
    let inside: unknown;
    const calls = () => {
      root.setValue({ o: { a: 'server' }, s: 'server' });
      o.resetSubtree();
      inside = o.value;
    };
    if (batch) root.batch(calls);
    else calls();
    return { inside, value: root.value };
  };
  expect(run(true)).toEqual(run(false));
});
it('round-3: array push then edited-item reset equals sequential calls', () => {
  const run = (batch: boolean) => {
    const root = nodeFromJSONSchema({
      jsonSchema: { type: 'array', items: { type: 'string' } },
      defaultValue: ['a', 'b'],
    });
    if (!isArrayNode(root)) throw new Error('Expected array');
    const item = root.children![0];
    item.setValue('EDITED');
    const calls = () => {
      root.push('c');
      item.resetSubtree();
    };
    if (batch) root.batch(calls);
    else calls();
    return root.value;
  };
  expect(run(true)).toEqual(run(false));
});
