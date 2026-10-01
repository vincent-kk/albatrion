import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-budget
describe('expression failures with a derive budget', () => {
  it('29C-02 derive budget overrides a pending ERROR-122 expression failure', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      left: { type: 'number', controls: { derived: '../right + 1' } },
      right: { type: 'number', controls: { derived: '../left + 1' } },
      bad: { type: 'string', controls: {
        derived: '(() => { throw new Error("bad derive") })()',
      } },
    } });
    expect(() => loadSchemaNodeAtMount(root, { left: 0, right: 0 },
      SetValueOption.Overwrite)).toThrow('budget');
    expect(root.emit).toEqual({ left: 0, right: 0 });
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'budget', exceededBudget: 'derive', iterations: 25 });
  });
});
