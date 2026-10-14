import { describe, expect, it } from 'vitest';

import { WriteOption } from '../../types/value';
import {
  loadFieldNodeAtMount,
  resetFieldNodeSubtree,
  writeFieldNode,
} from '../index';
import { createTestTree } from './fixtures/createTestTree';
import { sourceAt } from './fixtures/sourceAt';

// filid:contract settle-write
describe('per-node branch sources', () => {
  it('39C-01 preserves null and scalar object hosts without child emission', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        kind: { type: 'string' as const },
      },
      allOf: [
        {
          controls: { active: './kind === "cat"' },
          properties: { meow: { type: 'boolean' as const, default: true } },
        },
      ],
    };
    const nullTree = createTestTree(schema).root;
    loadFieldNodeAtMount(nullTree, null, WriteOption.Overwrite);
    expect(nullTree.emit).toBeNull();
    expect(nullTree.structure?.kind).toBeDefined();
    expect(nullTree.structure?.meow).toBeUndefined();
    const scalarTree = createTestTree(schema).root;
    loadFieldNodeAtMount(scalarTree, 17, WriteOption.Overwrite);
    expect(scalarTree.emit).toBe(17);
    expect(scalarTree.structure?.kind).toBeDefined();
    expect(scalarTree.structure?.meow).toBeUndefined();
    const catTree = createTestTree(schema).root;
    loadFieldNodeAtMount(catTree, { kind: 'cat' }, WriteOption.Overwrite);
    expect(catTree.emit).toEqual({ kind: 'cat', meow: true });
  });

  it('39C-01 keeps a nullable object null and a replaced child null', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        user: {
          type: ['object', 'null'],
          properties: {
            note: { type: 'string' },
          },
        },
        target: {
          type: 'object',
          properties: {
            note: { type: 'string' },
            reason: { type: 'string', default: 'because' },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      {
        user: null,
        target: {
          note: 'typed',
          reason: 'edited',
        },
      },
      WriteOption.Overwrite,
    );
    expect(root.emit).toEqual({
      user: null,
      target: {
        note: 'typed',
        reason: 'edited',
      },
    });
    writeFieldNode(
      root,
      { user: null, target: null },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.emit).toEqual({ user: null, target: null });
    expect(root.structure?.target?.structure?.note?.raw).toBeUndefined();
  });
  it('VALUE-002/004 keeps an object host empty and its extra keys separately', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(root, { a: 'x', z: 1 }, WriteOption.Overwrite);
    writeFieldNode(root.structure!.a, 'y', 'input', WriteOption.Overwrite);
    expect(root.raw).toBeUndefined();
    expect(root.undeclaredValues).toEqual({ z: 1 });
    expect(sourceAt(root, '/a')).toBe('y');
    writeFieldNode(
      root,
      { a: 'y', z: 1 },
      'callerReplace',
      WriteOption.Overwrite,
    );
    writeFieldNode(root, { a: 'y' }, 'callerPartial', WriteOption.Merge);
    expect(root.raw).toBeUndefined();
    expect(root.undeclaredValues).toEqual({ z: 1 });
  });

  it('E16/WRITE-018/O1 preserves extra key order and an equal write reference', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'number' },
      },
    });
    loadFieldNodeAtMount(root, { z: 1, a: 2, m: 3 }, WriteOption.Overwrite);
    writeFieldNode(root, { q: 4 }, 'callerPartial', WriteOption.Merge);
    writeFieldNode(root, { z: 9 }, 'callerPartial', WriteOption.Merge);
    expect(Object.keys(root.undeclaredValues ?? {})).toEqual(['z', 'm', 'q']);
    expect(Object.keys(root.emit ?? {})).toEqual(['a', 'z', 'm', 'q']);
    const extras = root.undeclaredValues;
    writeFieldNode(root, root.emit, 'callerReplace', WriteOption.Overwrite);
    expect(root.undeclaredValues).toBe(extras);
    expect(root.runtime.refreshTargets?.size).toBe(0);
  });

  it('WRITE-079/O6/26C-14 distributes detached Merge without mutating V', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        g: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            leaf: { type: 'string' },
            deep: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
              },
            },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, g: { leaf: 'a', deep: { x: 1, y: 2 }, e: 1 } },
      WriteOption.Overwrite,
    );
    const old = root.structure!.g;
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    const input = Object.freeze({
      g: Object.freeze({ deep: Object.freeze({ x: 2 }), f: 3 }),
    });
    writeFieldNode(root, input, 'callerPartial', WriteOption.Merge);
    expect(sourceAt(root, '/g/leaf', 'string')).toBe('a');
    expect(sourceAt(root, '/g/deep/x', 'number')).toBe(2);
    expect(sourceAt(root, '/g/deep/y', 'number')).toBe(2);
    writeFieldNode(
      old,
      { deep: { x: 2 }, f: 3 },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(input.g.deep.x).toBe(2);
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.emit).toEqual({
      flag: true,
      g: { leaf: 'a', deep: { x: 2, y: 2 }, e: 1, f: 3 },
    });
  });

  it('VALUE-031 keeps untouched off-child latents through sibling Merge and reentry', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        show: { type: 'boolean' },
        a: { type: 'string' },
        g: {
          type: 'object',
          controls: { active: '../on' },
          properties: {
            secret: { type: 'string', controls: { active: '#/show' } },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { on: true, show: true, a: 'x', g: { secret: 'S' } },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.show, false, 'input', WriteOption.Overwrite);
    writeFieldNode(root.structure!.on, false, 'input', WriteOption.Overwrite);
    writeFieldNode(root, { a: 'y' }, 'callerPartial', WriteOption.Merge);
    expect(sourceAt(root, '/g/secret', 'string')).toBe('S');
    writeFieldNode(root.structure!.on, true, 'input', WriteOption.Overwrite);
    writeFieldNode(root.structure!.show, true, 'input', WriteOption.Overwrite);
    expect(sourceAt(root, '/g/secret')).toBe('S');
  });

  it('WRITE-091 gives a current Merge key priority over an old latent', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        secret: { type: 'string', controls: { active: '../flag' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, secret: 'old' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    writeFieldNode(
      root,
      { flag: true, secret: 'new' },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(sourceAt(root, '/secret')).toBe('new');
    writeFieldNode(
      root,
      { flag: false },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(sourceAt(root, '/secret', 'string')).toBeUndefined();
  });

  it('WRITE-015 retains a suppressed exiting host and its child sources', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        g: {
          type: 'object',
          controls: {
            active: '../flag',
            unsetOnInactive: true,
          },
          properties: { leaf: { type: 'string' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, g: { leaf: 'L', z: 1 } },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.flag,
      false,
      'input',
      WriteOption.DisableAutomaticWrites,
    );
    expect(sourceAt(root, '/g/leaf', 'string')).toBe('L');
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/g', 'object'])),
    ).toMatchObject({ undeclaredValues: { z: 1 } });
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.emit).toEqual({ flag: true, g: { leaf: 'L', z: 1 } });
  });

  it('SETTLE-005/011 removes detached fills from Source B inputs and latents', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        t: { type: 'boolean' },
        a: {
          type: 'number',
          default: 1,
          controls: { active: '../t === true' },
        },
        c: { type: 'number', default: 2, controls: { active: '../a === 1' } },
        g: {
          type: 'object',
          default: { leaf: 'D' },
          controls: {
            active: '../a !== 1 || ../c === 2',
            unsetOnInactive: true,
          },
          properties: { leaf: { type: 'string' } },
        },
        x: { type: ['string', 'boolean'] },
      },
      allOf: [
        {
          controls: { active: './x === "0"' },
          properties: { x: { type: 'boolean' } },
        },
        {
          controls: { active: './x !== "0"' },
          properties: { x: { type: 'string' } },
        },
      ],
    });
    loadFieldNodeAtMount(root, { x: 'steady' }, WriteOption.Overwrite);
    expect(() =>
      writeFieldNode(
        root,
        { t: true, x: 0 },
        'callerReplace',
        WriteOption.Overwrite,
      ),
    ).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ cause: 'budget' });
    expect(sourceAt(root, '/g/leaf', 'string')).toBeUndefined();
    expect(
      [...root.runtime.latentRaw.values()].some(
        (value) => typeof value === 'string' && value === 'D',
      ),
    ).toBe(false);
    expect(root.runtime.settlementScratch?.writtenInputs.size).toBe(0);
  });

  it('WRITE-013/Q1 keeps null until a child emits and holds extras beside it', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            sibling: { type: 'string', default: 'D' },
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
    const user = root.structure!.user;
    expect(user.raw).toBeNull();
    writeFieldNode(
      user.structure!.name,
      undefined,
      'input',
      WriteOption.Overwrite,
    );
    expect(user.raw).toBeNull();
    writeFieldNode(user, {}, 'callerPartial', WriteOption.Merge);
    expect(user.raw).toBeNull();
    writeFieldNode(user, { z: 1 }, 'callerPartial', WriteOption.Merge);
    expect(user.raw).toBeNull();
    expect(user.undeclaredValues).toEqual({ z: 1 });
    writeFieldNode(user.structure!.name, 'N', 'input', WriteOption.Overwrite);
    expect(user.raw).toBeUndefined();
    expect(user.structure?.sibling?.raw).toBeUndefined();
    expect(root.emit).toEqual({ user: { name: 'N', z: 1 } });
  });

  it('VALUE-025 keeps a changed leaf and does not revive an explicitly absent sibling', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        g: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            leaf: { type: 'string' },
            other: { type: 'string' },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, g: { leaf: 'a', other: 'b', z: 1 } },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.g.structure!.leaf,
      'new',
      'input',
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.g.structure!.other,
      undefined,
      'input',
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.g?.structure?.leaf?.raw).toBe('new');
    expect(root.structure?.g?.structure?.other?.raw).toBeUndefined();
    expect(root.structure?.g?.undeclaredValues).toEqual({ z: 1 });
  });

  it('TEST-069 lets a gate read an undeclared key from extras', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        visible: { type: 'string', controls: { active: '../mode === "on"' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { mode: 'on', visible: 'V' },
      WriteOption.Overwrite,
    );
    expect(root.structure?.visible?.raw).toBe('V');
    writeFieldNode(root, {}, 'callerReplace', WriteOption.Overwrite);
    expect(root.structure?.visible).toBeUndefined();
  });

  it('Q2/Q4 enumerates latent leaves beneath a path live as another kind', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        kind: { type: 'string' },
      },
      allOf: [
        {
          properties: {
            group: {
              type: 'object',
              controls: { active: '../kind === "a"' },
              properties: { leaf: { type: 'string' } },
            },
          },
        },
        {
          properties: {
            group: { type: 'string', controls: { active: '../kind === "b"' } },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { kind: 'a', group: { leaf: 'kept' } },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/group', 'object'])),
    ).toBe(false);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/group/leaf', value: 'kept' },
    ]);
  });

  it('Q3/WRITE-098 interprets an off-shape number leaf before reentry', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        n: { type: 'number', controls: { active: '../flag' } },
      },
    });
    loadFieldNodeAtMount(root, { flag: false, n: '3' }, WriteOption.Overwrite);
    expect(sourceAt(root, '/n', 'number')).toBe(3);
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(sourceAt(root, '/n')).toBe(3);
  });

  it('O4 allows finite recursive expansion with a distributed source', () => {
    const schema = {
      $defs: {
        Node: {
          type: 'object',
          properties: {
            hasChild: { type: 'boolean' },
            child: {
              $ref: '#/$defs/Node',
              controls: { active: '../hasChild === true' },
            },
          },
        },
      },
      $ref: '#/$defs/Node',
    };
    const { root } = createTestTree(schema);
    expect(() =>
      loadFieldNodeAtMount(
        root,
        { hasChild: true, child: { hasChild: false } },
        WriteOption.Overwrite,
      ),
    ).not.toThrow();
    expect(root.structure?.child?.structure?.hasChild?.raw).toBe(false);
    expect(root.runtime.diagnostics.exceededBudget).not.toBe('recursion');
  });

  it('WRITE-082 protects a latent child from a host default on reentry', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        g: {
          type: 'object',
          default: { leaf: 'D' },
          controls: { active: '../flag' },
          properties: { leaf: { type: 'string' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: false, g: { leaf: 'L' } },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.g?.structure?.leaf?.raw).toBe('L');
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    writeFieldNode(
      root,
      { flag: true },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.g?.structure?.leaf?.raw).toBe('D');
  });

  it('WRITE-035 clears a departing host extras and leaf together', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        branch: {
          type: 'object',
          controls: {
            active: '../flag',
            unsetOnInactive: true,
          },
          properties: { kept: { type: 'string' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, branch: { kept: 'K', z: 1 } },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/branch', 'object'])),
    ).toBe(false);
    expect(sourceAt(root, '/branch/kept', 'string')).toBeUndefined();
  });

  it('VALUE-031 keeps the caller value when a node enters and exits in one settle', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        mode: { type: 'string', default: 'z', controls: { active: '../flag' } },
        secret: {
          type: 'string',
          controls: {
            active: '../flag && ../mode !== "z"',
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: false, secret: 'old' },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { flag: true, secret: 'new' },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(sourceAt(root, '/secret', 'string')).toBe('new');
  });

  it('26C-14 OPEN-1 replaces other-kind latents for an absent path write', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        mode: { type: 'string' },
      },
      allOf: [
        {
          properties: {
            item: {
              type: 'object',
              controls: { active: '../mode === "object"' },
              properties: { leaf: { type: 'string' } },
            },
          },
        },
        {
          properties: {
            item: {
              type: 'string',
              controls: { active: '../mode === "string"' },
            },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { mode: 'string', item: 'old' },
      WriteOption.Overwrite,
    );
    const detachedString = root.structure!.item;
    writeFieldNode(root.structure!.mode, 'off', 'input', WriteOption.Overwrite);
    expect(sourceAt(root, '/item', 'string')).toBe('old');
    writeFieldNode(
      root,
      { item: { leaf: 'new' } },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(sourceAt(root, '/item/leaf', 'string')).toBe('new');
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/item', 'string'])),
    ).toBe(false);
    expect(detachedString.detached).toBe(true);
    writeFieldNode(
      detachedString,
      'late',
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/item', 'string'])),
    ).toBe('late');
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/item', 'object'])),
    ).toBe(false);
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/item/leaf', 'string'])),
    ).toBe(false);
  });

  it('26C-14 OPEN-2 clears a wrong-kind latent host for emitting leaf input', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        g: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            leaf: { type: 'string', options: { omitEmpty: true } },
          },
        },
      },
    });
    loadFieldNodeAtMount(root, { flag: false, g: null }, WriteOption.Overwrite);
    writeFieldNode(
      root,
      { g: { leaf: '' } },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/g', 'object'])),
    ).toMatchObject({ raw: null });
    writeFieldNode(
      root,
      { g: { leaf: 'shown' } },
      'callerPartial',
      WriteOption.Merge,
    );
    const host = root.runtime.latentRaw.get(JSON.stringify(['/g', 'object']));
    expect(
      host === undefined ||
        (host !== null &&
          typeof host === 'object' &&
          Reflect.get(host, 'raw') === undefined),
    ).toBe(true);
    expect(sourceAt(root, '/g/leaf', 'string')).toBe('shown');
  });

  it('26C-14 OPEN-4 suppresses a host default for another-kind latent', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        mode: { type: 'string' },
        g: {
          type: 'object',
          default: { value: 'D' },
          controls: { active: '../flag' },
          allOf: [
            {
              properties: {
                value: {
                  type: 'string',
                  controls: { active: '../../mode === "string"' },
                },
              },
            },
            {
              properties: {
                value: {
                  type: 'number',
                  default: 7,
                  controls: { active: '../../mode === "number"' },
                },
              },
            },
          ],
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, mode: 'string', g: { value: 'old' } },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    writeFieldNode(
      root.structure!.mode,
      'number',
      'input',
      WriteOption.Overwrite,
    );
    expect(sourceAt(root, '/g/value', 'string')).toBe('old');
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.g?.structure?.value?.raw).toBe(7);
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/g/value', 'string'])),
    ).toBe('old');
  });

  it('SETTLE-005 withdraws a host fill from a child that exits mid-round', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        g: {
          type: 'object',
          default: { switch: true, secret: 'D' },
          controls: { active: '../flag' },
          properties: {
            switch: { type: 'boolean' },
            secret: {
              type: 'string',
              controls: { active: '../switch !== true' },
            },
          },
        },
      },
    });
    loadFieldNodeAtMount(root, { flag: false }, WriteOption.Overwrite);
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.g?.structure?.secret).toBeUndefined();
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/g/secret', 'string'])),
    ).toBe(false);
  });

  it('EVENT-072 keeps sources of nodes a subtree reset moves out of the shape', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        box: { type: 'object', properties: { b: { type: 'boolean' } } },
        secret: { type: 'string', controls: { active: '../box/b === true' } },
        grp: {
          type: 'object',
          properties: { x: { type: 'string' } },
          controls: { active: '../box/b === true' },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { box: {}, secret: 'held' },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.box.structure!.b,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.secret?.raw).toBe('held');
    writeFieldNode(
      root.structure!.grp.structure!.x,
      'typed',
      'input',
      WriteOption.Overwrite,
    );
    resetFieldNodeSubtree(root.structure!.box, WriteOption.Overwrite);
    expect(root.structure?.secret).toBeUndefined();
    expect(root.structure?.grp).toBeUndefined();
    expect(sourceAt(root, '/secret', 'string')).toBe('held');
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/grp/x', 'string'])),
    ).toBe('typed');
    writeFieldNode(
      root.structure!.box.structure!.b,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.secret?.raw).toBe('held');
    expect(root.structure?.grp?.structure?.x?.raw).toBe('typed');
  });
});
