import { describe, expect, it, vi } from 'vitest';

import { createTestTree } from '@/schema-form/core/engine/settle/__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '@/schema-form/core/engine/settle/utils/load/loadFieldNodeAtMount';
import { resetFieldNodeSubtree } from '@/schema-form/core/engine/settle/utils/load/resetFieldNodeSubtree';
import { writeFieldNode } from '@/schema-form/core/engine/settle/utils/write/writeFieldNode';
import { WriteOption } from '@/schema-form/core/engine/types/value';

// filid:contract derive-rank
describe('injectTo and same-target settlement', () => {
  it('SETTLE-004 kind rank prefers unsetValue, then derived, then injectTo', () => {
    const injectTo = vi.fn(() => ({ '../target': 'injected' }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string', controls: { injectTo } },
        clear: { type: 'boolean' },
        target: {
          type: 'string',
          controls: {
            derived: '../source + " derived"',
            unsetValue: '../clear',
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 'A', clear: false },
      WriteOption.Overwrite,
    );
    expect(injectTo).toHaveBeenCalledOnce();
    expect(root.structure?.target?.raw).toBe('A derived');
    writeFieldNode(
      root.structure!.target,
      'manual',
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.raw).toBe('manual');
    expect(injectTo).toHaveBeenCalledOnce();
    writeFieldNode(root.structure!.clear, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBeUndefined();
  });

  it('SETTLE-004 document order chooses the later source node', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        first: {
          type: 'string',
          controls: { injectTo: () => ({ '../target': 'first' }) },
        },
        second: {
          type: 'string',
          controls: { injectTo: () => ({ '../target': 'second' }) },
        },
        target: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { first: 'A', second: 'B' },
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.raw).toBe('second');
    writeFieldNode(
      root,
      { first: 'C', second: 'D' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.raw).toBe('second');
  });

  it('SETTLE-004 layer chooses node controls over a fields entry', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [
          {
            targets: ['source'],
            controls: {
              derived: './seed + " children"',
            },
          },
        ],
      },
      properties: {
        seed: { type: 'string' },
        source: { type: 'string', controls: { derived: '../seed + " node"' } },
      },
    });
    loadFieldNodeAtMount(root, { seed: 'A' }, WriteOption.Overwrite);
    expect(root.structure?.source?.raw).toBe('A node');
  });

  it('SETTLE-004 layer chooses a fields entry over a later fragment', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [
          {
            targets: ['target'],
            controls: {
              derived: './seed + " children"',
            },
          },
        ],
      },
      properties: { seed: { type: 'string' } },
      allOf: [
        {
          controls: { derived: './seed + " fragment"' },
          properties: { target: { type: 'string' } },
        },
      ],
    });
    loadFieldNodeAtMount(root, { seed: 'A' }, WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('A children');
  });

  it('SETTLE-004 fragment order chooses the later fragment declaration', () => {
    const { root } = createTestTree({
      type: 'object',
      allOf: [
        {
          controls: { derived: './seed + " first"' },
          properties: { target: { type: 'string' } },
        },
        {
          controls: { derived: './seed + " second"' },
          properties: { target: { type: 'string' } },
        },
      ],
      properties: { seed: { type: 'string' } },
    });
    loadFieldNodeAtMount(root, { seed: 'A' }, WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('A second');
  });

  it('SETTLE-004 settle unit keeps a prior higher kind across rounds', () => {
    const injectTo = vi.fn(() => ({ '../target': 'late injection' }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        seed: { type: 'string' },
        source: {
          type: 'string',
          controls: {
            derived: '../seed',
            injectTo,
          },
        },
        target: { type: 'string', controls: { derived: '../seed' } },
      },
    });
    loadFieldNodeAtMount(root, { seed: 'A' }, WriteOption.Overwrite);
    expect(injectTo).toHaveBeenCalled();
    expect(root.structure?.target?.raw).toBe('A');
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('CONTROLS-079 ctx supplies the emitted round tree and eight named fields', () => {
    const injectTo = vi.fn((value: unknown, ctx: Record<string, unknown>) => {
      expect(value).toBe('A');
      expect(Object.keys(ctx)).toEqual([
        'dataPath',
        'schemaPath',
        'jsonSchema',
        'parentValue',
        'parentJSONSchema',
        'rootValue',
        'rootJSONSchema',
        'context',
      ]);
      return { '../target': ctx.context };
    });
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string', controls: { injectTo } },
        target: { type: 'object' },
      },
    });
    const context = { locale: 'ko' };
    root.runtime.context = context;
    loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
    const ctx: Record<string, unknown> = injectTo.mock.calls[0][1];
    expect(ctx).toMatchObject({
      dataPath: '/source',
      schemaPath: root.structure?.source?.blueprintNode.schemaPath,
      jsonSchema: expect.objectContaining({ type: 'string' }),
      parentValue: { source: 'A' },
      parentJSONSchema: expect.objectContaining({ type: 'object' }),
      rootValue: { source: 'A' },
      rootJSONSchema: expect.objectContaining({ type: 'object' }),
      context,
    });
    expect(root.structure?.target?.emit).toEqual(context);
  });

  it('CONTROLS-079 undefined entry skips values and uses the last array pair', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: {
          type: 'string',
          controls: {
            injectTo: () => [
              ['../target', 'first'],
              ['../target', undefined],
              ['../target', 'last'],
            ],
          },
        },
        target: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('last');
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('CONTROLS-079 target missing consumes the edge and degrades after commit', () => {
    const injectTo = vi.fn(() => ({ '../absent': 'X' }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string', controls: { injectTo } },
      },
    });
    expect(() =>
      loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite),
    ).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'injectTarget',
      commit: 1,
    });
    expect(root.structure?.source?.raw).toBe('A');
    writeFieldNode(root.structure!.source, 'A', 'input', WriteOption.Overwrite);
    expect(injectTo).toHaveBeenCalledOnce();
  });

  it('CONTROLS-053 latent target receives injection before it becomes active', () => {
    const injectTo = vi.fn(() => ({ '../target': 'latent' }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        source: { type: 'string', controls: { injectTo } },
        target: { type: 'string', controls: { active: '../enabled' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { enabled: false, source: 'A' },
      WriteOption.Overwrite,
    );
    expect(root.structure?.target).toBeUndefined();
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.raw).toBe('latent');
    expect(injectTo).toHaveBeenCalledOnce();
  });

  it('CONTROLS-054 inactive source does not call injectTo', () => {
    const injectTo = vi.fn(() => ({ '../target': 'injected' }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        source: {
          type: 'string',
          controls: { active: '../enabled', injectTo },
        },
        target: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { enabled: false, source: 'A' },
      WriteOption.Overwrite,
    );
    expect(injectTo).not.toHaveBeenCalled();
    expect(root.structure?.target?.raw).toBeUndefined();
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(injectTo).toHaveBeenCalledOnce();
    expect(root.structure?.target?.raw).toBe('injected');
  });

  it('SETTLE-049 injectTo scope follows the reset source, even across its boundary', () => {
    const injectTo = vi.fn(() => ({ '../../target': 'injected' }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        group: {
          type: 'object',
          properties: {
            source: { type: 'string', controls: { injectTo } },
          },
        },
        target: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { group: { source: 'A' } },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.target,
      'manual',
      'input',
      WriteOption.Overwrite,
    );
    resetFieldNodeSubtree(root.structure!.group, WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('injected');
    expect(injectTo).toHaveBeenCalledTimes(2);
  });

  it('VALUE-032 null ancestor remains null after user-triggered injectTo', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: {
          type: 'string',
          controls: {
            injectTo: () => ({ '../box/target': 'injected' }),
          },
        },
        box: {
          type: ['object', 'null'],
          properties: { target: { type: 'string' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 'A', box: null },
      WriteOption.Overwrite,
    );
    expect(root.structure?.box?.raw).toBeNull();
    writeFieldNode(root.structure!.source, 'B', 'input', WriteOption.Overwrite);
    expect(root.structure?.box?.raw).toBeNull();
    expect(root.structure?.box?.structure?.target?.raw).toBe('injected');
    expect(root.emit).toEqual({ source: 'B', box: null });
  });

  it('ERROR-195 writeShape degrades an invalid automatic virtual write', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: {
          type: 'string',
          controls: {
            injectTo: () => ({ '../v': 'invalid' }),
          },
        },
        real: { type: 'string' },
      },
      options: { virtual: { v: { fields: ['real'] } } },
    });
    expect(() =>
      loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite),
    ).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'writeShape',
      commit: 1,
    });
    expect(root.structure?.source?.raw).toBe('A');
  });
});
