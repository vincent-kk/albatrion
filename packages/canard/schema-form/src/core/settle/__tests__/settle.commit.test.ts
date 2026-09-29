import { afterEach, describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-write
describe('settle commit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
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
