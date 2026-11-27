import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

const tree = () =>
  nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'x' },
        z: { type: 'string' },
        w: { type: 'string', controls: { watch: ['../a'] } },
      },
    },
    defaultValue: {},
  } as never) as any;

describe('watchValues identity across commits', () => {
  it('returns the same array after a commit that leaves the watched values equal', () => {
    const root = tree();
    const w = root.find('/w');
    const first = w.watchValues;
    root.find('/z').setValue('q');
    expect(w.watchValues).toEqual(['x']);
    expect(w.watchValues).toBe(first);
  });

  it('returns a new array once a watched value changes', () => {
    const root = tree();
    const w = root.find('/w');
    const first = w.watchValues;
    root.find('/z').setValue('q');
    root.find('/a').setValue('y');
    expect(w.watchValues).toEqual(['y']);
    expect(w.watchValues).not.toBe(first);
  });
});
