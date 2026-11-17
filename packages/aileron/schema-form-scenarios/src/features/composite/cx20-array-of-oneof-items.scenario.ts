import type { CompositeCase } from './types';

/** Blocks of text, image or quote, each its own oneOf item. */
const blocksSchema = {
  type: 'object',
  properties: {
    blocks: { type: 'array', items: {
      type: 'object', controls: { discriminator: 'kind' }, required: ['kind'],
      oneOf: [
        { properties: { kind: { const: 'text' }, body: { type: 'string' } } },
        { properties: { kind: { const: 'image' }, src: { type: 'string' } } },
        { properties: { kind: { const: 'quote' }, body: { type: 'string' }, by: { type: 'string' } } },
      ],
    } },
  },
};

/** CX-20: items with different branches keep branch, value and identity through remove, update and pop. */
export const cx20ArrayOfOneofItems: CompositeCase = {
  scenario: {
    name: 'composite.cx20-array-of-oneof-items',
    description: 'Each array item resolves its own branch; removing the middle item shifts the last one with its branch, value and node identity (NODE-051); update replaces one item with another kind; pop drops the last item.',
    schema: blocksSchema,
    initialValue: { blocks: [{ kind: 'text', body: 'hi' }, { kind: 'image', src: 'a.png' }, { kind: 'quote', body: 'q', by: 'me' }] },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/blocks/0/body': 'present', '/blocks/1/src': 'present', '/blocks/2/by': 'present' } } },
      { action: 'remove', path: '/blocks', index: 1, expect: {
        identity: { '/blocks/1': '/blocks/2' }, shape: { '/blocks/1/by': 'present', '/blocks/1/src': 'absent' }, values: { '/blocks/1/by': 'me' },
      } },
      { action: 'update', path: '/blocks', index: 0, value: { kind: 'image', src: 'b.png' }, expect: {
        shape: { '/blocks/0/src': 'present', '/blocks/0/body': 'absent' }, values: { '/blocks/0/src': 'b.png' },
      } },
      { action: 'pop', path: '/blocks', expect: { values: { '/blocks': [{ kind: 'image', src: 'b.png' }] } } },
    ],
  },
};
