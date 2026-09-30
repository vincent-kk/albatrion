import { afterEach, describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-write
describe('settle commit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });
  it('VALUE-037 reports an out-of-list mount default as a fill', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      value: { type: ['string', 'boolean'], default: 0 },
    } });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
    expect(root.structure?.value?.raw).toBe(0);
    expect(root.runtime.typeMismatchRecords).toEqual([
      expect.objectContaining({ path: '/value', reason: 'ambiguous',
        source: 'fill' }),
    ]);
  });

  it('VALUE-037 reports a directly loaded out-of-list value as load', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      value: { type: ['string', 'boolean'], default: 1 },
    } });
    loadSchemaNodeAtMount(root, { value: 0 }, SetValueOption.Overwrite);
    expect(root.structure?.value?.raw).toBe(0);
    expect(root.runtime.typeMismatchRecords).toEqual([
      expect.objectContaining({ path: '/value', reason: 'ambiguous',
        source: 'load' }),
    ]);
  });

  it('SETTLE-042 and 18C-39 serialization preserve preferred, declared, and extra key order', () => {
    const { root } = createTestTree({ type: 'object',
      options: { propertyKeys: ['z', 'a'] },
      properties: { a: { type: 'string' }, b: { type: 'string' }, z: { type: 'string' } },
    });
    writeSchemaNode(root, { x: 1, b: 'B', a: 'A', z: 'Z' },
      'callerReplace', SetValueOption.Overwrite);
    expect(Object.keys(root.emit!)).toEqual(['z', 'a', 'b', 'x']);
    expect(JSON.stringify(root.emit)).toBe('{"z":"Z","a":"A","b":"B","x":1}');
  });

  it('SETTLE-042 restores declared order after a consumer edits a value snapshot', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } });
    writeSchemaNode(root, { a: 'A', b: 'B' }, 'callerReplace', SetValueOption.Overwrite);
    if (root.local === null || typeof root.local !== 'object')
      throw new Error('Expected an object snapshot');
    Reflect.deleteProperty(root.local, 'a');
    Reflect.set(root.local, 'a', 'edited');
    Reflect.set(root.local, 'ghost', true);
    writeSchemaNode(root.structure!.a, 'A2', 'input', SetValueOption.Overwrite);
    expect(Object.keys(root.local!)).toEqual(['a', 'b']);
    expect(root.local).toEqual({ a: 'A2', b: 'B' });
  });

  it('SETTLE-042 recomputes inherited option overlays when a fragment gate changes', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, a: { type: 'string' }, b: { type: 'string' },
    }, allOf: [{ controls: { active: './flag' },
      options: { propertyKeys: ['b', 'a'] } }] });
    writeSchemaNode(root, { flag: false, a: 'A', b: 'B' },
      'callerReplace', SetValueOption.Overwrite);
    expect(Object.keys(root.emit!)).toEqual(['flag', 'a', 'b']);
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(Object.keys(root.emit!)).toEqual(['b', 'a', 'flag']);
  });

  it('VALUE-034 keeps an empty root object but omits a nested empty host', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      hidden: { type: 'object' },
      kept: { type: 'object', options: { omitEmpty: false } },
    } });
    writeSchemaNode(root, { hidden: {}, kept: {} }, 'callerReplace', SetValueOption.Overwrite);
    expect(root.emit).toEqual({ kept: {} });
    const empty = createTestTree({ type: 'object' }).root;
    writeSchemaNode(empty, {}, 'callerReplace', SetValueOption.Overwrite);
    expect(empty.emit).toEqual({});
  });

  it('VALUE-032 ignores an inherited constructor during new-child marking', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      constructor: { type: 'string' },
    } });
    writeSchemaNode(root, {}, 'callerReplace', SetValueOption.Overwrite);
    expect(root.children?.find((child) => child.name === 'constructor')?.raw).toBeUndefined();
    writeSchemaNode(root, { constructor: 'own' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.children?.find((child) => child.name === 'constructor')?.raw).toBe('own');
  });

  it('VALUE-037 lights and clears a mismatch and resends after it relights', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      amount: { type: 'number' },
    } });
    writeSchemaNode(root, { amount: 'bad' }, 'callerReplace', SetValueOption.Overwrite);
    expect([...root.runtime.typeMismatchPaths]).toEqual(['/amount']);
    expect(root.runtime.typeMismatchRecords).toEqual([
      expect.objectContaining({ level: 'warning', path: '/amount',
        expected: expect.objectContaining({ schemaType: 'number', effective: 'number' }),
        received: 'string', reason: 'unconvertible', source: 'callerReplace' }),
    ]);
    writeSchemaNode(root.structure!.amount, 2, 'input', SetValueOption.Overwrite);
    expect(root.runtime.typeMismatchPaths.size).toBe(0);
    writeSchemaNode(root.structure!.amount, 'bad', 'input', SetValueOption.Overwrite);
    expect(root.runtime.typeMismatchRecords).toHaveLength(1);
    expect(root.runtime.typeMismatchesMemo?.get('')?.paths).toEqual(['/amount']);
  });

  it('VALUE-037 reports a gate-only narrowing with source gate', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' },
      value: { type: ['number', 'string'] },
    }, if: {}, then: { properties: { value: { type: 'string' } } } });
    writeSchemaNode(root, { enabled: false, value: 7 },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.typeMismatchPaths.size).toBe(0);
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect(root.structure!.value.schema.schema).toMatchObject({ type: ['string'] });
    expect(root.structure!.value.raw).toBe(7);
    expect(root.structure!.value.revision).toBe(2);
    expect([...root.runtime.typeMismatchPaths]).toEqual(['/value']);
    expect(root.runtime.typeMismatchRecords?.[0]).toMatchObject({
      path: '/value', source: 'gate', expected: { effective: ['string'] },
    });
  });

  it('VALUE-037 records every admissible scalar conversion as ambiguous candidates', () => {
    const { root } = createTestTree({ type: ['string', 'boolean'] });
    writeSchemaNode(root, 1, 'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.typeMismatchRecords?.[0]).toMatchObject({
      path: '', reason: 'ambiguous', candidates: ['string', 'boolean'],
    });
  });

  it('EVENT-071 records changed descendants outside the caller target', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } });
    writeSchemaNode(root, { a: 'old', b: 'same' }, 'callerReplace', SetValueOption.Overwrite);
    writeSchemaNode(root, { a: 'new', b: 'same' }, 'callerReplace', SetValueOption.Overwrite);
    expect([...root.runtime.refreshTargets!]).toEqual(['/a']);
    expect(root.runtime.commitNumber).toBe(2);
    const revision = root.structure!.a.revision;
    writeSchemaNode(root, root.emit, 'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.refreshTargets?.size).toBe(0);
    expect(root.structure!.a.revision).toBe(revision);
  });

  it('WRITE-087 memoizes frozen inactive values after a gate leaves', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      secret: { type: 'string', controls: { active: '../flag' } },
    } });
    writeSchemaNode(root, { flag: true, secret: 'held' }, 'callerReplace', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([{ path: '/secret', value: 'held' }]);
    expect(Object.isFrozen(root.runtime.inactiveValuesMemo.get(''))).toBe(true);
  });

  it('WRITE-087 retains the raw of an initially inactive declared child', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      secret: { type: 'string', controls: { active: '../flag' } },
    } });
    writeSchemaNode(root, { flag: false, secret: 'latent' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.secret).toBeUndefined();
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/secret', value: 'latent' },
    ]);
  });

  it('WRITE-087 lists detached object leaves without duplicating their host', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      group: { type: 'object', controls: { active: '../flag' }, properties: {
        leaf: { type: 'string' }, other: { type: 'string' },
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, group: {
      leaf: 'L', other: 'O',
    } }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/group/leaf', value: 'L' },
      { path: '/group/other', value: 'O' },
    ]);
  });

  it('WRITE-087 enumerates the same latent leaves after load or exit', () => {
    const schema = { type: 'object', properties: {
      flag: { type: 'boolean' },
      group: { type: 'object', controls: { active: '../flag' }, properties: {
        leaf: { type: 'string' },
        deep: { type: 'object', properties: { x: { type: 'number' } } },
      } },
    } } as const;
    const raw = { flag: false, group: { leaf: 'a', deep: { x: 1 } } };
    const initial = createTestTree(schema).root;
    loadSchemaNodeAtMount(initial, raw, SetValueOption.Overwrite);
    const exited = createTestTree(schema).root;
    loadSchemaNodeAtMount(exited, { ...raw, flag: true }, SetValueOption.Overwrite);
    writeSchemaNode(exited.structure!.flag, false, 'input', SetValueOption.Overwrite);
    const expected = [
      { path: '/group/leaf', value: 'a' },
      { path: '/group/deep/x', value: 1 },
    ];
    expect(initial.runtime.inactiveValuesMemo.get('')).toEqual(expected);
    expect(exited.runtime.inactiveValuesMemo.get('')).toEqual(expected);
    writeSchemaNode(initial.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(initial.structure?.group?.structure?.leaf?.raw).toBe('a');
    expect(initial.structure?.group?.structure?.deep?.structure?.x?.raw).toBe(1);
  });

  it('26C-13 enumerates latent leaves under a path live as another kind', () => {
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
    expect(root.structure?.group?.blueprintNode.kind).toBe('string');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/group', 'object'])))
      .toBe(false);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([{ path: '/group/leaf', value: 'kept' }]);
    writeSchemaNode(root.structure!.kind, 'a', 'input', SetValueOption.Overwrite);
    expect(root.structure?.group?.structure?.leaf?.raw).toBe('kept');
  });

  it('26C-13 enumerates one entry for a same-name field under an inactive host', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      group: { type: 'object', controls: { active: '../flag' },
        allOf: [
          { properties: { field: { type: 'string',
            controls: { active: '../sel === 1' } } } },
          { properties: { field: { type: 'number',
            controls: { active: '../sel === 2' } } } },
        ],
        properties: { sel: { type: 'number' } } },
    } });
    loadSchemaNodeAtMount(root, { flag: false, group: { sel: 1, field: 'test' } },
      SetValueOption.Overwrite);
    const entries = root.runtime.inactiveValuesMemo.get('')
      ?.filter((entry) => entry.path === '/group/field');
    expect(entries).toEqual([{ path: '/group/field', value: 'test' }]);
  });

  it('26C-13 enumerates one entry for explicit latents of two kinds at a path', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      kind: { type: 'string' },
    }, allOf: [
      { properties: { value: { type: 'string',
        controls: { active: '../kind === "a"' } } } },
      { properties: { value: { type: 'number',
        controls: { active: '../kind === "b"' } } } },
    ] });
    loadSchemaNodeAtMount(root, { kind: 'a', value: 'hello' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.value, 3, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.kind, 'none', 'input', SetValueOption.Overwrite);
    expect([...root.runtime.latentRaw.keys()].filter((key) =>
      key.startsWith('["/value",')).length).toBe(2);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/value', value: 'hello' },
    ]);
  });

  it('WRITE-087 enumerates a replaced detached host like an initially inactive host', () => {
    const schema = { type: 'object', properties: {
      flag: { type: 'boolean' },
      group: { type: 'object', controls: { active: '../flag' }, properties: {
        leaf: { type: 'string' },
        deep: { type: 'object', properties: { x: { type: 'number' } } },
      } },
    } } as const;
    const { root } = createTestTree(schema);
    loadSchemaNodeAtMount(root, { flag: true,
      group: { leaf: 'a', deep: { x: 1 } } }, SetValueOption.Overwrite);
    const group = root.structure!.group;
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    writeSchemaNode(group, { leaf: 'z', deep: { x: 9 } },
      'callerReplace', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    const initial = createTestTree(schema).root;
    loadSchemaNodeAtMount(initial, { flag: false,
      group: { leaf: 'z', deep: { x: 9 } } }, SetValueOption.Overwrite);
    const expected = [
      { path: '/group/leaf', value: 'z' },
      { path: '/group/deep/x', value: 9 },
    ];
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual(expected);
    expect(root.runtime.inactiveValuesMemo.get(''))
      .toEqual(initial.runtime.inactiveValuesMemo.get(''));
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.group?.structure?.leaf?.raw).toBe('z');
    expect(root.structure?.group?.structure?.deep?.structure?.x?.raw).toBe(9);
  });

  it('WRITE-087 records a detached leaf write beside untouched latent siblings', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      group: { type: 'object', controls: { active: '../flag' }, properties: {
        leaf: { type: 'string' },
        deep: { type: 'object', properties: { x: { type: 'number' } } },
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true,
      group: { leaf: 'a', deep: { x: 1 } } }, SetValueOption.Overwrite);
    const leaf = root.structure!.group.structure!.leaf;
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    const unchangedX = root.runtime.inactiveValuesMemo.get('')?.find((entry) =>
      entry.path === '/group/deep/x');
    writeSchemaNode(leaf, 'newer', 'callerReplace', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/group/leaf', value: 'newer' },
      { path: '/group/deep/x', value: 1 },
    ]);
    expect(root.runtime.inactiveValuesMemo.get('')?.find((entry) =>
      entry.path === '/group/deep/x')).toBe(unchangedX);
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.group?.structure?.leaf?.raw).toBe('newer');
    expect(root.structure?.group?.structure?.deep?.structure?.x?.raw).toBe(1);
  });

  it('WRITE-087 lists inactive values in blueprint document order', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      zeta: { type: 'string', controls: { active: '../flag' } },
      alpha: { type: 'string', controls: { active: '../flag' } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, zeta: 'Z', alpha: 'A' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')?.map((entry) => entry.path))
      .toEqual(['/zeta', '/alpha']);
  });

  it('WRITE-087 reuses inactive array and entry references on unrelated commits', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      other: { type: 'number' },
      secret: { type: 'string', controls: { active: '../flag' } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, other: 1, secret: 'held' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    const inactive = root.runtime.inactiveValuesMemo.get('');
    const entry = inactive?.[0];
    const latentIteration = vi.spyOn(root.runtime.latentRaw, Symbol.iterator);
    writeSchemaNode(root.structure!.other, 2, 'input', SetValueOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')).toBe(inactive);
    expect(root.runtime.inactiveValuesMemo.get('')?.[0]).toBe(entry);
    expect(latentIteration).not.toHaveBeenCalled();
  });

  it('WRITE-087 includes a detached host that holds a wrong-kind value', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      group: { type: 'object', controls: { active: '../flag' }, properties: {
        leaf: { type: 'string' },
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, group: 'wrong' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/group', value: 'wrong' },
    ]);
  });

  it('25C-04 reuses the effective-schema memo while active declarations remain stable', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      value: { type: 'number' },
    } });
    writeSchemaNode(root, { value: 1 }, 'callerReplace', SetValueOption.Overwrite);
    const effective = root.structure!.value.schema;
    writeSchemaNode(root.structure!.value, 2, 'input', SetValueOption.Overwrite);
    expect(root.structure!.value.schema).toBe(effective);
  });

  it('SETTLE-043 retains calculated references across an equal gated write', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../flag' } },
    } });
    writeSchemaNode(root, { flag: true, value: 'same' },
      'callerReplace', SetValueOption.Overwrite);
    const emit = root.emit;
    const local = root.local;
    const children = root.children;
    const revision = root.structure!.value.revision;
    writeSchemaNode(root, emit, 'callerReplace', SetValueOption.Overwrite);
    expect(root.emit).toBe(emit);
    expect(root.local).toBe(local);
    expect(root.children).toBe(children);
    expect(root.structure!.value.revision).toBe(revision);
  });

  it('SETTLE-043 keeps a NaN child parent reference on an unrelated equal write', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { root } = createTestTree({ type: 'object', properties: {
      amount: { type: 'number' }, sibling: { type: 'string' },
    } });
    writeSchemaNode(root, { amount: NaN, sibling: 'same' },
      'callerReplace', SetValueOption.Overwrite);
    const emit = root.emit;
    const local = root.local;
    const sibling = root.structure?.sibling;
    if (!sibling) throw new Error('Expected a sibling after the initial write');
    writeSchemaNode(sibling, 'same', 'input', SetValueOption.Overwrite);
    expect(root.emit).toBe(emit);
    expect(root.local).toBe(local);
    expect(root.behavior.assemble(root, root.children ?? [])).toBe(local);
  });

  it('VALUE-037 warns about non-JSON data inside a whole terminal value only in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const first = createTestTree({ type: 'object', options: { terminal: true } }).root;
    writeSchemaNode(first, { bad: undefined }, 'callerReplace', SetValueOption.Overwrite);
    expect(warn.mock.calls.some((call) => String(call[0]).includes('NON_JSON_WHOLE_VALUE')))
      .toBe(true);
    warn.mockClear();
    vi.stubEnv('NODE_ENV', 'production');
    const second = createTestTree({ type: 'object', options: { terminal: true } }).root;
    writeSchemaNode(second, { bad: undefined }, 'callerReplace', SetValueOption.Overwrite);
    expect(warn).not.toHaveBeenCalled();
  });
});
