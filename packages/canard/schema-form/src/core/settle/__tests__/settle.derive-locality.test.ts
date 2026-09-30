import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('derive rule locality', () => {
  it('SETTLE-047 leaves an unrelated branch unread on a leaf input', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      left: { type: 'object', properties: {
        source: { type: 'string' },
        target: { type: 'string', controls: { derived: '../source' } },
      } },
      right: { type: 'object', properties: {
        value: { type: 'string' },
      } },
    } });
    loadSchemaNodeAtMount(root, { left: { source: 'A' }, right: { value: 'R' } },
      SetValueOption.Overwrite);
    const right = root.structure!.right;
    Object.defineProperty(right, 'children', {
      configurable: true,
      get: () => { throw new Error('unrelated branch traversed'); },
    });
    writeSchemaNode(root.structure!.left.structure!.source, 'B',
      'input', SetValueOption.Overwrite);
    expect(root.structure?.left?.structure?.target?.raw).toBe('B');
  });
});
