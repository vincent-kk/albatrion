import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '../makeFieldNodeTree';

// filid:contract factory-single-path
describe('round18 root output notification', () => {
  it('rootOutput.test.mjs:40 sends an empty object after clearing the final field', () => {
    const { root, runtime } = makeFieldNodeTree({
      type: 'object',
      properties: {
        a: { type: 'number' },
      },
    });
    root.setValue({ a: 1 });
    const values: unknown[] = [];
    Reflect.set(runtime, 'onChange', (value: unknown) => {
      values.push(value);
    });
    root.find('/a')?.setValue(undefined);
    expect(values).toEqual([{}]);
  });
});
