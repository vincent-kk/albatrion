import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { SetValueOption } from '@/schema-form/core/surface';

const create = () =>
  nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        o: {
          type: 'object',
          properties: {
            a: {
              type: 'object',
              properties: { x: { type: 'number' }, y: { type: 'number' } },
            },
            b: { type: 'number' },
          },
        },
        s: { type: 'string' },
      },
    },
    defaultValue: { o: { a: { x: 1, y: 2 }, b: 1 }, s: 's' },
  });

const compare = (calls: (root: ReturnType<typeof create>) => void) => {
  const sequential = create();
  const batched = create();
  calls(sequential);
  batched.batch(() => calls(batched));
  expect(batched.value).toEqual(sequential.value);
};

it('round-3: nested Merge and an unrelated write equal sequential writes', () =>
  compare((root) => {
    root.find('/o')!.setValue({ a: { x: 9 } }, SetValueOption.Merge);
    root.find('/s')!.setValue('t');
  }));

it('stores the first own getter result in a merged batch input', () => {
  const root = create();
  let reads = 0;
  const input = {
    get x() {
      return ++reads;
    },
  };

  root.batch(() => {
    root.find('/o/a')!.setValue(input, SetValueOption.Merge);
    root.find('/s')!.setValue('t');
  });

  expect(root.value).toEqual({ o: { a: { x: 1, y: 2 }, b: 1 }, s: 't' });
  expect(reads).toBe(1);
});

it('round-3: two nested Merge writes equal sequential writes', () =>
  compare((root) => {
    root.find('/o')!.setValue({ a: { x: 9 } }, SetValueOption.Merge);
    root.find('/o')!.setValue({ b: 5 }, SetValueOption.Merge);
  }));
it('round-3: an updater after nested Merge sees the retained nested keys', () =>
  compare((root) => {
    root.find('/o')!.setValue({ a: { x: 9 } }, SetValueOption.Merge);
    root
      .find('/o')!
      .setValue((previous: unknown) => previous, SetValueOption.Merge);
  }));
it('round-3: nested Merge through visitSubtree equals sequential writes', () => {
  const sequential = create();
  const visited = create();
  sequential.find('/o')!.setValue({ a: { x: 9 } }, SetValueOption.Merge);
  sequential.find('/s')!.setValue('t');
  visited.visitSubtree((node) => {
    if (node.path === '/o')
      node.setValue({ a: { x: 9 } }, SetValueOption.Merge);
    if (node.path === '/s') node.setValue('t');
  });
  expect(visited.value).toEqual(sequential.value);
});
it('round-3: one nested Merge remains equivalent to its non-batched form', () =>
  compare((root) => {
    root.find('/o')!.setValue({ a: { x: 9 } }, SetValueOption.Merge);
  }));

it('round-3: nested Merge retains inactive sources exactly as sequential Merge', () => {
  const run = (batch: boolean) => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          o: {
            type: 'object',
            properties: {
              a: {
                type: 'object',
                properties: {
                  kind: { type: 'string', default: 'A' },
                  n: { type: 'number' },
                },
                oneOf: [
                  {
                    controls: { active: './kind === "A"' },
                    properties: { saved: { type: 'string' } },
                  },
                  {
                    controls: { active: './kind === "B"' },
                    properties: { other: { type: 'string' } },
                  },
                ],
              },
            },
          },
          s: { type: 'string' },
        },
      },
    });
    root.find('/o/a/saved')!.setValue('retained');
    root.find('/o/a/kind')!.setValue('B');
    const calls = () => {
      root.find('/o')!.setValue({ a: { n: 9 } }, SetValueOption.Merge);
      root.find('/s')!.setValue('t');
    };
    if (batch) root.batch(calls);
    else calls();
    root.find('/o/a/kind')!.setValue('A');
    return root.value;
  };
  expect(run(true)).toEqual(run(false));
});
