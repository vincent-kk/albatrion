import { describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../../types/value';
import { loadSchemaNodeAtMount, resetSchemaNodeSubtree,
  writeSchemaNode } from '../../index';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';

// filid:contract derive-rank
describe('injectTo and same-target settlement', () => {
  it('SETTLE-004 kind rank prefers unsetValue, then derived, then injectTo', () => {
    const injectTo = vi.fn(() => ({ '../target': 'injected' }));
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo } },
      clear: { type: 'boolean' },
      target: { type: 'string', controls: {
        derived: '../source + " derived"', unsetValue: '../clear',
      } },
    } });
    loadSchemaNodeAtMount(root, { source: 'A', clear: false }, SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
    expect(root.structure?.target?.raw).toBe('A derived');
    writeSchemaNode(root.structure!.target, 'manual', 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    expect(injectTo).toHaveBeenCalledOnce();
    writeSchemaNode(root.structure!.clear, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBeUndefined();
  });

  it('SETTLE-004 document order chooses the later source node', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      first: { type: 'string', controls: { injectTo: () => ({ '../target': 'first' }) } },
      second: { type: 'string', controls: { injectTo: () => ({ '../target': 'second' }) } },
      target: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { first: 'A', second: 'B' }, SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('second');
    writeSchemaNode(root, { first: 'C', second: 'D' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('second');
  });

  it('SETTLE-004 layer chooses node controls over a children item', () => {
    const { root } = createTestTree({ type: 'object', controls: {
      children: [{ targets: ['source'], controls: {
        derived: './seed + " children"',
      } }],
    }, properties: {
      seed: { type: 'string' },
      source: { type: 'string', controls: { derived: '../seed + " node"' } },
    } });
    loadSchemaNodeAtMount(root, { seed: 'A' }, SetValueOption.Overwrite);
    expect(root.structure?.source?.raw).toBe('A node');
  });

  it('SETTLE-004 fragment order chooses the later fragment declaration', () => {
    const { root } = createTestTree({ type: 'object', allOf: [
      { controls: { derived: './seed + " first"' },
        properties: { target: { type: 'string' } } },
      { controls: { derived: './seed + " second"' },
        properties: { target: { type: 'string' } } },
    ], properties: { seed: { type: 'string' } } });
    loadSchemaNodeAtMount(root, { seed: 'A' }, SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('A second');
  });

  it('SETTLE-004 settle unit keeps a prior higher kind across rounds', () => {
    const injectTo = vi.fn(() => ({ '../target': 'late injection' }));
    const { root } = createTestTree({ type: 'object', properties: {
      seed: { type: 'string' },
      source: { type: 'string', controls: {
        derived: '../seed', injectTo,
      } },
      target: { type: 'string', controls: { derived: '../seed' } },
    } });
    loadSchemaNodeAtMount(root, { seed: 'A' }, SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalled();
    expect(root.structure?.target?.raw).toBe('A');
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('CONTROLS-079 ctx supplies the emitted round tree and eight named fields', () => {
    const injectTo = vi.fn((value: unknown, ctx: Record<string, unknown>) => {
      expect(value).toBe('A');
      expect(Object.keys(ctx)).toEqual([
        'dataPath', 'schemaPath', 'jsonSchema', 'parentValue',
        'parentJSONSchema', 'rootValue', 'rootJSONSchema', 'context',
      ]);
      return { '../target': ctx.context };
    });
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo } },
      target: { type: 'object' },
    } });
    const context = { locale: 'ko' };
    root.runtime.context = context;
    loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
    const ctx: Record<string, unknown> = injectTo.mock.calls[0][1];
    expect(ctx).toMatchObject({ dataPath: '/source',
      schemaPath: root.structure?.source?.blueprintNode.schemaPath,
      jsonSchema: expect.objectContaining({ type: 'string' }),
      parentValue: { source: 'A' },
      parentJSONSchema: expect.objectContaining({ type: 'object' }),
      rootValue: { source: 'A' },
      rootJSONSchema: expect.objectContaining({ type: 'object' }), context });
    expect(root.structure?.target?.emit).toEqual(context);
  });

  it('CONTROLS-079 undefined entry skips values and uses the last array pair', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo: () => [
        ['../target', 'first'], ['../target', undefined], ['../target', 'last'],
      ] } }, target: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('last');
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('CONTROLS-079 target missing consumes the edge and degrades after commit', () => {
    const injectTo = vi.fn(() => ({ '../absent': 'X' }));
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo } },
    } });
    expect(() => loadSchemaNodeAtMount(root, { source: 'A' },
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'injectTarget', commit: 1 });
    expect(root.structure?.source?.raw).toBe('A');
    writeSchemaNode(root.structure!.source, 'A', 'input', SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
  });

  it('CONTROLS-053 latent target receives injection before it becomes active', () => {
    const injectTo = vi.fn(() => ({ '../target': 'latent' }));
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' },
      source: { type: 'string', controls: { injectTo } },
      target: { type: 'string', controls: { active: '../enabled' } },
    } });
    loadSchemaNodeAtMount(root, { enabled: false, source: 'A' }, SetValueOption.Overwrite);
    expect(root.structure?.target).toBeUndefined();
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('latent');
    expect(injectTo).toHaveBeenCalledOnce();
  });

  it('CONTROLS-054 inactive source does not call injectTo', () => {
    const injectTo = vi.fn(() => ({ '../target': 'injected' }));
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' },
      source: { type: 'string', controls: { active: '../enabled', injectTo } },
      target: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { enabled: false, source: 'A' }, SetValueOption.Overwrite);
    expect(injectTo).not.toHaveBeenCalled();
    expect(root.structure?.target?.raw).toBeUndefined();
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
    expect(root.structure?.target?.raw).toBe('injected');
  });

  it('SETTLE-049 injectTo scope follows the reset source, even across its boundary', () => {
    const injectTo = vi.fn(() => ({ '../../target': 'injected' }));
    const { root } = createTestTree({ type: 'object', properties: {
      group: { type: 'object', properties: {
        source: { type: 'string', controls: { injectTo } },
      } }, target: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { group: { source: 'A' } }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.target, 'manual', 'input', SetValueOption.Overwrite);
    resetSchemaNodeSubtree(root.structure!.group, SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('injected');
    expect(injectTo).toHaveBeenCalledTimes(2);
  });

  it('VALUE-032 null ancestor remains null after user-triggered injectTo', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: {
        injectTo: () => ({ '../box/target': 'injected' }),
      } },
      box: { type: ['object', 'null'], properties: { target: { type: 'string' } } },
    } });
    loadSchemaNodeAtMount(root, { source: 'A', box: null }, SetValueOption.Overwrite);
    expect(root.structure?.box?.raw).toBeNull();
    writeSchemaNode(root.structure!.source, 'B', 'input', SetValueOption.Overwrite);
    expect(root.structure?.box?.raw).toBeNull();
    expect(root.structure?.box?.structure?.target?.raw).toBe('injected');
    expect(root.emit).toEqual({ source: 'B' });
  });

  it('ERROR-195 writeShape degrades an invalid automatic virtual write', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string', controls: {
        injectTo: () => ({ '../v': 'invalid' }),
      } }, real: { type: 'string' },
    }, options: { virtual: { v: { fields: ['real'] } } } });
    expect(() => loadSchemaNodeAtMount(root, { source: 'A' },
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'writeShape', commit: 1 });
    expect(root.structure?.source?.raw).toBe('A');
  });
});
