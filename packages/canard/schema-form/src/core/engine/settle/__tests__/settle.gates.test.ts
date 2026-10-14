import { describe, expect, it } from 'vitest';

import { createTestValidator } from '../../../__tests__/fixtures/createTestValidator';
import { WriteOption } from '../../types/value';
import { loadFieldNodeAtMount, writeFieldNode } from '../index';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import { createTestTree } from './fixtures/createTestTree';

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
      writeFieldNode(root, {}, 'callerReplace', WriteOption.Overwrite),
    ).toThrow('Gate evaluation failed');
    expect(root.raw).toBeUndefined();
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
        'callerReplace',
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.active).toBe(true);
    expect(root.emit).toEqual({ flag: true, target: 'shown' });
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    expect(root.structure?.target).toBeUndefined();
    expect(root.emit).toEqual({ flag: false });
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { user: { mode: 'on' } },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(root.structure?.user?.raw).toBeNull();
    expect(root.structure?.user?.undeclaredValues).toEqual({ mode: 'on' });
    expect(root.structure?.probe).toBeUndefined();
    expect(root.emit).toEqual({ user: null });
  });

  it('CONTROLS-080 withholds host extras from an if predicate when raw is null', () => {
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { user: { enabled: true } },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(root.structure?.user?.raw).toBeNull();
    expect(root.structure?.user?.undeclaredValues).toEqual({ enabled: true });
    expect(root.structure?.user?.structure?.guarded).toBeUndefined();
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { user: { mode: 'off' } },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(root.structure?.user?.raw).toBeNull();
    expect(root.structure?.user?.undeclaredValues).toEqual({ mode: 'off' });
    expect(root.structure?.user?.structure?.guarded).toBeDefined();
  });

  it('CONTROLS-080 excludes a root child from a wrong-kind raw emission', () => {
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
      root.structure!.child,
      'D',
      'automatic',
      WriteOption.Overwrite,
    );
    expect(root.raw).toBeNull();
    expect(root.emit).toBeNull();
    expect(root.structure?.child?.raw).toBe('D');
    expect(root.structure?.probe).toBeUndefined();
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.emit).toEqual({ flag: true, gated: 'on' });
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    expect(root.emit).toEqual({ flag: false });
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(
      getGateRegistry(root.runtime).locate(root.structure!.p, gate)
        .evaluationHostPath,
    ).toBe('');
    expect(root.emit).toEqual({ flag: true, p: { child: 'yes' } });
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    const p = root.structure!.p;
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    const first = blueprint.root.childEntries[1];
    const nested = root.structure!.next;
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
    expect(nested.structure?.next).toBeDefined();
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.p?.structure?.child).toBeUndefined();
    writeFieldNode(root.structure!.flag, '0', 'input', WriteOption.Overwrite);
    expect(root.structure?.p?.structure?.child?.active).toBe(true);
    expect(root.emit).toEqual({ p: { child: 'yes' }, flag: 0 });
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.emit).toEqual({
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.['p/q~r']?.structure?.child?.emit).toBe('shown');
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    const first = root.emit;
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.emit).toEqual(first);
  });

  it('SETTLE-050 starts mutually gated siblings closed despite latent raw', () => {
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.children).toEqual([]);
    expect(root.emit).toEqual({});
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.children?.map((child) => child.name)).toEqual(['a']);
    expect(root.emit).toEqual({ a: true });
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.onlyX).toBeUndefined();
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.onlyX?.emit).toBe('value');
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
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.p?.structure?.child?.emit).toBe('visible');
    writeFieldNode(
      root.structure!.group,
      { flag: false },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.p?.structure?.child).toBeUndefined();
  });
});
