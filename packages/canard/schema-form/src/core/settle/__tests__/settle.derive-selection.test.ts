import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('active derive declarations', () => {
  it('SETTLE-049 keeps an inactive shared declaration from firing on a sibling edit', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, source: { type: 'string' },
      target: { type: 'string' },
    }, allOf: [{ controls: { active: './flag' }, properties: {
      target: { type: 'string', controls: { derived: '../source' } },
    } }] });
    loadSchemaNodeAtMount(root, { flag: false, source: 'A', target: 'manual' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.source, 'B', 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('B');
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.source, 'C', 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('B');
  });
});
