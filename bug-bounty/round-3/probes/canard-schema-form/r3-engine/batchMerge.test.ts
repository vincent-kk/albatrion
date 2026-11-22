import { describe, expect, it } from 'vitest';

import { SetValueOption } from '@/schema-form';

import { attempt, build, diag } from './probeHelpers';

const schema = {
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
} as const;

const start = { o: { a: { x: 1, y: 2 }, b: 1 }, s: 's' };

/** Run the same calls with and without an enclosing batch on the root. */
const both = (calls: (root: any) => void) => {
  const results: Record<string, unknown> = {};
  for (const mode of ['sequential', 'batch'] as const) {
    const { root } = build(schema, start);
    const thrown = attempt(() =>
      mode === 'batch' ? root.batch(() => calls(root)) : calls(root),
    );
    results[mode] = { value: root.value, thrown: thrown && String(thrown) };
  }
  return results as Record<'sequential' | 'batch', { value: unknown }>;
};

describe('EQ2 Merge writes inside a batch', () => {
  it('M0 one nested Merge write alone', () => {
    const r = both((root) => {
      root.find('/o').setValue({ a: { x: 9 } }, SetValueOption.Merge);
    });
    diag('M0', r);
    expect(r.batch.value).toEqual(r.sequential.value);
  });

  it('M1 nested Merge write plus an unrelated sibling write', () => {
    const r = both((root) => {
      root.find('/o').setValue({ a: { x: 9 } }, SetValueOption.Merge);
      root.find('/s').setValue('t');
    });
    diag('M1', r);
    expect(r.batch.value).toEqual(r.sequential.value);
  });

  it('M2 two Merge writes on the same object', () => {
    const r = both((root) => {
      root.find('/o').setValue({ a: { x: 9 } }, SetValueOption.Merge);
      root.find('/o').setValue({ b: 5 }, SetValueOption.Merge);
    });
    diag('M2', r);
    expect(r.batch.value).toEqual(r.sequential.value);
  });

  it('M4 the same two writes from a visitSubtree visitor', () => {
    const run = (visit: boolean) => {
      const { root } = build(schema, start);
      const write = (node: any) => {
        if (node.path === '/o')
          node.setValue({ a: { x: 9 } }, SetValueOption.Merge);
        if (node.path === '/s') node.setValue('t');
      };
      if (visit) root.visitSubtree(write);
      else for (const path of ['/o', '/s']) write(root.find(path));
      return root.value;
    };
    const visited = run(true);
    const plain = run(false);
    diag('M4', { visited, plain });
    expect(visited).toEqual(plain);
  });

  it('M3 updater after a nested Merge sees what the Merge will settle to', () => {
    const seen: unknown[] = [];
    const r = both((root) => {
      root.find('/o').setValue({ a: { x: 9 } }, SetValueOption.Merge);
      root.find('/o/b').setValue((prev: unknown) => {
        seen.push(JSON.parse(JSON.stringify(root.find('/o').value)));
        return prev;
      });
    });
    diag('M3', { r, seen });
    expect(r.batch.value).toEqual(r.sequential.value);
  });
});
