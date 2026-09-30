import { describe, expect, it } from 'vitest';

import { blueprint } from '../../../blueprint';
import { SetValueOption } from '../../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../../index';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { getDeriveRuleTable } from '../index';

// filid:contract derive-boundary
describe('derive rule table', () => {
  it('SETTLE-043 caches occurrences and combines only authored watches', () => {
    const analysis = blueprint({ type: 'object', properties: {
      source: { type: 'string' }, watched: { type: 'string' }, other: { type: 'string' },
      target: { type: 'string', controls: {
        watch: ['../watched'], derived: '../source',
        unsetValue: '../other',
      } },
    } });
    const first = getDeriveRuleTable(analysis);
    expect(getDeriveRuleTable(analysis)).toBe(first);
    const derived = first.rules.find((rule) => rule.kind === 'derived');
    expect(derived?.dependencies).toEqual(['../source', '../watched']);
  });

  it('CONTROLS-019 a single-string watch joins no derived dependency set', () => {
    const analysis = blueprint({ type: 'object', properties: {
      source: { type: 'string' }, watched: { type: 'string' },
      target: { type: 'string', controls: { watch: '../watched', derived: '../source' } },
    } });
    const derived = getDeriveRuleTable(analysis).rules
      .find((rule) => rule.kind === 'derived');
    expect(derived?.dependencies).toEqual(['../source']);
  });

  it('SETTLE-017 shares an empty table across rule-free blueprints', () => {
    const first = getDeriveRuleTable(blueprint({ type: 'string' }));
    const second = getDeriveRuleTable(blueprint({ type: 'number' }));
    expect(first).toBe(second);
    expect(first.rules).toHaveLength(0);
  });
});

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

  it('ERROR-195 classifies an invalid derived virtual write the same way', () => {
    const { root } = createTestTree({ type: 'object', controls: {
      children: [{ targets: ['v'], controls: { derived: './source' } }],
    }, properties: { source: { type: 'string' }, real: { type: 'string' } },
    options: { virtual: { v: { fields: ['real'] } } } });
    expect(() => loadSchemaNodeAtMount(root, { source: 'A' },
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics.cause).toBe('writeShape');
    expect(root.structure?.source?.raw).toBe('A');
  });
});
