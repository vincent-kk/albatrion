import { afterEach, describe, expect, it, vi } from 'vitest';

import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-write-commit
describe('settle commit', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  it('VALUE-037 reports an out-of-list mount default as a fill', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        value: { type: ['string', 'boolean'], default: 0 },
      },
    });
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    expect(root.structure?.value?.raw).toBe(0);
    expect(root.runtime.misfitRecords).toEqual([
      expect.objectContaining({
        path: '/value',
        reason: 'ambiguous',
        source: 'fill',
      }),
    ]);
  });

  it('VALUE-037 reports a directly loaded out-of-list value as load', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        value: { type: ['string', 'boolean'], default: 1 },
      },
    });
    loadFieldNodeAtMount(root, { value: 0 }, WriteOption.Overwrite);
    expect(root.structure?.value?.raw).toBe(0);
    expect(root.runtime.misfitRecords).toEqual([
      expect.objectContaining({
        path: '/value',
        reason: 'ambiguous',
        source: 'load',
      }),
    ]);
  });

  it('SETTLE-042 and 18C-39 serialization preserve preferred, declared, and extra key order', () => {
    const { root } = createTestTree({
      type: 'object',
      options: { propertyOrder: ['z', 'a'] },
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
        z: { type: 'string' },
      },
    });
    writeFieldNode(
      root,
      { x: 1, b: 'B', a: 'A', z: 'Z' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(Object.keys(root.emit!)).toEqual(['z', 'a', 'b', 'x']);
    expect(JSON.stringify(root.emit)).toBe('{"z":"Z","a":"A","b":"B","x":1}');
  });

  it('SETTLE-042 restores declared order after a consumer edits a value snapshot', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
      },
    });
    writeFieldNode(
      root,
      { a: 'A', b: 'B' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    if (root.local === null || typeof root.local !== 'object')
      throw new Error('Expected an object snapshot');
    Reflect.deleteProperty(root.local, 'a');
    Reflect.set(root.local, 'a', 'edited');
    Reflect.set(root.local, 'ghost', true);
    writeFieldNode(root.structure!.a, 'A2', 'input', WriteOption.Overwrite);
    expect(Object.keys(root.local!)).toEqual(['a', 'b']);
    expect(root.local).toEqual({ a: 'A2', b: 'B' });
  });

  it('SETTLE-042 recomputes inherited option overlays when a fragment gate changes', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        a: { type: 'string' },
        b: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: './flag' },
          options: { propertyOrder: ['b', 'a'] },
        },
      ],
    });
    writeFieldNode(
      root,
      { flag: false, a: 'A', b: 'B' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(Object.keys(root.emit!)).toEqual(['flag', 'a', 'b']);
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(Object.keys(root.emit!)).toEqual(['b', 'a', 'flag']);
  });

  it('VALUE-034 keeps an empty root object but omits a nested empty host', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        hidden: { type: 'object' },
        kept: { type: 'object', options: { omitEmpty: false } },
      },
    });
    writeFieldNode(
      root,
      { hidden: {}, kept: {} },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.emit).toEqual({ kept: {} });
    const empty = createTestTree({ type: 'object' }).root;
    writeFieldNode(empty, {}, 'callerReplace', WriteOption.Overwrite);
    expect(empty.emit).toEqual({});
  });

  it('VALUE-032 ignores an inherited constructor during new-child marking', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        constructor: { type: 'string' },
      },
    });
    writeFieldNode(root, {}, 'callerReplace', WriteOption.Overwrite);
    expect(
      root.children?.find((child) => child.name === 'constructor')?.raw,
    ).toBeUndefined();
    writeFieldNode(
      root,
      { constructor: 'own' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(
      root.children?.find((child) => child.name === 'constructor')?.raw,
    ).toBe('own');
  });

  it('VALUE-037 lights and clears a mismatch and resends after it relights', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        amount: { type: 'number' },
      },
    });
    writeFieldNode(
      root,
      { amount: 'bad' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect([...root.runtime.misfitPaths]).toEqual(['/amount']);
    expect(root.runtime.misfitRecords).toEqual([
      expect.objectContaining({
        level: 'warning',
        path: '/amount',
        expected: expect.objectContaining({
          schemaType: 'number',
          effective: 'number',
        }),
        received: 'string',
        reason: 'unconvertible',
        source: 'callerReplace',
      }),
    ]);
    writeFieldNode(root.structure!.amount, 2, 'input', WriteOption.Overwrite);
    expect(root.runtime.misfitPaths.size).toBe(0);
    writeFieldNode(
      root.structure!.amount,
      'bad',
      'input',
      WriteOption.Overwrite,
    );
    expect(root.runtime.misfitRecords).toHaveLength(1);
    expect(root.runtime.misfitsMemo?.get('')?.paths).toEqual(['/amount']);
  });

  it('VALUE-037 reports a gate-only narrowing with source gate', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        value: { type: ['number', 'string'] },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: { properties: { value: { type: 'string' } } },
    });
    writeFieldNode(
      root,
      { enabled: false, value: 7 },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.runtime.misfitPaths.size).toBe(0);
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure!.value.schema.schema).toMatchObject({
      type: ['string'],
    });
    expect(root.structure!.value.raw).toBe(7);
    expect(
      root.structure!.value.revisionLedger[FieldNodeEventType.UpdateJsonSchema],
    ).toBe(1);
    expect([...root.runtime.misfitPaths]).toEqual(['/value']);
    expect(root.runtime.misfitRecords?.[0]).toMatchObject({
      path: '/value',
      source: 'gate',
      expected: { effective: ['string'] },
    });
  });

  it('VALUE-037 records every admissible scalar conversion as ambiguous candidates', () => {
    const { root } = createTestTree({ type: ['string', 'boolean'] });
    writeFieldNode(root, 1, 'callerReplace', WriteOption.Overwrite);
    expect(root.runtime.misfitRecords?.[0]).toMatchObject({
      path: '',
      reason: 'ambiguous',
      candidates: ['string', 'boolean'],
    });
  });

  it('EVENT-071 records changed descendants outside the caller target', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
      },
    });
    writeFieldNode(
      root,
      { a: 'old', b: 'same' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { a: 'new', b: 'same' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect([...root.runtime.refreshTargets!]).toEqual(['/a']);
    expect(root.runtime.commitNumber).toBe(2);
    const revision = root.structure!.a.revisionLedger;
    writeFieldNode(root, root.emit, 'callerReplace', WriteOption.Overwrite);
    expect(root.runtime.refreshTargets?.size).toBe(0);
    expect(root.structure!.a.revisionLedger).toBe(revision);
  });

  it('EVENT-071 refreshes a caller-written leaf and excludes only the input-origin leaf', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'string' },
      },
    });
    writeFieldNode(root, { a: 'old' }, 'callerReplace', WriteOption.Overwrite);
    writeFieldNode(
      root.structure!.a,
      'caller',
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect([...root.runtime.refreshTargets!]).toEqual(['/a']);
    writeFieldNode(root.structure!.a, 'typed', 'input', WriteOption.Overwrite);
    expect(root.runtime.refreshTargets?.size).toBe(0);
  });

  it('WRITE-087 memoizes frozen inactive values after a gate leaves', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        secret: { type: 'string', controls: { active: '../flag' } },
      },
    });
    writeFieldNode(
      root,
      { flag: true, secret: 'held' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/secret', value: 'held' },
    ]);
    expect(Object.isFrozen(root.runtime.inactiveValuesMemo.get(''))).toBe(true);
  });

  it('WRITE-087 retains the raw of an initially inactive declared child', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        secret: { type: 'string', controls: { active: '../flag' } },
      },
    });
    writeFieldNode(
      root,
      { flag: false, secret: 'latent' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.secret).toBeUndefined();
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/secret', value: 'latent' },
    ]);
  });

  it('WRITE-087 lists detached object leaves without duplicating their host', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        group: {
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
      {
        flag: true,
        group: {
          leaf: 'L',
          other: 'O',
        },
      },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/group/leaf', value: 'L' },
      { path: '/group/other', value: 'O' },
    ]);
  });

  it('WRITE-087 enumerates the same latent leaves after load or exit', () => {
    const schema = {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            leaf: { type: 'string' },
            deep: { type: 'object', properties: { x: { type: 'number' } } },
          },
        },
      },
    } as const;
    const raw = { flag: false, group: { leaf: 'a', deep: { x: 1 } } };
    const initial = createTestTree(schema).root;
    loadFieldNodeAtMount(initial, raw, WriteOption.Overwrite);
    const exited = createTestTree(schema).root;
    loadFieldNodeAtMount(exited, { ...raw, flag: true }, WriteOption.Overwrite);
    writeFieldNode(
      exited.structure!.flag,
      false,
      'input',
      WriteOption.Overwrite,
    );
    const expected = [
      { path: '/group/leaf', value: 'a' },
      { path: '/group/deep/x', value: 1 },
    ];
    expect(initial.runtime.inactiveValuesMemo.get('')).toEqual(expected);
    expect(exited.runtime.inactiveValuesMemo.get('')).toEqual(expected);
    writeFieldNode(
      initial.structure!.flag,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(initial.structure?.group?.structure?.leaf?.raw).toBe('a');
    expect(initial.structure?.group?.structure?.deep?.structure?.x?.raw).toBe(
      1,
    );
  });

  it('26C-13 enumerates latent leaves under a path live as another kind', () => {
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
    expect(root.structure?.group?.blueprintNode.kind).toBe('string');
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/group', 'object'])),
    ).toBe(false);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/group/leaf', value: 'kept' },
    ]);
    writeFieldNode(root.structure!.kind, 'a', 'input', WriteOption.Overwrite);
    expect(root.structure?.group?.structure?.leaf?.raw).toBe('kept');
  });

  it('26C-13 enumerates one entry for a same-name field under an inactive host', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../flag' },
          allOf: [
            {
              properties: {
                field: { type: 'string', controls: { active: '../sel === 1' } },
              },
            },
            {
              properties: {
                field: { type: 'number', controls: { active: '../sel === 2' } },
              },
            },
          ],
          properties: { sel: { type: 'number' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: false, group: { sel: 1, field: 'test' } },
      WriteOption.Overwrite,
    );
    const entries = root.runtime.inactiveValuesMemo
      .get('')
      ?.filter((entry) => entry.path === '/group/field');
    expect(entries).toEqual([{ path: '/group/field', value: 'test' }]);
  });

  it('26C-13 enumerates one entry for explicit latents of two kinds at a path', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        kind: { type: 'string' },
      },
      allOf: [
        {
          properties: {
            value: { type: 'string', controls: { active: '../kind === "a"' } },
          },
        },
        {
          properties: {
            value: { type: 'number', controls: { active: '../kind === "b"' } },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { kind: 'a', value: 'hello' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    writeFieldNode(root.structure!.value, 3, 'input', WriteOption.Overwrite);
    writeFieldNode(
      root.structure!.kind,
      'none',
      'input',
      WriteOption.Overwrite,
    );
    expect(
      [...root.runtime.latentRaw.keys()].filter((key) =>
        key.startsWith('["/value",'),
      ).length,
    ).toBe(2);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/value', value: 'hello' },
    ]);
  });

  it('WRITE-087 enumerates a replaced detached host like an initially inactive host', () => {
    const schema = {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            leaf: { type: 'string' },
            deep: { type: 'object', properties: { x: { type: 'number' } } },
          },
        },
      },
    } as const;
    const { root } = createTestTree(schema);
    loadFieldNodeAtMount(
      root,
      { flag: true, group: { leaf: 'a', deep: { x: 1 } } },
      WriteOption.Overwrite,
    );
    const group = root.structure!.group;
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    writeFieldNode(
      group,
      { leaf: 'z', deep: { x: 9 } },
      'callerReplace',
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    const initial = createTestTree(schema).root;
    loadFieldNodeAtMount(
      initial,
      { flag: false, group: { leaf: 'z', deep: { x: 9 } } },
      WriteOption.Overwrite,
    );
    const expected = [
      { path: '/group/leaf', value: 'z' },
      { path: '/group/deep/x', value: 9 },
    ];
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual(expected);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual(
      initial.runtime.inactiveValuesMemo.get(''),
    );
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.group?.structure?.leaf?.raw).toBe('z');
    expect(root.structure?.group?.structure?.deep?.structure?.x?.raw).toBe(9);
  });

  it('WRITE-087 records a detached leaf write beside untouched latent siblings', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            leaf: { type: 'string' },
            deep: { type: 'object', properties: { x: { type: 'number' } } },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, group: { leaf: 'a', deep: { x: 1 } } },
      WriteOption.Overwrite,
    );
    const leaf = root.structure!.group.structure!.leaf;
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    const unchangedX = root.runtime.inactiveValuesMemo
      .get('')
      ?.find((entry) => entry.path === '/group/deep/x');
    writeFieldNode(leaf, 'newer', 'callerReplace', WriteOption.Overwrite);
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/group/leaf', value: 'newer' },
      { path: '/group/deep/x', value: 1 },
    ]);
    expect(
      root.runtime.inactiveValuesMemo
        .get('')
        ?.find((entry) => entry.path === '/group/deep/x'),
    ).toBe(unchangedX);
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.group?.structure?.leaf?.raw).toBe('newer');
    expect(root.structure?.group?.structure?.deep?.structure?.x?.raw).toBe(1);
  });

  it('WRITE-087 lists inactive values in blueprint document order', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        zeta: { type: 'string', controls: { active: '../flag' } },
        alpha: { type: 'string', controls: { active: '../flag' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, zeta: 'Z', alpha: 'A' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    expect(
      root.runtime.inactiveValuesMemo.get('')?.map((entry) => entry.path),
    ).toEqual(['/zeta', '/alpha']);
  });

  it('WRITE-087 reuses inactive array and entry references on unrelated commits', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        other: { type: 'number' },
        secret: { type: 'string', controls: { active: '../flag' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, other: 1, secret: 'held' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    const inactive = root.runtime.inactiveValuesMemo.get('');
    const entry = inactive?.[0];
    const latentIteration = vi.spyOn(root.runtime.latentRaw, Symbol.iterator);
    writeFieldNode(root.structure!.other, 2, 'input', WriteOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')).toBe(inactive);
    expect(root.runtime.inactiveValuesMemo.get('')?.[0]).toBe(entry);
    expect(latentIteration).not.toHaveBeenCalled();
  });

  it('WRITE-087 includes a detached host that holds a wrong-kind value', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            leaf: { type: 'string' },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, group: 'wrong' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/group', value: 'wrong' },
    ]);
  });

  it('25C-04 reuses the effective-schema memo while active declarations remain stable', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        value: { type: 'number' },
      },
    });
    writeFieldNode(root, { value: 1 }, 'callerReplace', WriteOption.Overwrite);
    const effective = root.structure!.value.schema;
    writeFieldNode(root.structure!.value, 2, 'input', WriteOption.Overwrite);
    expect(root.structure!.value.schema).toBe(effective);
  });

  it('SETTLE-043 retains calculated references across an equal gated write', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        value: { type: 'string', controls: { active: '../flag' } },
      },
    });
    writeFieldNode(
      root,
      { flag: true, value: 'same' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const emit = root.emit;
    const local = root.local;
    const children = root.children;
    const revision = root.structure!.value.revisionLedger;
    writeFieldNode(root, emit, 'callerReplace', WriteOption.Overwrite);
    expect(root.emit).toBe(emit);
    expect(root.local).toBe(local);
    expect(root.children).toBe(children);
    expect(root.structure!.value.revisionLedger).toBe(revision);
  });

  it('SETTLE-043 keeps a NaN child parent reference on an unrelated equal write', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { root } = createTestTree({
      type: 'object',
      properties: {
        amount: { type: 'number' },
        sibling: { type: 'string' },
      },
    });
    writeFieldNode(
      root,
      { amount: NaN, sibling: 'same' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const emit = root.emit;
    const local = root.local;
    const sibling = root.structure?.sibling;
    if (!sibling) throw new Error('Expected a sibling after the initial write');
    writeFieldNode(sibling, 'same', 'input', WriteOption.Overwrite);
    expect(root.emit).toBe(emit);
    expect(root.local).toBe(local);
    expect(root.behavior.assemble(root, root.children ?? [])).toBe(local);
  });

  it('VALUE-037 warns about non-JSON data inside a whole terminal value only in development', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const first = createTestTree({
      type: 'object',
      options: { terminal: true },
    }).root;
    writeFieldNode(
      first,
      { bad: undefined },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(warn).not.toHaveBeenCalled();
    expect([...(first.runtime.pendingWarningRecords?.values() ?? [])]).toEqual([
      expect.objectContaining({
        code: 'SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE',
        details: { path: '', innerPaths: ['/bad'] },
      }),
    ]);
    warn.mockClear();
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const { createTestTree: freshCreateTestTree } = await import(
      '../../__tests__/fixtures/createTestTree'
    );
    const { writeFieldNode: freshWriteFieldNode } = await import(
      '../utils/write/writeFieldNode'
    );
    const second = freshCreateTestTree({
      type: 'object',
      options: { terminal: true },
    }).root;
    freshWriteFieldNode(
      second,
      { bad: undefined },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(warn).not.toHaveBeenCalled();
    expect(second.runtime.pendingWarningRecords?.size ?? 0).toBe(0);
  });
});
