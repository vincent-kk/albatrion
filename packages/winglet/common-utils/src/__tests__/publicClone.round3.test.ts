import { runInNewContext, runInThisContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { clone } from '../index';

/** A fixture carries a built-in and the operation that observes its internal slots. */
interface Fixture {
  value: unknown;
  read: (value: unknown) => unknown;
}

describe('round-3 clone realm equivalence', () => {
  it.each([
    ['Map', 'new Map([["a", { count: 1 }]])', 'v => v.get("a").count'],
    ['Set', 'new Set([1, 2])', 'v => [v.size, v.has(2)]'],
    ['Date', 'new Date(7)', 'v => v.getTime()'],
    ['invalid Date', 'new Date(NaN)', 'v => v.getTime()'],
    [
      'RegExp',
      'Object.assign(/a/g, { lastIndex: 3 })',
      'v => [v.source, v.flags, v.lastIndex]',
    ],
    [
      'ArrayBuffer',
      'Uint8Array.from([1,2,3]).buffer',
      'v => Array.from(new Uint8Array(v))',
    ],
    [
      'SharedArrayBuffer',
      'new SharedArrayBuffer(8)',
      'v => [v.byteLength, new Uint8Array(v).length]',
    ],
    [
      'DataView',
      'new DataView(new ArrayBuffer(8),2,4)',
      'v => [v.byteOffset,v.byteLength,v.getUint8(0)]',
    ],
    ['Uint8Array', 'new Uint8Array([1,2])', 'v => Array.from(v)'],
    [
      'Uint8ClampedArray',
      'new Uint8ClampedArray([1,255])',
      'v => Array.from(v)',
    ],
    ['Int16Array', 'new Int16Array([-1,2])', 'v => Array.from(v)'],
    ['Uint16Array', 'new Uint16Array([1,2])', 'v => Array.from(v)'],
    ['Int32Array', 'new Int32Array([-1,2])', 'v => Array.from(v)'],
    ['Uint32Array', 'new Uint32Array([1,2])', 'v => Array.from(v)'],
    ['Float32Array', 'new Float32Array([1.5,NaN])', 'v => Array.from(v)'],
    ['BigUint64Array', 'new BigUint64Array([1n,2n])', 'v => Array.from(v)'],
    ['Int8Array', 'new Int8Array([-1,2])', 'v => Array.from(v)'],
    ['Float64Array', 'new Float64Array([1.5,NaN])', 'v => Array.from(v)'],
    ['BigInt64Array', 'new BigInt64Array([1n,-2n])', 'v => Array.from(v)'],
    ['match array', '/a/.exec("a")', 'v => [v[0],v.index,v.input]'],
    ['Number box', 'new Number(7)', 'v => v.valueOf()'],
    ['String box', 'new String("abc")', 'v => v.valueOf()'],
    ['Boolean box', 'new Boolean(false)', 'v => v.valueOf()'],
    [
      'TypeError with cause',
      'new TypeError("m",{cause:new Error("c")})',
      'v => [v.name,v.message,v.cause.message]',
    ],
    [
      'AggregateError',
      'new AggregateError([new Error("a")],"agg")',
      'v => [v.message,v.errors[0].message]',
    ],
    [
      'class instance',
      'new (class Custom { constructor(){Object.defineProperty(this,"x",{value:2,enumerable:true});} get x(){return 1;} })()',
      'v => [v.x,Object.hasOwn(v,"x")]',
    ],
  ])(
    '%s has the same usable state in either realm',
    (_name, expression, reader) => {
      const script = `({value:(${expression}),read:(${reader})})`;
      const local: Fixture = runInThisContext(script);
      const foreign: Fixture = runInNewContext(script);
      const copy = clone(foreign.value);
      expect(foreign.read(copy)).toEqual(local.read(clone(local.value)));
      expect(copy).not.toBe(foreign.value);
    },
  );

  it('cyclic collections retain their cycles when cloned in either realm', () => {
    const map: Map<unknown, unknown> = runInNewContext(
      '(()=>{const m=new Map();m.set("self",m);return m;})()',
    );
    const set: Set<unknown> = runInNewContext(
      '(()=>{const s=new Set();s.add(s);return s;})()',
    );
    const mapCopy = clone(map);
    const setCopy = clone(set);
    expect(mapCopy.get('self')).toBe(mapCopy);
    expect(setCopy.has(setCopy)).toBe(true);
  });

  it('forged built-in tags without slots remain plain clones', () => {
    for (const tag of [
      'Map',
      'Date',
      'Set',
      'RegExp',
      'ArrayBuffer',
      'DataView',
    ]) {
      const value = { [Symbol.toStringTag]: tag, count: 1 };
      expect(clone(value).count).toBe(1);
      expect(clone(value)).not.toBe(value);
    }
  });
  it('foreign error stack and non-enumerable custom name match local cloning', () => {
    const value: Error = runInNewContext(
      'Object.defineProperty(new TypeError("m"),"name",{value:"Custom",configurable:true})',
    );
    const copy = clone(value);
    expect(copy.stack).toBe(value.stack);
    expect(copy.name).toBe(value.name);
  });

  it('extra collection keys follow the same documented limit in both realms', () => {
    for (const expression of ['new Map([["a",1]])', 'new Set([1])']) {
      const local: object = runInThisContext(expression);
      const foreign: object = runInNewContext(expression);
      const symbol = Symbol('extra');
      for (const value of [local, foreign]) {
        Reflect.set(value, 'extra', 2);
        Reflect.set(value, symbol, 3);
      }
      expect(Reflect.ownKeys(clone(foreign))).toEqual(
        Reflect.ownKeys(clone(local)),
      );
    }
  });

  it.skipIf(typeof Blob === 'undefined')(
    'vm-created Blob subclass preserves its bytes through the available host API',
    async () => {
      const value: Blob = runInNewContext(
        'new (class ForeignBlob extends Blob {})(["abc"],{type:"text/plain"})',
        { Blob },
      );
      const copy = clone(value);
      expect(await copy.text()).toBe(await value.text());
      expect(copy.type).toBe(value.type);
      expect(copy).not.toBe(value);
    },
  );

  it.skipIf(typeof File === 'undefined')(
    'vm-created File subclass preserves metadata through the available host API',
    async () => {
      const value: File = runInNewContext(
        'new (class ForeignFile extends File {})(["abc"],"a.txt",{lastModified:7})',
        { File },
      );
      const copy = clone(value);
      expect([copy.name, copy.lastModified, await copy.text()]).toEqual([
        value.name,
        value.lastModified,
        await value.text(),
      ]);
      expect(copy).not.toBe(value);
    },
  );
});
