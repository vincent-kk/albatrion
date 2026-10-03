import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

// filid:contract factory-single-path
describe('round18 root output regression', () => {
  it('rootOutput.test.mjs:7 keeps the empty object root container', () => {
    const { root } = makeSchemaNodeTree({ type: 'object' });
    root.setValue({});
    expect(root.outputValue).toEqual({});
  });

  it('rootOutput.test.mjs:19 omits an empty nested object unless opted out', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      hidden: { type: 'object' },
      kept: { type: 'object', options: { omitEmpty: false } },
    } });
    root.setValue({ hidden: {}, kept: {} });
    expect(root.outputValue).toEqual({ kept: {} });
    expect(root.find('/hidden')?.raw).toBeUndefined();
    expect(root.find('/kept')?.raw).toBeUndefined();
  });
});
