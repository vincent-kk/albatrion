import { describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { blueprint } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import { PathKeyedSet } from '@/schema-form/core/engine/utils/pathIndex/PathKeyedSet';
import { fieldNodeFactory } from '@/schema-form/core/surface';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

/** Create a runtime surface tree for commit-scoped getter checks. */
const createSurfaceTree = (schema: BlueprintSchema) =>
  fieldNodeFactory(blueprint(schema), {
    context: {},
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,

    misfitPaths: new PathKeyedSet(),
  });

// filid:contract settle-state-keys
describe('settled controls', () => {
  it('CONTROLS-082 readOnly OR keeps a true parent item over own false', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['field'], controls: { readOnly: true } }],
      },
      properties: { field: { type: 'string', controls: { readOnly: false } } },
    });
    loadFieldNodeAtMount(root, { field: 'a' }, WriteOption.Overwrite);
    expect(root.structure?.field?.readOnly).toBe(true);
  });

  it('CONTROLS-082 disabled OR keeps a true own key over parent false', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['field'], controls: { disabled: false } }],
      },
      properties: { field: { type: 'string', controls: { disabled: true } } },
    });
    loadFieldNodeAtMount(root, { field: 'a' }, WriteOption.Overwrite);
    expect(root.structure?.field?.disabled).toBe(true);
  });

  it('CONTROLS-082 visible AND combines false across declaration positions', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['field'], controls: { visible: false } }],
      },
      properties: { field: { type: 'string', controls: { visible: true } } },
    });
    loadFieldNodeAtMount(root, { field: 'a' }, WriteOption.Overwrite);
    expect(root.structure?.field?.visible).toBe(false);
  });

  it('CONTROLS-082 standard readOnly is OR merged with controls', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        field: {
          type: 'string',
          readOnly: true,
          controls: { readOnly: false },
        },
      },
    });
    loadFieldNodeAtMount(root, { field: 'a' }, WriteOption.Overwrite);
    expect(root.structure?.field?.readOnly).toBe(true);
  });

  it('CONTROLS-073 fields entry expression uses its host for every target', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['a', 'b'], controls: { disabled: './lock' } }],
      },
      properties: {
        lock: { type: 'boolean' },
        a: { type: 'string' },
        b: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { lock: true, a: 'a', b: 'b' },
      WriteOption.Overwrite,
    );
    expect(root.structure?.a?.disabled).toBe(true);
    expect(root.structure?.b?.disabled).toBe(true);
  });

  it('state key expressions follow a later dependency change', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['target'], controls: { disabled: './flag' } }],
      },
      properties: {
        flag: { type: 'boolean' },
        target: { type: 'string', controls: { visible: '../flag' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: false, target: 't' },
      WriteOption.Overwrite,
    );
    expect([
      root.structure?.target?.visible,
      root.structure?.target?.disabled,
    ]).toEqual([false, false]);
    writeFieldNode(
      root.structure!.flag,
      true,
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect([
      root.structure?.target?.visible,
      root.structure?.target?.disabled,
    ]).toEqual([true, true]);
  });

  it('fragment visible follows its dependency but ignores an unrelated leaf write', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        x: { type: 'boolean' },
        unrelated: { type: 'string' },
      },
      allOf: [
        {
          controls: { visible: '../x' },
          properties: {
            child: { type: 'string' },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { x: false, unrelated: 'a', child: 'c' },
      WriteOption.Overwrite,
    );
    expect(root.structure?.child?.visible).toBe(false);
    writeFieldNode(
      root.structure!.x,
      true,
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.child?.visible).toBe(true);
    writeFieldNode(
      root.structure!.unrelated,
      'b',
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.child?.visible).toBe(true);
  });

  it('state keys visit no fragment children for an unrelated leaf write', () => {
    const allOf = Array.from({ length: 64 }, (_, index) => ({
      controls: { visible: true },
      properties: { [`fragment${index}`]: { type: 'string' as const } },
    }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        unrelated: { type: 'string' },
      },
      allOf,
    });
    loadFieldNodeAtMount(
      root,
      {
        unrelated: 'a',
        ...Object.fromEntries(
          allOf.map((_, index) => [`fragment${index}`, 'value']),
        ),
      },
      WriteOption.Overwrite,
    );
    let publishedChildren = 0;
    for (let index = 0; index < allOf.length; index += 1) {
      const child = root.structure?.[`fragment${index}`];
      expect(child).toBeDefined();
      let visible = child!.visible;
      Object.defineProperty(child, 'visible', {
        configurable: true,
        get: () => visible,
        set: (value: boolean) => {
          publishedChildren += 1;
          visible = value;
        },
      });
    }
    writeFieldNode(
      root.structure!.unrelated,
      'b',
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(publishedChildren).toBe(0);
  });

  it('CONTROLS-042 fragment scope reaches only directly declared children', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        outside: { type: 'string' },
      },
      allOf: [
        {
          controls: { visible: false },
          properties: {
            inside: { type: 'string' },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { inside: 'i', outside: 'o' },
      WriteOption.Overwrite,
    );
    expect(root.structure?.inside?.visible).toBe(false);
    expect(root.structure?.outside?.visible).toBe(true);
  });

  it('CONTROLS-045 no root inheritance keeps root state local', () => {
    const { root } = createTestTree({
      type: 'object',
      readOnly: true,
      controls: { disabled: true, visible: false },
      properties: {
        child: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(root, { child: 'c' }, WriteOption.Overwrite);
    expect([root.readOnly, root.disabled, root.visible]).toEqual([
      true,
      true,
      false,
    ]);
    expect([
      root.structure?.child?.readOnly,
      root.structure?.child?.disabled,
      root.structure?.child?.visible,
    ]).toEqual([false, false, true]);
  });

  it('CONTROLS-083 locked writes still apply caller and derived values', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        target: {
          type: 'string',
          controls: {
            readOnly: true,
            disabled: true,
            derived: '../source',
          },
        },
      },
    });
    loadFieldNodeAtMount(root, { source: 'a' }, WriteOption.Overwrite);
    expect([
      root.structure?.target?.readOnly,
      root.structure?.target?.disabled,
    ]).toEqual([true, true]);
    expect(root.structure?.target?.raw).toBe('a');
    writeFieldNode(
      root.structure!.target,
      'manual',
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.raw).toBe('manual');
    writeFieldNode(
      root.structure!.source,
      'b',
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.raw).toBe('b');
  });

  it('28C-07 watchValues reads effective watch paths and memoizes a commit; CONTROLS-019 a single-string watch is not a watch', () => {
    const root = createSurfaceTree({
      type: 'object',
      $defs: {
        watched: { type: 'string', controls: { watch: ['../second'] } },
      },
      properties: {
        first: { type: 'string' },
        second: { type: 'string' },
        target: { $ref: '#/$defs/watched', controls: { watch: ['../first'] } },
        single: { type: 'string', controls: { watch: '../first' } },
      },
    });
    root.setValue({ first: 'a', second: 'b', target: 't' });
    const target = root.find('/target');
    expect(target?.watchValues).toEqual(['b']);
    expect(target?.watchValues).toBe(target?.watchValues);
    expect(root.find('/single')?.watchValues).toEqual([]);
    root.find('/second')?.setValue('c');
    expect(target?.watchValues).toEqual(['c']);
  });

  it('LANDING-137 watchValues omitEmpty sees an omitted empty string', () => {
    const root = createSurfaceTree({
      type: 'object',
      properties: {
        source: { type: 'string', options: { omitEmpty: true } },
        target: { type: 'string', controls: { watch: ['../source'] } },
      },
    });
    root.setValue({ source: '', target: 't' });
    expect(root.find('/source')?.value).toBe('');
    expect(root.find('/target')?.watchValues).toEqual([undefined]);
  });

  it('28C-02 detached frozen retains state reads after an ancestor changes', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        shown: { type: 'boolean' },
        branch: {
          type: 'object',
          controls: { active: '../shown' },
          properties: {
            child: {
              type: 'string',
              controls: {
                visible: '!#/shown',
                readOnly: '#/shown',
                disabled: '#/shown',
              },
            },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { shown: true, branch: { child: 'c' } },
      WriteOption.Overwrite,
    );
    const child = root.structure!.branch.structure!.child;
    writeFieldNode(
      root.structure!.shown,
      false,
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(child.detached).toBe(true);
    expect([child.visible, child.readOnly, child.disabled]).toEqual([
      false,
      true,
      true,
    ]);
    expect(root.runtime.detachedReads?.get(child)).toMatchObject({
      visible: false,
      readOnly: true,
      disabled: true,
    });
  });

  it('28C-02 detached frozen retains watchValues from its last live commit', () => {
    const root = createSurfaceTree({
      type: 'object',
      properties: {
        shown: { type: 'boolean' },
        source: { type: 'string' },
        target: {
          type: 'string',
          controls: {
            active: '../shown',
            watch: ['../source'],
          },
        },
      },
    });
    root.setValue({ shown: true, source: 'old', target: 't' });
    const target = root.find('/target');
    root.setValue({ shown: false, source: 'new', target: 't' });
    expect(target?.active).toBe(false);
    expect(target?.watchValues).toEqual(['old']);
    expect(target?.watchValues).toBe(target?.watchValues);
  });
});
