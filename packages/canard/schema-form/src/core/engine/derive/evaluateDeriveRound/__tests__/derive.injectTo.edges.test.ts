import { describe, expect, it, vi } from 'vitest';

import { createTestTree } from '@/schema-form/core/engine/__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '@/schema-form/core/engine/settle';
import { resetFieldNodeSubtree } from '@/schema-form/core/engine/settle';
import { writeFieldNode } from '@/schema-form/core/engine/settle';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import { FormErrorCode } from '@/schema-form/errors';

// filid:contract derive-edge
describe('injectTo edge boundaries', () => {
  it('CONTROLS-079 null return consumes its source edge', () => {
    const injectTo = vi.fn((value: unknown) =>
      value === 'A' ? null : value === 'B' ? undefined : { '../target': value },
    );
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string', controls: { injectTo } },
        target: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    writeFieldNode(root.structure!.source, 'A', 'input', WriteOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
    expect(root.structure?.target?.raw).toBeUndefined();
    writeFieldNode(root.structure!.source, 'B', 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBeUndefined();
    expect(injectTo).toHaveBeenCalledTimes(2);
    writeFieldNode(root.structure!.source, 'C', 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('C');
    expect(injectTo).toHaveBeenCalledTimes(3);
  });

  it('CONTROLS-079 rejects a target below a terminal', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: {
          type: 'string',
          controls: {
            injectTo: () => ({ '../source/child': 'X' }),
          },
        },
      },
    });
    let caught: unknown;
    try {
      loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    } catch (error) {
      caught = error;
    }
    expect(caught).toMatchObject({
      code: FormErrorCode.InjectTargetMissing,
    });
    expect(root.runtime.diagnostics.cause).toBe('injectTarget');
  });

  it('CONTROLS-079 rejects the context token as a target', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: {
          type: 'string',
          controls: { injectTo: () => ({ '@': 'X' }) },
        },
      },
    });
    expect(() =>
      loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite),
    ).toThrow();
    expect(root.runtime.diagnostics.cause).toBe('injectTarget');
  });

  it('CONTROLS-079 drops only the failed rule and applies another candidate', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        invalid: {
          type: 'string',
          controls: {
            injectTo: () => ({ '../absent': 'X' }),
          },
        },
        valid: {
          type: 'string',
          controls: {
            injectTo: () => ({ '../target': 'written' }),
          },
        },
        target: { type: 'string' },
      },
    });
    expect(() =>
      loadFieldNodeAtMount(
        root,
        { invalid: 'A', valid: 'B' },
        WriteOption.Overwrite,
      ),
    ).toThrow();
    expect(root.structure?.target?.raw).toBe('written');
    expect(root.runtime.diagnostics.cause).toBe('injectTarget');
  });

  it('CONTROLS-079 drops every entry from one failed return', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: {
          type: 'string',
          controls: {
            injectTo: () => ({
              '../target': 'discard',
              '../absent': 'error',
            }),
          },
        },
        target: { type: 'string' },
      },
    });
    expect(() =>
      loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite),
    ).toThrow();
    expect(root.structure?.target?.raw).toBeUndefined();
    expect(root.runtime.diagnostics.cause).toBe('injectTarget');
  });

  it('ERROR-122 commits the source after an injectTo function throws', () => {
    const injectTo = vi.fn(() => {
      throw new Error('boom');
    });
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string', controls: { injectTo } },
      },
    });
    expect(() =>
      loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite),
    ).toThrow('Derive expression failed');
    expect(root.structure?.source?.raw).toBe('A');
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'expression',
      commit: 1,
    });
    writeFieldNode(root.structure!.source, 'A', 'input', WriteOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
  });

  it('CONTROLS-079 root ctx has null parent fields', () => {
    const injectTo = vi.fn((_value: unknown, ctx: Record<string, unknown>) => {
      expect(ctx.parentValue).toBeNull();
      expect(ctx.parentJSONSchema).toBeNull();
      return { './target': 'root' };
    });
    const { root } = createTestTree({
      type: 'object',
      controls: { injectTo },
      properties: { target: { type: 'string' } },
    });
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    expect(injectTo).toHaveBeenCalledTimes(2);
    expect(root.structure?.target?.raw).toBe('root');
  });

  it('WRITE-015 suppress injectTo consumes the load edge', () => {
    const injectTo = vi.fn(() => ({ '../target': 'automatic' }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string', controls: { injectTo } },
        target: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 'A', target: 'manual' },
      WriteOption.DisableAutomaticWrites,
    );
    expect(root.structure?.target?.raw).toBe('manual');
    writeFieldNode(root.structure!.source, 'A', 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    expect(injectTo).toHaveBeenCalledOnce();
  });

  it('SETTLE-049 reset outside the source leaves its injection dormant', () => {
    const injectTo = vi.fn(() => ({ '../group/target': 'injected' }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string', controls: { injectTo } },
        group: { type: 'object', properties: { target: { type: 'string' } } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 'A', group: {} },
      WriteOption.Overwrite,
    );
    resetFieldNodeSubtree(root.structure!.group, WriteOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
    expect(root.structure?.group?.structure?.target?.raw).toBeUndefined();
  });

  it('SETTLE-049 excludes an ancestor source outside the reset scope', () => {
    const injectTo = vi.fn(() => ({ '../target': 'injected' }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        group: {
          type: 'object',
          controls: { injectTo },
          properties: {
            child: { type: 'string' },
          },
        },
        target: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { group: { child: 'A' } },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.group.structure!.child,
      'B',
      'input',
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.target,
      'manual',
      'input',
      WriteOption.Overwrite,
    );
    const before = injectTo.mock.calls.length;
    resetFieldNodeSubtree(
      root.structure!.group.structure!.child,
      WriteOption.Overwrite,
    );
    expect(injectTo).toHaveBeenCalledTimes(before);
    expect(root.structure?.target?.raw).toBe('manual');
  });

  it('ERROR-195 accepts a correctly sized virtual tuple', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: {
          type: 'string',
          controls: {
            injectTo: () => ({ '../v': ['written'] }),
          },
        },
        real: { type: 'string' },
      },
      options: { virtual: { v: { fields: ['real'] } } },
    });
    loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    expect(root.structure?.real?.raw).toBe('written');
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('ERROR-195 exposes the automatic virtual write error code', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: {
          type: 'string',
          controls: {
            injectTo: () => ({ '../v': null }),
          },
        },
        real: { type: 'string' },
      },
      options: { virtual: { v: { fields: ['real'] } } },
    });
    let caught: unknown;
    try {
      loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    } catch (error) {
      caught = error;
    }
    expect(caught).toMatchObject({
      code: FormErrorCode.InvalidVirtualNodeValues,
    });
    expect(root.runtime.diagnostics.cause).toBe('writeShape');
  });

  it('29C-01 SETTLE-005 fill re-enters derive so a born source fires again with its default', () => {
    const injectTo = vi.fn((value: unknown) => ({ '../t': `from-${value}` }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        c: { type: 'string', default: 'C', controls: { injectTo } },
        t: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    expect(injectTo.mock.calls.map(([value]) => value)).toEqual([
      undefined,
      'C',
    ]);
    expect(root.structure?.t?.raw).toBe('from-C');
  });

  it('CONTROLS-073 reborn target kind starts its fields derived edge anew', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['target'], controls: { derived: './source' } }],
      },
      properties: {
        enabled: { type: 'boolean' },
        source: { type: 'number' },
      },
      if: { required: ['enabled'] },
      then: {
        properties: {
          target: {
            type: ['number', 'string'],
            controls: { unsetOnInactive: 'false' },
          },
        },
      },
      else: {
        properties: {
          target: { type: 'number', controls: { unsetOnInactive: 'false' } },
        },
      },
    });
    loadFieldNodeAtMount(root, { source: 10 }, WriteOption.Overwrite);
    const oldTarget = root.structure!.target;
    expect(oldTarget.blueprintNode.kind).toBe('number');
    const oldKey = [...(root.runtime.committedRuleValues?.keys() ?? [])].find(
      (key) => key.includes('"/target","number"'),
    );
    expect(oldKey).toBeDefined();
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    const newTarget = root.structure!.target;
    expect(newTarget).not.toBe(oldTarget);
    expect(newTarget.blueprintNode.kind).toBe('union');
    expect(newTarget.raw).toBe(10);
    expect([...(root.runtime.committedRuleValues?.keys() ?? [])]).not.toContain(
      oldKey,
    );
    expect(
      [...(root.runtime.committedRuleValues?.keys() ?? [])].some(
        (key) =>
          key.includes('/derived') && key.includes('"/target","union:3"'),
      ),
    ).toBe(true);
  });

  it('SETTLE-043 active kind watch extends only the live target dependency tuple', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['target'], controls: { derived: './source' } }],
      },
      properties: {
        flag: { type: 'boolean' },
        source: { type: 'number' },
        a: { type: 'string' },
        b: { type: 'string' },
      },
      if: { required: ['flag'] },
      then: {
        properties: {
          target: { type: 'string', controls: { watch: ['../a'] } },
        },
      },
      else: {
        properties: {
          target: { type: 'number', controls: { watch: ['../b'] } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 10, a: 'A', b: 'B' },
      WriteOption.Overwrite,
    );
    const target = root.structure!.target;
    expect(target.blueprintNode.kind).toBe('number');
    writeFieldNode(target, 99, 'input', WriteOption.Overwrite);
    writeFieldNode(
      root.structure!.a,
      'changed',
      'input',
      WriteOption.Overwrite,
    );
    expect(target.raw).toBe(99);
    writeFieldNode(root.structure!.b, 'C', 'input', WriteOption.Overwrite);
    expect(target.raw).toBe(10);
  });
});
