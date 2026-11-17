import { describe, expect, it } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-gates
describe('settle gate calculation', () => {
  it('TEST-069 expression compiler commits input then records expression cause', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        active: '(() => { throw new Error("expression failed") })()',
      },
    });
    expect(() =>
      writeFieldNode(
        root,
        {},
        FieldNodeWriteKind.CallerReplace,
        WriteOption.Overwrite,
      ),
    ).toThrow('Gate evaluation failed');
    expect(root.source).toBeUndefined();
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'expression',
      commit: 1,
    });
  });

  it('TEST-069 expression guard commits input then records expression cause', () => {
    const { root } = createTestTree(
      {
        type: 'object',
        if: {},
        then: {
          properties: { guarded: { type: 'string' } },
        },
      },
      createTestValidator('throw'),
    );
    expect(() =>
      writeFieldNode(
        root,
        { enabled: true },
        FieldNodeWriteKind.CallerReplace,
        WriteOption.Overwrite,
      ),
    ).toThrow('Gate evaluation failed');
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'expression',
      commit: 1,
    });
  });

  it('TEST-069 node active and 25C-06 use the compiled expression', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: { type: 'string', controls: { active: '../flag' } },
      },
    });
    writeFieldNode(
      root,
      { flag: true, target: 'shown' },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.childrenByName?.target?.isActive).toBe(true);
    expect(root.storedOutputValue).toEqual({ flag: true, target: 'shown' });
    writeFieldNode(
      root.childrenByName!.flag,
      false,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(root.childrenByName?.target).toBeUndefined();
    expect(root.storedOutputValue).toEqual({ flag: false });
  });

  it('CONTROLS-080 hides extras below a host omitted by projection', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        user: { type: 'object' },
        probe: {
          type: 'string',
          default: 'D',
          controls: { active: '#/user/mode === "on"' },
        },
      },
    });
    writeFieldNode(
      root,
      { user: null },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { user: { mode: 'on' } },
      FieldNodeWriteKind.CallerPartial,
      WriteOption.Merge,
    );
    expect(root.childrenByName?.user?.source).toBeNull();
    expect(root.childrenByName?.user?.extras).toEqual({ mode: 'on' });
    expect(root.childrenByName?.probe).toBeUndefined();
    expect(root.storedOutputValue).toEqual({ user: null });
  });

  it('CONTROLS-080 withholds host extras from an if predicate when source is null', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        user: {
          type: 'object',
          if: {
            properties: { enabled: { const: true } },
            required: ['enabled'],
          },
          then: {
            properties: { guarded: { type: 'string' } },
          },
        },
      },
    });
    writeFieldNode(
      root,
      { user: null },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { user: { enabled: true } },
      FieldNodeWriteKind.CallerPartial,
      WriteOption.Merge,
    );
    expect(root.childrenByName?.user?.source).toBeNull();
    expect(root.childrenByName?.user?.extras).toEqual({ enabled: true });
    expect(root.childrenByName?.user?.childrenByName?.guarded).toBeUndefined();
  });

  it('28C-03 context slot supplies @ independently of host extras', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        user: {
          type: 'object',
          allOf: [
            {
              controls: { active: '@ && @.mode === "on"' },
              properties: { guarded: { type: 'string' } },
            },
          ],
        },
      },
    });
    root.runtime.context = { mode: 'on' };
    writeFieldNode(
      root,
      { user: null },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { user: { mode: 'off' } },
      FieldNodeWriteKind.CallerPartial,
      WriteOption.Merge,
    );
    expect(root.childrenByName?.user?.source).toBeNull();
    expect(root.childrenByName?.user?.extras).toEqual({ mode: 'off' });
    expect(root.childrenByName?.user?.childrenByName?.guarded).toBeDefined();
  });

  it('CONTROLS-080 excludes a root child from a wrong-kind source output value', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        child: { type: 'string', default: 'D' },
        probe: {
          type: 'string',
          default: 'P',
          controls: { active: '#/child === "D"' },
        },
      },
    });
    loadFieldNodeAtMount(root, null, WriteOption.Overwrite);
    writeFieldNode(
      root.childrenByName!.child,
      'D',
      FieldNodeWriteKind.Automatic,
      WriteOption.Overwrite,
    );
    expect(root.source).toBeNull();
    expect(root.storedOutputValue).toBeNull();
    expect(root.childrenByName?.child?.source).toBe('D');
    expect(root.childrenByName?.probe).toBeUndefined();
  });

  it('TEST-069 fragment active evaluates a compiled host expression', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
      },
      allOf: [
        {
          controls: { active: './flag' },
          properties: { gated: { type: 'string' } },
        },
      ],
    });
    writeFieldNode(
      root,
      { flag: true, gated: 'on' },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.storedOutputValue).toEqual({ flag: true, gated: 'on' });
    writeFieldNode(
      root.childrenByName!.flag,
      false,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(root.storedOutputValue).toEqual({ flag: false });
  });

  it('SETTLE-045 reads a root sibling through the bound evaluation location', () => {
    const { root, blueprint } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        p: {
          type: 'object',
          properties: {
            child: { type: 'string', controls: { active: '#/flag' } },
          },
        },
      },
    });
    const gate =
      blueprint.root.childEntries[1].node.childEntries[0].node.declarations[0]
        .gates[0];
    writeFieldNode(
      root,
      { flag: true, p: { child: 'yes' } },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(
      getGateRegistry(root.runtime).locate(root.childrenByName!.p, gate)
        .evaluationHostPath,
    ).toBe('');
    expect(root.storedOutputValue).toEqual({ flag: true, p: { child: 'yes' } });
  });

  it('SETTLE-045 retains the static p and local L for one occurrence', () => {
    const { root, blueprint } = createTestTree({
      type: 'object',
      properties: {
        p: {
          type: 'object',
          properties: {
            child: { type: 'string', controls: { active: '#/p' } },
            extra: { type: 'string', controls: { active: '@' } },
          },
        },
      },
    });
    writeFieldNode(
      root,
      { p: { child: 'yes' } },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const p = root.childrenByName!.p;
    const [child, extra] = blueprint.root.childEntries[0].node.childEntries;
    const registry = getGateRegistry(root.runtime);
    expect(
      registry.locate(p, child.declarations[0].gates[0], 'child')
        .evaluationHostPath,
    ).toBe('/p');
    expect(
      registry.locate(p, extra.declarations[0].gates[0], 'extra')
        .evaluationHostPath,
    ).toBe('/p/extra');
  });

  it('SETTLE-045 memoizes a different L for the second recursive occurrence', () => {
    const { root, blueprint } = createTestTree({
      $defs: {
        loop: {
          type: 'object',
          properties: {
            flag: { type: 'boolean' },
            next: { $ref: '#/$defs/loop', controls: { active: '../flag' } },
          },
        },
      },
      $ref: '#/$defs/loop',
    });
    writeFieldNode(
      root,
      { flag: true, next: { flag: true, next: { flag: false } } },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const first = blueprint.root.childEntries[1];
    const nested = root.childrenByName!.next;
    expect(first.node).toBe(nested.blueprintNode);
    expect(
      getGateRegistry(root.runtime).locate(root, first.declarations[0].gates[0])
        .evaluationHostPath,
    ).toBe('');
    const secondGate =
      nested.blueprintNode.childEntries[1].declarations[0].gates[0];
    expect(
      getGateRegistry(root.runtime).locate(nested, secondGate, 'next')
        .evaluationHostPath,
    ).toBe('/next');
    expect(nested.childrenByName?.next).toBeDefined();
  });

  it('SETTLE-045 recomputes a relocated gate after a later sibling is projected', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        p: {
          type: 'object',
          properties: {
            child: { type: 'string', controls: { active: '#/flag === 0' } },
          },
        },
        flag: { type: 'number' },
      },
    });
    writeFieldNode(
      root,
      { p: { child: 'yes' }, flag: 1 },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.childrenByName?.p?.childrenByName?.child).toBeUndefined();
    writeFieldNode(
      root.childrenByName!.flag,
      '0',
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(root.childrenByName?.p?.childrenByName?.child?.isActive).toBe(true);
    expect(root.storedOutputValue).toEqual({ p: { child: 'yes' }, flag: 0 });
  });

  it('SETTLE-045 evaluates each shared reference at its bound host', () => {
    const { root } = createTestTree({
      type: 'object',
      $defs: {
        branch: {
          type: 'object',
          properties: {
            flag: { type: 'boolean' },
            child: { type: 'string', controls: { active: '../flag' } },
          },
        },
      },
      properties: {
        p: { $ref: '#/$defs/branch' },
        q: { $ref: '#/$defs/branch' },
      },
    });
    writeFieldNode(
      root,
      {
        p: { flag: false, child: 'hidden' },
        q: { flag: true, child: 'shown' },
      },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.storedOutputValue).toEqual({
      p: { flag: false },
      q: { flag: true, child: 'shown' },
    });
  });

  it('SETTLE-045 unescapes slash and tilde host segments for extras', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        'p/q~r': {
          type: 'object',
          allOf: [
            {
              controls: { active: './enabled' },
              properties: { child: { type: 'string' } },
            },
          ],
        },
      },
    });
    writeFieldNode(
      root,
      { 'p/q~r': { enabled: true, child: 'shown' } },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(
      root.childrenByName?.['p/q~r']?.childrenByName?.child?.storedOutputValue,
    ).toBe('shown');
  });

  it('SETTLE-050 restarts the gate wheel from the same authored order', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
      },
      allOf: [
        {
          controls: { active: './flag' },
          properties: { value: { type: 'string' } },
        },
      ],
    });
    writeFieldNode(
      root,
      { flag: true, value: 'x' },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const first = root.storedOutputValue;
    writeFieldNode(
      root.childrenByName!.flag,
      false,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.childrenByName!.flag,
      true,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(root.storedOutputValue).toEqual(first);
  });

  it('SETTLE-050 starts mutually gated siblings closed despite latent source', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'boolean', controls: { active: '../b' } },
        b: { type: 'boolean', controls: { active: '../a' } },
      },
    });
    writeFieldNode(
      root,
      { a: true, b: true },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.children).toEqual([]);
    expect(root.storedOutputValue).toEqual({});
  });

  it('SETTLE-050 uses Gauss-Seidel decisions in declaration order', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'boolean', controls: { active: '!../b' } },
        b: { type: 'boolean', controls: { active: '!../a' } },
      },
    });
    writeFieldNode(
      root,
      { a: true, b: true },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.children?.map((child) => child.name)).toEqual(['a']);
    expect(root.storedOutputValue).toEqual({ a: true });
  });

  it('25C-06 combines discriminator tags and branch active expressions', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'string' }, enabled: { type: 'boolean' } },
      oneOf: [
        {
          controls: { active: './enabled' },
          properties: {
            kind: { type: 'string', const: 'x' },
            onlyX: { type: 'string' },
          },
        },
      ],
    });
    writeFieldNode(
      root,
      { kind: 'x', enabled: false, onlyX: 'value' },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.childrenByName?.onlyX).toBeUndefined();
    writeFieldNode(
      root.childrenByName!.enabled,
      true,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(root.childrenByName?.onlyX?.storedOutputValue).toBe('value');
  });

  it('SETTLE-017 invalidates a nested gate when an ancestor of its read path changes', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        p: {
          type: 'object',
          properties: {
            child: { type: 'string', controls: { active: '#/group/flag' } },
          },
        },
        group: { type: 'object', properties: { flag: { type: 'boolean' } } },
      },
    });
    writeFieldNode(
      root,
      { p: { child: 'visible' }, group: { flag: true } },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(
      root.childrenByName?.p?.childrenByName?.child?.storedOutputValue,
    ).toBe('visible');
    writeFieldNode(
      root.childrenByName!.group,
      { flag: false },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.childrenByName?.p?.childrenByName?.child).toBeUndefined();
  });
});
