import { describe, expect, it } from 'vitest';

import { FieldNodeEventType } from '@/schema-form';
import { EXTERNAL_VALUE_REVISION } from '@/schema-form/constants/externalValueRevision';

import { reloadFieldNodeForm } from '../../core/surface/utils/binding/reloadFieldNodeForm';
import { attempt, build, codes, diag } from './probeHelpers';

describe('H1 per-item derived that throws on one item', () => {
  it('a throwing item does not stop the other items', () => {
    const { root, records, mountError } = build(
      {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                upper: {
                  type: 'string',
                  controls: { derived: '(../name).toUpperCase()' },
                },
              },
            },
          },
        },
      },
      { rows: [{ name: 'a' }, { name: 'b' }] },
    );
    expect(mountError).toBeUndefined();
    expect(root.value).toEqual({
      rows: [
        { name: 'a', upper: 'A' },
        { name: 'b', upper: 'B' },
      ],
    });
    const thrown = attempt(() =>
      root.setValue({ rows: [{}, { name: 'c' }] }),
    );
    diag('H1', { thrown: String(thrown), codes: codes(records), value: root.value });
    expect(root.find('/rows/1/upper').value).toBe('C');
  });

  it('a row added later still derives after an earlier row threw', () => {
    const { root, records } = build(
      {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                upper: {
                  type: 'string',
                  controls: { derived: '(../name).toUpperCase()' },
                },
              },
            },
          },
        },
      },
      { rows: [] },
    );
    const rows = root.find('/rows');
    const t1 = attempt(() => rows.push({}));
    const t2 = attempt(() => rows.push({ name: 'z' }));
    diag('H1b', { t1: String(t1), t2: String(t2), codes: codes(records), value: root.value });
    expect(root.find('/rows/1/upper').value).toBe('Z');
  });
});

describe('H2 active gate that throws', () => {
  it('gate failure keeps the field and later writes still settle', () => {
    const { root, records, mountError } = build(
      {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: {
            type: 'string',
            controls: { active: '(../a).length > 1' },
          },
          c: { type: 'string', controls: { derived: '(../a ?? "") + "!"' } },
        },
      },
      { a: 'xx', b: 'keep' },
    );
    expect(root.value).toEqual({ a: 'xx', b: 'keep', c: 'xx!' });
    const thrown = attempt(() => root.find('/a').setValue(undefined));
    diag('H2', {
      mountError: String(mountError),
      thrown: String(thrown),
      codes: codes(records),
      value: root.value,
      active: root.find('/b')?.isActive,
    });
    expect(root.find('/c').value).toBe('!');
    const thrown2 = attempt(() => root.find('/a').setValue('yyy'));
    diag('H2b', { thrown: String(thrown2), value: root.value });
    expect(root.value).toEqual({ a: 'yyy', b: 'keep', c: 'yyy!' });
  });
});

describe('H3 array index -0', () => {
  const schema = {
    type: 'object',
    properties: { list: { type: 'array', items: { type: 'string' } } },
  };
  it('insert(-0) inserts at the start', () => {
    const { root } = build(schema, { list: ['a', 'b'] });
    const list = root.find('/list');
    const thrown = attempt(() => list.insert(-0, 'z'));
    diag('H3 insert', { thrown: String(thrown), value: root.value });
    expect(root.value).toEqual({ list: ['z', 'a', 'b'] });
  });
  it('remove(-0) removes the first item', () => {
    const { root } = build(schema, { list: ['a', 'b'] });
    const thrown = attempt(() => root.find('/list').remove(-0));
    diag('H3 remove', { thrown: String(thrown), value: root.value });
    expect(root.value).toEqual({ list: ['b'] });
  });
  it('update(-0) updates the first item', () => {
    const { root } = build(schema, { list: ['a', 'b'] });
    const thrown = attempt(() => root.find('/list').update(-0, 'q'));
    diag('H3 update', { thrown: String(thrown), value: root.value });
    expect(root.value).toEqual({ list: ['q', 'b'] });
  });
});

