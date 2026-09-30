import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-gates
describe('throwing gate exit isolation', () => {
  it('ERROR-125 throwing gate preserves its exit while another clears and derive runs', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, source: { type: 'string' },
      bad: { type: 'object', properties: {
        child: { type: 'string' },
      }, controls: {
        active: '@.gate()', unsetOnInactive: true,
      } },
      other: { type: 'string', controls: {
        active: '../flag', unsetOnInactive: true,
      } },
      target: { type: 'string', controls: { derived: '../source' } },
    } });
    root.runtime.context = { gate: () => true };
    loadSchemaNodeAtMount(root, { flag: true, source: 'A', bad: { child: 'B' },
      other: 'O' }, SetValueOption.Overwrite);
    root.runtime.context = { gate: () => { throw new Error('gate'); } };
    expect(() => writeSchemaNode(root, { flag: false, source: 'C' },
      'callerPartial', SetValueOption.Merge)).toThrow('Gate evaluation failed');
    expect(root.structure?.bad).toBeUndefined();
    expect(root.structure?.other).toBeUndefined();
    expect(root.runtime.latentRaw.get(JSON.stringify(['/bad/child', 'string'])))
      .toBe('B');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/other', 'string'])))
      .toBe(false);
    expect(root.structure?.target?.raw).toBe('C');
  });
});
