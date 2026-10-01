import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

// filid:contract factory-single-path
describe('round18 root output notification', () => {
  it('rootOutput.test.mjs:40 sends an empty object after clearing the final field', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'number' },
    } });
    root.setValue({ a: 1 });
    const values: unknown[] = [];
    Reflect.set(runtime, 'onChange', (value: unknown) => { values.push(value); });
    root.find('/a')?.setValue(undefined);
    expect(values).toEqual([{}]);
  });
});
