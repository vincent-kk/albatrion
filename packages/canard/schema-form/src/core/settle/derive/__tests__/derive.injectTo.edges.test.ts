import { describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../../types/value';
import { loadSchemaNodeAtMount, resetSchemaNodeSubtree,
  writeSchemaNode } from '../../index';
import { INJECT_TARGET_MISSING, INVALID_VIRTUAL_NODE_VALUES } from
  '../../utils/errors/settleErrorCode';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';

// filid:contract derive-edge
describe('injectTo edge boundaries', () => {
  it('CONTROLS-079 null return consumes its source edge', () => {
    const injectTo = vi.fn((value: unknown) => value === 'A' ? null :
      value === 'B' ? undefined : { '../target': value });
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo } },
      target: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.source, 'A', 'input', SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
    expect(root.structure?.target?.raw).toBeUndefined();
    writeSchemaNode(root.structure!.source, 'B', 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBeUndefined();
    expect(injectTo).toHaveBeenCalledTimes(2);
    writeSchemaNode(root.structure!.source, 'C', 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('C');
    expect(injectTo).toHaveBeenCalledTimes(3);
  });

  it('CONTROLS-079 rejects a target below a terminal', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: {
        injectTo: () => ({ '../source/child': 'X' }),
      } },
    } });
    let caught: unknown;
    try {
      loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    } catch (error) { caught = error; }
    expect(caught).toMatchObject({ code: `SCHEMA_FORM_ERROR.${INJECT_TARGET_MISSING}` });
    expect(root.runtime.diagnostics.cause).toBe('injectTarget');
  });

  it('CONTROLS-079 rejects the context token as a target', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo: () => ({ '@': 'X' }) } },
    } });
    expect(() => loadSchemaNodeAtMount(root, { source: 'A' },
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics.cause).toBe('injectTarget');
  });

  it('CONTROLS-079 drops only the failed rule and applies another candidate', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      invalid: { type: 'string', controls: {
        injectTo: () => ({ '../absent': 'X' }),
      } },
      valid: { type: 'string', controls: {
        injectTo: () => ({ '../target': 'written' }),
      } },
      target: { type: 'string' },
    } });
    expect(() => loadSchemaNodeAtMount(root, { invalid: 'A', valid: 'B' },
      SetValueOption.Overwrite)).toThrow();
    expect(root.structure?.target?.raw).toBe('written');
    expect(root.runtime.diagnostics.cause).toBe('injectTarget');
  });

  it('CONTROLS-079 drops every entry from one failed return', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo: () => ({
        '../target': 'discard', '../absent': 'error',
      }) } }, target: { type: 'string' },
    } });
    expect(() => loadSchemaNodeAtMount(root, { source: 'A' },
      SetValueOption.Overwrite)).toThrow();
    expect(root.structure?.target?.raw).toBeUndefined();
    expect(root.runtime.diagnostics.cause).toBe('injectTarget');
  });

  it('ERROR-122 commits the source after an injectTo function throws', () => {
    const injectTo = vi.fn(() => { throw new Error('boom'); });
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo } },
    } });
    expect(() => loadSchemaNodeAtMount(root, { source: 'A' },
      SetValueOption.Overwrite)).toThrow('Derive expression failed');
    expect(root.structure?.source?.raw).toBe('A');
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'expression', commit: 1 });
    writeSchemaNode(root.structure!.source, 'A', 'input', SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
  });

  it('CONTROLS-079 root ctx has null parent fields', () => {
    const injectTo = vi.fn((_value: unknown, ctx: Record<string, unknown>) => {
      expect(ctx.parentValue).toBeNull();
      expect(ctx.parentJSONSchema).toBeNull();
      return { './target': 'root' };
    });
    const { root } = createTestTree({ type: 'object', controls: { injectTo },
      properties: { target: { type: 'string' } } });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalledTimes(2);
    expect(root.structure?.target?.raw).toBe('root');
  });

  it('WRITE-015 suppress injectTo consumes the load edge', () => {
    const injectTo = vi.fn(() => ({ '../target': 'automatic' }));
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo } },
      target: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { source: 'A', target: 'manual' },
      SetValueOption.DisableAutomaticWrites);
    expect(root.structure?.target?.raw).toBe('manual');
    writeSchemaNode(root.structure!.source, 'A', 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    expect(injectTo).toHaveBeenCalledOnce();
  });

  it('SETTLE-049 reset outside the source leaves its injection dormant', () => {
    const injectTo = vi.fn(() => ({ '../group/target': 'injected' }));
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo } },
      group: { type: 'object', properties: { target: { type: 'string' } } },
    } });
    loadSchemaNodeAtMount(root, { source: 'A', group: {} }, SetValueOption.Overwrite);
    resetSchemaNodeSubtree(root.structure!.group, SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
    expect(root.structure?.group?.structure?.target?.raw).toBeUndefined();
  });

  it('SETTLE-049 excludes an ancestor source outside the reset scope', () => {
    const injectTo = vi.fn(() => ({ '../target': 'injected' }));
    const { root } = createTestTree({ type: 'object', properties: {
      group: { type: 'object', controls: { injectTo }, properties: {
        child: { type: 'string' },
      } }, target: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { group: { child: 'A' } }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.group.structure!.child, 'B',
      'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.target, 'manual', 'input', SetValueOption.Overwrite);
    const before = injectTo.mock.calls.length;
    resetSchemaNodeSubtree(root.structure!.group.structure!.child,
      SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalledTimes(before);
    expect(root.structure?.target?.raw).toBe('manual');
  });

  it('ERROR-195 accepts a correctly sized virtual tuple', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: {
        injectTo: () => ({ '../v': ['written'] }),
      } }, real: { type: 'string' },
    }, options: { virtual: { v: { fields: ['real'] } } } });
    loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    expect(root.structure?.real?.raw).toBe('written');
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('ERROR-195 exposes the automatic virtual write error code', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: {
        injectTo: () => ({ '../v': null }),
      } }, real: { type: 'string' },
    }, options: { virtual: { v: { fields: ['real'] } } } });
    let caught: unknown;
    try {
      loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    } catch (error) { caught = error; }
    expect(caught).toMatchObject({ code: `SCHEMA_FORM_ERROR.${INVALID_VIRTUAL_NODE_VALUES}` });
    expect(root.runtime.diagnostics.cause).toBe('writeShape');
  });

  it('29C-01 SETTLE-005 fill re-enters derive so a born source fires again with its default', () => {
    const injectTo = vi.fn((value: unknown) => ({ '../t': `from-${value}` }));
    const { root } = createTestTree({ type: 'object', properties: {
      c: { type: 'string', default: 'C', controls: { injectTo } },
      t: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
    expect(injectTo.mock.calls.map(([value]) => value)).toEqual([undefined, 'C']);
    expect(root.structure?.t?.raw).toBe('from-C');
  });

  it('CONTROLS-073 reborn target kind starts its children derived edge anew', () => {
    const { root } = createTestTree({ type: 'object', controls: {
      children: [{ targets: ['target'], controls: { derived: './source' } }],
    }, properties: {
      enabled: { type: 'boolean' }, source: { type: 'number' },
    }, if: { required: ['enabled'] },
    then: { properties: { target: { type: ['number', 'string'],
      controls: { unsetOnInactive: 'false' } } } },
    else: { properties: { target: { type: 'number',
      controls: { unsetOnInactive: 'false' } } } },
    });
    loadSchemaNodeAtMount(root, { source: 10 }, SetValueOption.Overwrite);
    const oldTarget = root.structure!.target;
    expect(oldTarget.blueprintNode.kind).toBe('number');
    const oldKey = [...root.runtime.committedRuleValues?.keys() ?? []]
      .find((key) => key.includes('"/target","number"'));
    expect(oldKey).toBeDefined();
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    const newTarget = root.structure!.target;
    expect(newTarget).not.toBe(oldTarget);
    expect(newTarget.blueprintNode.kind).toBe('union');
    expect(newTarget.raw).toBe(10);
    expect([...root.runtime.committedRuleValues?.keys() ?? []]).not.toContain(oldKey);
    expect([...root.runtime.committedRuleValues?.keys() ?? []].some((key) =>
      key.includes('/derived') && key.includes('"/target","union"'))).toBe(true);
  });

  it('SETTLE-043 active kind watch extends only the live target dependency tuple', () => {
    const { root } = createTestTree({ type: 'object', controls: {
      children: [{ targets: ['target'], controls: { derived: './source' } }],
    }, properties: {
      flag: { type: 'boolean' }, source: { type: 'number' },
      a: { type: 'string' }, b: { type: 'string' },
    }, if: { required: ['flag'] },
    then: { properties: {
      target: { type: 'string', controls: { watch: ['../a'] } },
    } }, else: { properties: {
      target: { type: 'number', controls: { watch: ['../b'] } },
    } } });
    loadSchemaNodeAtMount(root, { source: 10, a: 'A', b: 'B' },
      SetValueOption.Overwrite);
    const target = root.structure!.target;
    expect(target.blueprintNode.kind).toBe('number');
    writeSchemaNode(target, 99, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.a, 'changed', 'input', SetValueOption.Overwrite);
    expect(target.raw).toBe(99);
    writeSchemaNode(root.structure!.b, 'C', 'input', SetValueOption.Overwrite);
    expect(target.raw).toBe(10);
  });
});
