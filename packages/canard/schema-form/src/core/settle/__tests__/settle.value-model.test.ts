import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';
import { sourceAt } from './fixtures/sourceAt';

// filid:contract settle-write
describe('per-node branch sources', () => {
  it('VALUE-002/004 keeps an object host empty and its extra keys separately', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { a: 'x', z: 1 }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.a, 'y', 'input', SetValueOption.Overwrite);
    expect(root.raw).toBeUndefined();
    expect(root.extras).toEqual({ z: 1 });
    expect(sourceAt(root, '/a')).toBe('y');
    writeSchemaNode(root, { a: 'y', z: 1 }, 'callerReplace', SetValueOption.Overwrite);
    writeSchemaNode(root, { a: 'y' }, 'callerPartial', SetValueOption.Merge);
    expect(root.raw).toBeUndefined();
    expect(root.extras).toEqual({ z: 1 });
  });

  it('E16/WRITE-018/O1 preserves extra key order and an equal write reference', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'number' },
    } });
    loadSchemaNodeAtMount(root, { z: 1, a: 2, m: 3 }, SetValueOption.Overwrite);
    writeSchemaNode(root, { q: 4 }, 'callerPartial', SetValueOption.Merge);
    writeSchemaNode(root, { z: 9 }, 'callerPartial', SetValueOption.Merge);
    expect(Object.keys(root.extras ?? {})).toEqual(['z', 'm', 'q']);
    expect(Object.keys(root.emit ?? {})).toEqual(['a', 'z', 'm', 'q']);
    const extras = root.extras;
    writeSchemaNode(root, root.emit, 'callerReplace', SetValueOption.Overwrite);
    expect(root.extras).toBe(extras);
    expect(root.runtime.refreshTargets?.size).toBe(0);
  });

  it('WRITE-079/O6/26C-14 distributes detached Merge without mutating V', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      g: { type: 'object', controls: { active: '../flag' }, properties: {
        leaf: { type: 'string' }, deep: { type: 'object', properties: {
          x: { type: 'number' }, y: { type: 'number' },
        } },
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true,
      g: { leaf: 'a', deep: { x: 1, y: 2 }, e: 1 } }, SetValueOption.Overwrite);
    const old = root.structure!.g;
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    const input = Object.freeze({ g: Object.freeze({ deep: Object.freeze({ x: 2 }), f: 3 }) });
    writeSchemaNode(root, input, 'callerPartial', SetValueOption.Merge);
    expect(sourceAt(root, '/g/leaf', 'string')).toBe('a');
    expect(sourceAt(root, '/g/deep/x', 'number')).toBe(2);
    expect(sourceAt(root, '/g/deep/y', 'number')).toBe(2);
    writeSchemaNode(old, { deep: { x: 2 }, f: 3 }, 'callerPartial', SetValueOption.Merge);
    expect(input.g.deep.x).toBe(2);
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.emit).toEqual({ flag: true,
      g: { leaf: 'a', deep: { x: 2, y: 2 }, e: 1, f: 3 } });
  });

  it('VALUE-031 keeps untouched off-child latents through sibling Merge and reentry', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      on: { type: 'boolean' }, show: { type: 'boolean' }, a: { type: 'string' },
      g: { type: 'object', controls: { active: '../on' }, properties: {
        secret: { type: 'string', controls: { active: '#/show' } },
      } },
    } });
    loadSchemaNodeAtMount(root, { on: true, show: true, a: 'x',
      g: { secret: 'S' } }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.show, false, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.on, false, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root, { a: 'y' }, 'callerPartial', SetValueOption.Merge);
    expect(sourceAt(root, '/g/secret', 'string')).toBe('S');
    writeSchemaNode(root.structure!.on, true, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.show, true, 'input', SetValueOption.Overwrite);
    expect(sourceAt(root, '/g/secret')).toBe('S');
  });

  it('WRITE-091 gives a current Merge key priority over an old latent', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      secret: { type: 'string', controls: { active: '../flag' } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, secret: 'old' }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root, { flag: true, secret: 'new' },
      'callerPartial', SetValueOption.Merge);
    expect(sourceAt(root, '/secret')).toBe('new');
    writeSchemaNode(root, { flag: false }, 'callerReplace', SetValueOption.Overwrite);
    expect(sourceAt(root, '/secret', 'string')).toBeUndefined();
  });

  it('WRITE-015 retains a suppressed exiting host and its child sources', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      g: { type: 'object', controls: {
        active: '../flag', unsetOnInactive: true,
      }, properties: { leaf: { type: 'string' } } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, g: { leaf: 'L', z: 1 } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input',
      SetValueOption.DisableAutomaticWrites);
    expect(sourceAt(root, '/g/leaf', 'string')).toBe('L');
    expect(root.runtime.latentRaw.get(JSON.stringify(['/g', 'object'])))
      .toMatchObject({ extras: { z: 1 } });
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.emit).toEqual({ flag: true, g: { leaf: 'L', z: 1 } });
  });

  it('SETTLE-005/011 removes detached fills from Source B inputs and latents', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      t: { type: 'boolean' },
      a: { type: 'number', default: 1, controls: { active: '../t === true' } },
      c: { type: 'number', default: 2, controls: { active: '../a === 1' } },
      g: { type: 'object', default: { leaf: 'D' },
        controls: { active: '../a !== 1 || ../c === 2', unsetOnInactive: true },
        properties: { leaf: { type: 'string' } } },
      x: { type: ['string', 'boolean'] },
    }, allOf: [
      { controls: { active: './x === "0"' },
        properties: { x: { type: 'boolean' } } },
      { controls: { active: './x !== "0"' },
        properties: { x: { type: 'string' } } },
    ] });
    loadSchemaNodeAtMount(root, { x: 'steady' }, SetValueOption.Overwrite);
    expect(() => writeSchemaNode(root, { t: true, x: 0 },
      'callerReplace', SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ cause: 'budget' });
    expect(sourceAt(root, '/g/leaf', 'string')).toBeUndefined();
    expect([...root.runtime.latentRaw.values()].some(value =>
      typeof value === 'string' && value === 'D')).toBe(false);
    expect(root.runtime.settlementScratch?.writtenInputs.size).toBe(0);
  });

  it('WRITE-013/Q1 keeps null until a child emits and holds extras beside it', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      user: { type: 'object', properties: {
        name: { type: 'string' }, sibling: { type: 'string', default: 'D' },
      } },
    } });
    writeSchemaNode(root, { user: null }, 'callerReplace', SetValueOption.Overwrite);
    const user = root.structure!.user;
    expect(user.raw).toBeNull();
    writeSchemaNode(user.structure!.name, undefined, 'input', SetValueOption.Overwrite);
    expect(user.raw).toBeNull();
    writeSchemaNode(user, {}, 'callerPartial', SetValueOption.Merge);
    expect(user.raw).toBeNull();
    writeSchemaNode(user, { z: 1 }, 'callerPartial', SetValueOption.Merge);
    expect(user.raw).toBeNull();
    expect(user.extras).toEqual({ z: 1 });
    writeSchemaNode(user.structure!.name, 'N', 'input', SetValueOption.Overwrite);
    expect(user.raw).toBeUndefined();
    expect(user.structure?.sibling?.raw).toBeUndefined();
    expect(root.emit).toEqual({ user: { name: 'N', z: 1 } });
  });

  it('VALUE-025 keeps a changed leaf and does not revive an explicitly absent sibling', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      g: { type: 'object', controls: { active: '../flag' }, properties: {
        leaf: { type: 'string' }, other: { type: 'string' },
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true,
      g: { leaf: 'a', other: 'b', z: 1 } }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.g.structure!.leaf, 'new', 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.g.structure!.other, undefined,
      'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.g?.structure?.leaf?.raw).toBe('new');
    expect(root.structure?.g?.structure?.other?.raw).toBeUndefined();
    expect(root.structure?.g?.extras).toEqual({ z: 1 });
  });

  it('TEST-069 lets a gate read an undeclared key from extras', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      visible: { type: 'string', controls: { active: '../mode === "on"' } },
    } });
    loadSchemaNodeAtMount(root, { mode: 'on', visible: 'V' }, SetValueOption.Overwrite);
    expect(root.structure?.visible?.raw).toBe('V');
    writeSchemaNode(root, {}, 'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.visible).toBeUndefined();
  });

  it('Q2/Q4 enumerates latent leaves beneath a path live as another kind', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      kind: { type: 'string' },
    }, allOf: [
      { properties: { group: { type: 'object',
        controls: { active: '../kind === "a"' },
        properties: { leaf: { type: 'string' } } } } },
      { properties: { group: { type: 'string',
        controls: { active: '../kind === "b"' } } } },
    ] });
    loadSchemaNodeAtMount(root, { kind: 'a', group: { leaf: 'kept' } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/group', 'object']))).toBe(false);
    expect(root.runtime.inactiveValuesMemo.get(''))
      .toEqual([{ path: '/group/leaf', value: 'kept' }]);
  });

  it('Q3/WRITE-098 interprets an off-shape number leaf before reentry', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      n: { type: 'number', controls: { active: '../flag' } },
    } });
    loadSchemaNodeAtMount(root, { flag: false, n: '3' }, SetValueOption.Overwrite);
    expect(sourceAt(root, '/n', 'number')).toBe(3);
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(sourceAt(root, '/n')).toBe(3);
  });

  it('O4 allows finite recursive expansion with a distributed source', () => {
    const schema = { $defs: { Node: { type: 'object', properties: {
      hasChild: { type: 'boolean' },
      child: { $ref: '#/$defs/Node', controls: { active: '../hasChild === true' } },
    } } }, $ref: '#/$defs/Node' };
    const { root } = createTestTree(schema);
    expect(() => loadSchemaNodeAtMount(root,
      { hasChild: true, child: { hasChild: false } },
      SetValueOption.Overwrite)).not.toThrow();
    expect(root.structure?.child?.structure?.hasChild?.raw).toBe(false);
    expect(root.runtime.diagnostics.exceededBudget).not.toBe('recursion');
  });

  it('WRITE-082 protects a latent child from a host default on reentry', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      g: { type: 'object', default: { leaf: 'D' },
        controls: { active: '../flag' },
        properties: { leaf: { type: 'string' } } },
    } });
    loadSchemaNodeAtMount(root, { flag: false, g: { leaf: 'L' } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.g?.structure?.leaf?.raw).toBe('L');
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root, { flag: true }, 'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.g?.structure?.leaf?.raw).toBe('D');
  });

  it('WRITE-035 clears a departing host extras and leaf together', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      branch: { type: 'object', controls: {
        active: '../flag', unsetOnInactive: true,
      }, properties: { kept: { type: 'string' } } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, branch: { kept: 'K', z: 1 } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/branch', 'object']))).toBe(false);
    expect(sourceAt(root, '/branch/kept', 'string')).toBeUndefined();
  });

  it('VALUE-031 keeps the caller value when a node enters and exits in one settle', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      mode: { type: 'string', default: 'z', controls: { active: '../flag' } },
      secret: { type: 'string', controls: {
        active: '../flag && ../mode !== "z"',
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: false, secret: 'old' },
      SetValueOption.Overwrite);
    writeSchemaNode(root, { flag: true, secret: 'new' },
      'callerPartial', SetValueOption.Merge);
    expect(sourceAt(root, '/secret', 'string')).toBe('new');
  });

  it('26C-14 OPEN-1 replaces other-kind latents for an absent path write', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      mode: { type: 'string' },
    }, allOf: [
      { properties: { item: { type: 'object',
        controls: { active: '../mode === "object"' },
        properties: { leaf: { type: 'string' } } } } },
      { properties: { item: { type: 'string',
        controls: { active: '../mode === "string"' } } } },
    ] });
    loadSchemaNodeAtMount(root, { mode: 'string', item: 'old' },
      SetValueOption.Overwrite);
    const detachedString = root.structure!.item;
    writeSchemaNode(root.structure!.mode, 'off', 'input', SetValueOption.Overwrite);
    expect(sourceAt(root, '/item', 'string')).toBe('old');
    writeSchemaNode(root, { item: { leaf: 'new' } },
      'callerPartial', SetValueOption.Merge);
    expect(sourceAt(root, '/item/leaf', 'string')).toBe('new');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/item', 'string']))).toBe(false);
    expect(detachedString.detached).toBe(true);
    writeSchemaNode(detachedString, 'late', 'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/item', 'string']))).toBe('late');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/item', 'object']))).toBe(false);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/item/leaf', 'string']))).toBe(false);
  });

  it('26C-14 OPEN-2 clears a wrong-kind latent host for emitting leaf input', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      g: { type: 'object', controls: { active: '../flag' }, properties: {
        leaf: { type: 'string', options: { omitEmpty: true } },
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: false, g: null }, SetValueOption.Overwrite);
    writeSchemaNode(root, { g: { leaf: '' } },
      'callerPartial', SetValueOption.Merge);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/g', 'object'])))
      .toMatchObject({ raw: null });
    writeSchemaNode(root, { g: { leaf: 'shown' } },
      'callerPartial', SetValueOption.Merge);
    const host = root.runtime.latentRaw.get(JSON.stringify(['/g', 'object']));
    expect(host === undefined || (host !== null && typeof host === 'object' &&
      Reflect.get(host, 'raw') === undefined)).toBe(true);
    expect(sourceAt(root, '/g/leaf', 'string')).toBe('shown');
  });

  it('26C-14 OPEN-4 suppresses a host default for another-kind latent', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, mode: { type: 'string' },
      g: { type: 'object', default: { value: 'D' },
        controls: { active: '../flag' }, allOf: [
          { properties: { value: { type: 'string',
            controls: { active: '../../mode === "string"' } } } },
          { properties: { value: { type: 'number', default: 7,
            controls: { active: '../../mode === "number"' } } } },
        ] },
    } });
    loadSchemaNodeAtMount(root, { flag: true, mode: 'string',
      g: { value: 'old' } }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.mode, 'number', 'input', SetValueOption.Overwrite);
    expect(sourceAt(root, '/g/value', 'string')).toBe('old');
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.g?.structure?.value?.raw).toBe(7);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/g/value', 'string'])))
      .toBe('old');
  });

  it('SETTLE-005 withdraws a host fill from a child that exits mid-round', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      g: { type: 'object', default: { switch: true, secret: 'D' },
        controls: { active: '../flag' }, properties: {
          switch: { type: 'boolean' },
          secret: { type: 'string', controls: { active: '../switch !== true' } },
        } },
    } });
    loadSchemaNodeAtMount(root, { flag: false }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.g?.structure?.secret).toBeUndefined();
    expect(root.runtime.latentRaw.has(JSON.stringify(['/g/secret', 'string'])))
      .toBe(false);
  });
});
