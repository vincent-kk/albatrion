import { expect, it, vi } from 'vitest';

import { blueprint } from '../blueprint';

/** Real child construction is observed at its existing recursive boundary. */
const work = vi.hoisted(() => ({ inputs: 0, keys: [] as string[] }));

vi.mock('../utils/analyze/populateNodeChildren', async (importOriginal) => {
  const original = await importOriginal<
    typeof import('../utils/analyze/populateNodeChildren')
  >();
  return {
    populateNodeChildren: (
      ...args: Parameters<typeof original.populateNodeChildren>
    ) => {
      const [context, node, build] = args;
      return original.populateNodeChildren(context, node, (context, inputs, path) => {
        work.inputs += inputs.length;
        work.keys = Object.keys(inputs[0]);
        return build(context, inputs, path);
      });
    },
  };
});

it('builds each ungated child input once with the authored field order', () => {
  work.inputs = 0;
  const result = blueprint({
    type: 'object',
    properties: { first: { type: 'string' }, second: { type: 'number' } },
  });
  expect(work.inputs).toBe(2);
  expect(result.root.childEntries.map(entry => entry.name)).toEqual(['first', 'second']);
  expect(work.keys).toEqual([
    'context', 'gates', 'inherited', 'hostPath', 'fragment', 'role',
    'schema', 'schemaPath', 'order',
  ]);
});