describe('H4/H5 subscription cleanup', () => {
  const schema = { type: 'object', properties: { a: { type: 'string' } } };
  it('H4 a repeated cleanup call does not remove a newer subscription', () => {
    const { root } = build(schema, { a: 'x' });
    const a = root.find('/a');
    const off1 = a.subscribe(() => {});
    off1();
    const seen: number[] = [];
    a.subscribe((e: any) => seen.push(e.type));
    off1();
    a.setValue('y');
    expect(seen.length).toBe(1);
  });
  it('H5 the same listener subscribed twice survives one cleanup', () => {
    const { root } = build(schema, { a: 'x' });
    const a = root.find('/a');
    const seen: number[] = [];
    const listener = (e: any) => seen.push(e.type);
    const off1 = a.subscribe(listener);
    a.subscribe(listener);
    off1();
    a.setValue('y');
    diag('H5', seen);
    expect(seen.length).toBe(1);
  });
});

describe('H7/H8 listeners and reset', () => {
  const schema = {
    type: 'object',
    properties: { a: { type: 'string' }, b: { type: 'string' } },
  };
  it('H7 a throwing listener during reset still lets other listeners run', () => {
    const { root } = build(schema, { a: 'x', b: 'y' });
    const a = root.find('/a');
    const b = root.find('/b');
    const seenB: number[] = [];
    a.subscribe(() => {
      throw new Error('boom');
    });
    b.subscribe((e: any) => seenB.push(e.type));
    const thrown = attempt(() => reloadFieldNodeForm(root, { a: 'p', b: 'q' }));
    diag('H7', { thrown: String(thrown), value: root.value, seenB });
    expect(root.value).toEqual({ a: 'p', b: 'q' });
    expect(seenB.some((t) => t & FieldNodeEventType.UpdateValue)).toBe(true);
  });

  it('H8 a listener that resets the form during delivery', () => {
    const { root, changes } = build(schema, { a: 'x', b: 'y' });
    const a = root.find('/a');
    const b = root.find('/b');
    const seenB: any[] = [];
    let done = false;
    a.subscribe(() => {
      if (done) return;
      done = true;
      reloadFieldNodeForm(root, { a: 'r', b: 'r' });
    });
    b.subscribe((e: any) => seenB.push([e.type, b.value]));
    changes.length = 0;
    const thrown = attempt(() => root.setValue({ a: 'A', b: 'B' }));
    diag('H8', { thrown: String(thrown), value: root.value, seenB, changes });
    expect(root.value).toEqual({ a: 'r', b: 'r' });
    expect(changes.at(-1)).toEqual({ a: 'r', b: 'r' });
  });
});

describe('H9 derived on an object host', () => {
  it('derived replaces an object host like setValue does', () => {
    const schema = {
      type: 'object',
      properties: {
        src: { type: 'string' },
        o: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            flag: { type: 'boolean' },
            b: { type: 'string', controls: { active: '../flag === true' } },
          },
          controls: { derived: '({ a: (../src), flag: false })' },
        },
      },
    };
    const { root, records } = build(schema, {
      src: 's0',
      o: { a: 'x', flag: true, b: 'hidden' },
    });
    diag('H9 mount', { value: root.value, codes: codes(records) });
    root.find('/src').setValue('s1');
    diag('H9 after src', { value: root.value });
    root.find('/o/flag').setValue(true);
    diag('H9 after flag', { value: root.value });
    // reference: the same overwrite through setValue
    const ref = build(schema, { src: 's0', o: { a: 'x', flag: true, b: 'hidden' } });
    ref.root.find('/src').setValue('s1');
    ref.root.find('/o').setValue({ a: 's1', flag: false });
    ref.root.find('/o/flag').setValue(true);
    diag('H9 ref', { value: ref.root.value });
    expect(root.value).toEqual(ref.root.value);
  });

  it('derived same-key object write advances the host external revision', () => {
    const schema = {
      type: 'object',
      properties: {
        src: { type: 'string' },
        o: {
          type: 'object',
          properties: { a: { type: 'string' }, b: { type: 'string' } },
          controls: { derived: '({ a: (../src), b: "fixed" })' },
        },
      },
    };
    const { root } = build(schema, { src: 's0' });
    const o = root.find('/o');
    const before = o.revision(EXTERNAL_VALUE_REVISION);
    const types: number[] = [];
    o.subscribe((e: any) => types.push(e.type));
    root.find('/src').setValue('s1');
    diag('H9b', {
      value: root.value,
      before,
      after: o.revision(EXTERNAL_VALUE_REVISION),
      types,
    });
    expect(o.revision(EXTERNAL_VALUE_REVISION)).toBeGreaterThan(before);
  });
});
