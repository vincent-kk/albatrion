import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../../index';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';

// filid:contract derive-edge
describe('derive expression failures', () => {
  it('ERROR-122 commits caller input and degrades after a derived throw', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      target: { type: 'string', controls: {
        derived: '(() => { throw new Error("boom") })()',
      } },
    } });
    expect(() => loadSchemaNodeAtMount(root, { target: 'X' },
      SetValueOption.Overwrite)).toThrow('Derive expression failed');
    expect(root.structure?.target?.raw).toBe('X');
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'expression', commit: 1 });
    expect(() => writeSchemaNode(root.structure!.target, 'X', 'callerReplace',
      SetValueOption.Overwrite)).not.toThrow();
  });

  it('ERROR-122 drops a thrown unsetValue candidate and retains caller input', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      target: { type: 'string', controls: {
        unsetValue: '(() => { throw new Error("boom") })()',
      } },
    } });
    expect(() => loadSchemaNodeAtMount(root, { target: 'X' },
      SetValueOption.Overwrite)).toThrow('Derive expression failed');
    expect(root.structure?.target?.raw).toBe('X');
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'expression', commit: 1 });
  });
});
