import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';

// filid:contract settle-array
describe('array projection carryovers', () => {
  it('26C-03 VALUE-034 keeps omitTrailing source slots after a load', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      tail: { type: 'array', items: { type: 'string' },
        options: { omitTrailing: true } },
    } }, { snapshot: { tail: ['a', null, null] } });
    root.resetSubtree();
    expect(root.outputValue).toEqual({ tail: ['a'] });
    expect(root.find('/tail')?.children?.map((item) => item.raw))
      .toEqual(['a', null, null]);
    expect(root.find('/tail')?.children).toHaveLength(3);
  });

  it('rootOutput:13 VALUE-034 emits an empty root array after load', () => {
    const { root } = makeSchemaNodeTree({ type: 'array',
      items: { type: 'string' } }, { snapshot: [] });
    root.resetSubtree();
    expect(root.value).toEqual([]);
    expect(root.outputValue).toEqual([]);
  });

  it('rootOutput:24 VALUE-034 fills an absent leaf slot with null', () => {
    const { root } = makeSchemaNodeTree({ type: 'array',
      items: { type: 'string' } }, { snapshot: [undefined, 'x'] });
    root.resetSubtree();
    expect(root.value).toEqual([null, 'x']);
    expect(root.outputValue).toEqual([null, 'x']);
  });

  it('rootOutput:30 VALUE-034 retains empty object item slots', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: { a: { type: 'number' } },
      options: { omitEmpty: false },
    } }, { snapshot: [{}, { a: 1 }, {}] });
    root.resetSubtree();
    expect(root.value).toEqual([{}, { a: 1 }, {}]);
    expect(root.outputValue).toEqual([{}, { a: 1 }, {}]);
  });

  it('rootOutput:30 VALUE-034 trims only the trailing empty leaf slot', () => {
    const { root } = makeSchemaNodeTree({ type: 'array',
      items: { type: 'string' }, options: { omitTrailing: true },
    }, { snapshot: [undefined, 'x', undefined] });
    root.resetSubtree();
    expect(root.outputValue).toEqual([null, 'x']);
    expect(root.children?.map((item) => item.raw))
      .toEqual([undefined, 'x', undefined]);
  });
});
