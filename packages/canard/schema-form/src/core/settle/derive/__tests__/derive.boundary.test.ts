import { describe, expect, it, vi } from 'vitest';

import { blueprint } from '../../../blueprint';
import { SetValueOption } from '../../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../../index';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { getDeriveRuleTable } from '../index';
import { getDeriveSourceNodes } from '../utils/evaluate/utils/getDeriveSourceNodes';

// filid:contract derive-boundary
describe('derive rule table', () => {
  it('SETTLE-017 resolves source path aliases to one node', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      'a~b': { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { 'a~b': 'value' }, SetValueOption.Overwrite);
    const state = { sourcePaths: new Set(['/a~b', '/a~0b']) };
    expect(getDeriveSourceNodes(root, state)).toEqual([root.structure!['a~b']]);
  });

  it('SETTLE-017 builds rule expressions without per-rule array searches', () => {
    const analysis = blueprint({ type: 'object', properties: {
      source: { type: 'string' },
      target: { type: 'string', controls: { derived: '../source' } },
    } });
    const find = vi.spyOn(Array.prototype, 'find');
    try {
      expect(getDeriveRuleTable(analysis).rules).toHaveLength(1);
      expect(find.mock.contexts.filter((target) =>
        target === analysis.expressions)).toHaveLength(0);
    } finally {
      find.mockRestore();
    }
  });

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
  it('ERROR-122 throwing derived leaves fills and later derive rounds running', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'string', default: 'fill-a' },
      source: { type: 'string' },
      d: { type: 'string', controls: { derived: '../source' } },
      e: { type: 'string', controls: { derived: '../d' } },
      bad: { type: 'string', controls: {
        derived: '(() => { throw new Error("bad derive") })()',
      } },
    } });
    expect(() => loadSchemaNodeAtMount(root, { source: 'D' },
      SetValueOption.Overwrite)).toThrow('Derive expression failed');
    expect(root.structure?.a?.raw).toBe('fill-a');
    expect(root.structure?.d?.raw).toBe('D');
    expect(root.structure?.e?.raw).toBe('D');
    expect(root.runtime.diagnostics.cause).toBe('expression');
  });

  it('ERROR-122 missing dynamic injectTo target leaves unrelated fill running', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'string', default: 'fill-a' },
      trigger: { type: 'string', controls: {
        injectTo: () => ({ '../missing': 'X' }),
      } },
    } });
    expect(() => loadSchemaNodeAtMount(root, { trigger: 'go' },
      SetValueOption.Overwrite)).toThrow('Injection target missing');
    expect(root.structure?.a?.raw).toBe('fill-a');
    expect(root.runtime.diagnostics.cause).toBe('injectTarget');
  });

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
