import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-gates
describe('shared declaration conflicts', () => {
  it('26C-05 typeConflict commits the raw source then throws', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      value: { type: 'number' },
    }, if: {}, then: { properties: { value: { type: 'string' } } } });
    expect(() => writeSchemaNode(root, { enabled: true, value: 3 },
      'callerReplace', SetValueOption.Overwrite)).toThrow('Active declarations conflict');
    expect(root.raw).toBeUndefined();
    expect(root.extras).toEqual({ enabled: true });
    expect(root.structure?.value?.raw).toBe(3);
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded', cause: 'sharedConflict', commit: 1 });
  });

  it('26C-05 fold chooses first active kind and reports a gated collision', () => {
    const { root } = createTestTree({ type: 'object', allOf: [
      { controls: { active: 'true' }, properties: { shared: { type: 'number' } } },
      { controls: { active: 'true' }, properties: { shared: { type: 'string' } } },
    ] });
    expect(() => writeSchemaNode(root, { shared: 1 }, 'callerReplace', SetValueOption.Overwrite))
      .toThrow('Active declarations conflict');
    expect(root.structure?.shared?.blueprintNode.kind).toBe('number');
    expect(root.runtime.diagnostics.cause).toBe('sharedConflict');
  });
});
