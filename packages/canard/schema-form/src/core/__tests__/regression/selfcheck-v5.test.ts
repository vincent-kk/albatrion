import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

// filid:contract factory-single-path
describe('selfcheck-v5 PR-2 regression', () => {
  const sharedDefault = () => makeSchemaNodeTree({ type: 'object', properties: {
    a: { type: 'string' }, b: { type: 'string' },
  }, allOf: [
    { controls: { active: './a !== undefined' }, properties: {
      x: { type: 'number', default: 1 },
    } },
    { controls: { active: './b !== undefined' }, properties: {
      x: { type: 'number', default: 2 },
    } },
  ] }).root;

  it('selfcheck-v5.mjs:93 emits the stored default in either history and uses the last declaration on replacement', () => {
    const first = sharedDefault();
    first.setValue({});
    first.find('/a')?.setValue('x');
    first.find('/b')?.setValue('y');
    const second = sharedDefault();
    second.setValue({});
    second.find('/b')?.setValue('y');
    second.find('/a')?.setValue('x');
    const replaced = sharedDefault();
    replaced.setValue({ a: 'x', b: 'y' });
    expect(first.outputValue).toHaveProperty('x', first.find('/x')?.raw);
    expect(second.outputValue).toHaveProperty('x', second.find('/x')?.raw);
    expect(replaced.find('/x')?.raw).toBe(2);
    expect(replaced.outputValue).toHaveProperty('x', 2);
  });

  const oneFragment = () => makeSchemaNodeTree({ type: 'object', properties: {
    a: { type: 'string' }, z: { type: 'string' },
  }, allOf: [{ controls: { active: './a !== undefined' }, properties: {
    x: { type: 'number', default: 1 },
  } }] }).root;

  it('selfcheck-v5.mjs:107 does not refill after an unrelated partial write', () => {
    const root = oneFragment();
    root.setValue({ a: 'x' });
    root.find('/x')?.setValue(undefined);
    expect(JSON.stringify(root.outputValue)).toBe('{"a":"x"}');
    root.find('/z')?.setValue('q');
    expect(JSON.stringify(root.outputValue)).toBe('{"a":"x","z":"q"}');
    expect(root.find('/x')?.raw).toBeUndefined();
  });

  it('selfcheck-v5.mjs:108 SETTLE-048 keeps a missing value on a non-load replacement', () => {
    const root = oneFragment();
    root.setValue({ a: 'x' });
    root.find('/x')?.setValue(undefined);
    root.find('/z')?.setValue('q');
    root.setValue({ a: 'x', z: 'q' });
    expect(JSON.stringify(root.outputValue)).toBe('{"a":"x","z":"q"}');
    expect(root.find('/x')?.raw).toBeUndefined();
  });

  const nullHost = () => makeSchemaNodeTree({ type: 'object', properties: {
    target: { type: ['object', 'null'], properties: {
      note: { type: 'string' }, reason: { type: 'string', default: 'because' },
    } },
  } }).root;

  it('selfcheck-v5.mjs:318 replaces a null host and revives only new child data', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      note: { type: 'string', default: 'D' }, keep: { type: 'string' },
    } });
    root.setValue({ note: 'typed', keep: 'K1' });
    const note = root.find('/note');
    root.setValue(null);
    expect(root.outputValue).toEqual({});
    note?.setValue('Z');
    expect(root.outputValue).toEqual({ note: 'Z' });
    expect(root.find('/keep')?.raw).toBeUndefined();
  });

  it('selfcheck-v5.mjs:328 fills under null while a later partial write restores the host', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' },
    }, allOf: [{ controls: { active: './a === undefined' }, properties: {
      d: { type: 'string', default: 'D' },
    } }] }, { snapshot: null });
    root.resetSubtree();
    expect(root.find('/d')?.raw).toBe('D');
    root.find('/a')?.setValue('A');
    expect(root.outputValue).toEqual({ a: 'A' });
  });

  it('selfcheck-v5.mjs:388 keeps a dormant declared key outside extras', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      kind: { type: 'string' },
    }, allOf: [{ controls: { active: './kind === "b"' }, properties: {
      e: { type: 'string', default: 'DEF' },
    } }] });
    root.setValue({ kind: 'a', e: 'EXTRA' });
    expect(JSON.stringify(root.outputValue)).toBe('{"kind":"a"}');
    expect(root.extras).toBeUndefined();
    root.find('/kind')?.setValue('b');
    expect(root.outputValue).toEqual({ kind: 'b', e: 'EXTRA' });
    expect(root.find('/e')?.raw).toBe('EXTRA');
  });

  for (const [name, value] of [
    ['selfcheck-v5.mjs:405 wrong string host recovers on child write', 'broken'],
    ['selfcheck-v5.mjs:405 wrong array host recovers on child write', []],
  ] as const) {
    it(name, () => {
      const { root } = makeSchemaNodeTree({ type: 'object', properties: {
        note: { type: 'string' }, keep: { type: 'string' },
      } });
      root.setValue({ keep: 'OLD' });
      const note = root.find('/note');
      root.setValue(value);
      expect(root.outputValue).toEqual({});
      note?.setValue('Z');
      expect(root.outputValue).toEqual({ note: 'Z' });
    });
  }

  it('selfcheck-v5.mjs:444 retains both pure branch values after replacement', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', oneOf: [
      { properties: { a: { type: 'number' } } },
      { properties: { b: { type: 'number' } } },
    ] });
    root.setValue({ a: 1, b: 2 });
    const first = JSON.stringify(root.outputValue);
    root.setValue({ a: 1, b: 2 });
    expect(first).toBe('{"a":1,"b":2}');
    expect(JSON.stringify(root.outputValue)).toBe(first);
    expect(root.find('/a')?.raw).toBe(1);
    expect(root.find('/b')?.raw).toBe(2);
  });

  it('selfcheck-v5.mjs:515 keeps extras and treats present falsy values as present', () => {
    const values = [{}, { n: '' }, { n: null }, { n: {} }, { n: 0 }, { n: false }];
    for (const input of values) {
      const { root } = makeSchemaNodeTree({ type: 'object', properties: {
        n: { type: ['string', 'number', 'boolean', 'object', 'null'], default: 'D' },
      } });
      root.setValue({ ...input, extra: 42 });
      expect(root.outputValue).toHaveProperty('extra', 42);
      expect(root.find('/n')?.raw).toEqual('n' in input ? input.n : 'D');
    }
  });

  it('selfcheck-v5.mjs:527 fills a new fragment after a partial activation', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      on: { type: 'boolean' },
    }, allOf: [{ controls: { active: './on === true' }, properties: {
      child: { type: 'string', default: 'D' },
    } }] });
    root.setValue({ on: false });
    root.find('/on')?.setValue(true);
    expect(root.find('/child')?.raw).toBe('D');
    expect(root.outputValue).toEqual({ on: true, child: 'D' });
  });

  it('selfcheck-v5.mjs:554 serializes the same declared order across write histories', () => {
    const schema = { type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
      c: { type: 'string' }, d: { type: 'string' },
    } } as const;
    const histories = [
      ['d', 'b', 'c', 'a'], ['a', 'c', 'b', 'd'],
    ];
    const outputs = histories.map(history => {
      const { root } = makeSchemaNodeTree(schema);
      root.setValue({});
      for (const key of history) root.find(`/${key}`)?.setValue(`v${key}`);
      return JSON.stringify(root.outputValue);
    });
    const { root } = makeSchemaNodeTree(schema);
    root.setValue({ d: 'vd', c: 'vc', b: 'vb', a: 'va' });
    outputs.push(JSON.stringify(root.outputValue));
    expect(outputs).toEqual(Array(3).fill('{"a":"va","b":"vb","c":"vc","d":"vd"}'));
  });

  it('selfcheck-v5.mjs:557 serializes extras after declarations in insertion order', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' },
    } });
    root.setValue({ z: 2, a: 'va', y: 1 });
    expect(JSON.stringify(root.outputValue)).toBe('{"a":"va","z":2,"y":1}');
  });

  it('selfcheck-v5.mjs:569 WRITE-096 clears children below a non-load null', () => {
    const root = nullHost();
    root.setValue({ target: { note: 'typed', reason: 'edited' } });
    root.setValue({ target: null });
    expect(root.outputValue).toEqual({});
    expect(root.find('/target')?.raw).toBeNull();
    expect(root.find('/target')?.children?.map(child => child.raw))
      .toEqual([undefined, undefined]);
  });

  it('selfcheck-v5.mjs:606 does not leak values from the object replaced by null', () => {
    const root = nullHost();
    root.setValue({ target: { note: 'secret', reason: 'r' } });
    const note = root.find('/target/note');
    expect(note).not.toBeNull();
    root.setValue({ target: null });
    note?.setValue('x');
    const output = JSON.stringify(root.outputValue);
    expect(output).not.toContain('secret');
    expect(output).not.toContain('"r"');
  });
});
