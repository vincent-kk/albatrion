import { describe, expect, it } from 'vitest';

import { FieldNodeEventType, FormErrorCode } from '@/schema-form';

import { attempt, build, codes, diag } from './probeHelpers';

describe('LC2 listener throws', () => {
  it('A1 second listener of the same node still receives the event', () => {
    const { root } = build(
      { type: 'object', properties: { a: { type: 'string' } } },
      { a: 'x' },
    );
    const a = root.find('/a');
    const seen: number[] = [];
    a.subscribe(() => {
      throw new Error('boom');
    });
    a.subscribe((e: any) => seen.push(e.type));
    const thrown = attempt(() => a.setValue('y'));
    expect(thrown).toBeDefined();
    expect(a.value).toBe('y');
    expect(seen.some((t) => t & FieldNodeEventType.UpdateValue)).toBe(true);
  });

  it('A2 next write after a throwing listener delivers exactly once', () => {
    const { root } = build(
      { type: 'object', properties: { a: { type: 'string' } } },
      { a: 'x' },
    );
    const a = root.find('/a');
    let fail = true;
    const seen: any[] = [];
    a.subscribe((e: any) => {
      seen.push(e.type);
      if (fail) throw new Error('boom');
    });
    attempt(() => a.setValue('y'));
    fail = false;
    seen.length = 0;
    a.setValue('z');
    expect(seen.length).toBe(1);
  });

  it('A3 listener on another node still receives its event', () => {
    const { root } = build(
      {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string', controls: { derived: '../a' } },
        },
      },
      { a: 'x' },
    );
    const a = root.find('/a');
    const b = root.find('/b');
    const seenB: number[] = [];
    a.subscribe(() => {
      throw new Error('boom');
    });
    b.subscribe((e: any) => seenB.push(e.type));
    attempt(() => a.setValue('y'));
    expect(b.value).toBe('y');
    expect(seenB.some((t) => t & FieldNodeEventType.UpdateValue)).toBe(true);
  });

  it('A4 onChange still runs and the failure is reported', () => {
    const { root, records, changes } = build(
      { type: 'object', properties: { a: { type: 'string' } } },
      { a: 'x' },
    );
    const a = root.find('/a');
    a.subscribe(() => {
      throw new Error('boom');
    });
    changes.length = 0;
    records.length = 0;
    attempt(() => a.setValue('y'));
    expect(changes).toEqual([{ a: 'y' }]);
    expect(codes(records)).toContain(FormErrorCode.ListenerThrew);
  });
});

describe('LC2 listener mutates listener set', () => {
  it('B2 unsubscribing a later listener during delivery', () => {
    const { root } = build(
      { type: 'object', properties: { a: { type: 'string' } } },
      { a: 'x' },
    );
    const a = root.find('/a');
    const calls: string[] = [];
    let off2: () => void = () => {};
    a.subscribe(() => {
      calls.push('1');
      off2();
    });
    off2 = a.subscribe(() => calls.push('2'));
    a.setValue('y');
    diag('B2 calls', calls);
  });

  it('B3 subscribing during delivery', () => {
    const { root } = build(
      { type: 'object', properties: { a: { type: 'string' } } },
      { a: 'x' },
    );
    const a = root.find('/a');
    const calls: string[] = [];
    let added = false;
    a.subscribe(() => {
      calls.push('1');
      if (!added) {
        added = true;
        a.subscribe(() => calls.push('new'));
      }
    });
    a.setValue('y');
    diag('B3 first', [...calls]);
    calls.length = 0;
    a.setValue('z');
    diag('B3 second', calls);
  });
});

describe('FP1 derived throws', () => {
  it('C1 derived throws at mount and recovers when the source appears', () => {
    const { root, records, mountError } = build(
      {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string', controls: { derived: '(../a).toUpperCase()' } },
        },
      },
      {},
    );
    diag('C1 mount', { codes: codes(records), value: root.value, mountError: String(mountError) });
    records.length = 0;
    const thrown = attempt(() => root.find('/a').setValue('x'));
    diag('C1 write', { thrown: String(thrown), codes: codes(records) });
    expect(root.value).toEqual({ a: 'x', b: 'X' });
  });

  it('C2 derived throws later; another derived rule still runs', () => {
    const { root, records } = build(
      {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string', controls: { derived: '(../a).toUpperCase()' } },
          c: { type: 'string', controls: { derived: '(../a ?? "") + "!"' } },
        },
      },
      { a: 'x' },
    );
    expect(root.value).toEqual({ a: 'x', b: 'X', c: 'x!' });
    const thrown = attempt(() => root.find('/a').setValue(undefined));
    diag('C2', { thrown: String(thrown), codes: codes(records), value: root.value });
    expect(root.find('/c').value).toBe('!');
    expect(root.find('/b').value).toBe('X');
    const thrown2 = attempt(() => root.find('/a').setValue('q'));
    diag('C2b', { thrown: String(thrown2), value: root.value });
    expect(root.value).toEqual({ a: 'q', b: 'Q', c: 'q!' });
  });
});

describe('BS2 numbers', () => {
  it('C5 derived NaN settles without budget errors', () => {
    const { root, records } = build(
      {
        type: 'object',
        properties: {
          qty: { type: 'number' },
          price: { type: 'number' },
          total: { type: 'number', controls: { derived: '../qty * ../price' } },
        },
      },
      { qty: 2 },
    );
    diag('C5 mount', { codes: codes(records), value: root.value });
    records.length = 0;
    root.find('/qty').setValue(3);
    diag('C5 qty', { codes: codes(records), value: root.value });
    expect(codes(records).filter((c) => !c.includes('MISFIT'))).toEqual([]);
    root.find('/price').setValue(5);
    expect(root.value).toEqual({ qty: 3, price: 5, total: 15 });
  });

  it('C6 derived array with NaN settles', () => {
    const { root, records } = build(
      {
        type: 'object',
        properties: {
          a: { type: 'number' },
          list: {
            type: 'array',
            items: { type: 'number' },
            controls: { derived: '[../a * 1, 2]' },
          },
        },
      },
      {},
    );
    diag('C6 mount', { codes: codes(records), value: root.value });
    expect(codes(records).filter((c) => !c.includes('MISFIT'))).toEqual([]);
    root.find('/a').setValue(4);
    expect(root.value).toEqual({ a: 4, list: [4, 2] });
  });

  it('C8 -0 and 0 are one value for delivery', () => {
    const { root } = build(
      { type: 'object', properties: { n: { type: 'number' } } },
      { n: 0 },
    );
    const n = root.find('/n');
    const seen: number[] = [];
    n.subscribe((e: any) => seen.push(e.type));
    const valueBefore = root.value;
    n.setValue(-0);
    diag('C8', { seen, isNeg: Object.is(n.value, -0), sameRoot: root.value === valueBefore });
    expect(seen.filter((t) => t & FieldNodeEventType.UpdateValue)).toEqual([]);
  });

  it('C9 number parse of strings', () => {
    const { root } = build(
      {
        type: 'object',
        properties: {
          n: { type: 'number' },
          i: { type: 'integer' },
        },
      },
      {},
    );
    const n = root.find('/n');
    const i = root.find('/i');
    const out: any[] = [];
    for (const s of ['1e21', '0x10', ' 12 ', '', '1_000', 'Infinity', '-0', '9007199254740993', '1.5', '0b11', '.5', '5.', '1e3', '-', '+5', '1,000']) {
      n.setValue(s);
      i.setValue(s);
      out.push([s, n.value, n.isMisfit, i.value, i.isMisfit]);
    }
    diag('C9', out);
  });
});
