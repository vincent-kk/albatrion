import { Buffer } from 'node:buffer';
import { runInNewContext, runInThisContext } from 'node:vm';
import { expect, it } from 'vitest';

import { clone } from '../clone';

/** A realm-owned value and reader exercise the same built-in state without type assertions. */
interface Fixture { value: object; read: (value: unknown) => unknown }

it.each(['Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError'])(
  'round-3 common-utils 5: %s keeps its subtype, cause and explicit Error tag across realms', name => {
    const script = `({value:Object.assign(new ${name}('example',{cause:{count:1}}),{[Symbol.toStringTag]:'Error'}),read:v=>[v.name,v.message,v.cause.count,v instanceof ${name}]})`;
    const local: Fixture = runInThisContext(script);
    const foreign: Fixture = runInNewContext(script);
    expect(foreign.read(clone(foreign.value))).toEqual(local.read(clone(local.value)));
  },
);

it.skipIf(typeof Reflect.get(globalThis, 'Float16Array') !== 'function')('round-3 common-utils 5: available Float16Array values retain the same contents in either realm', () => {
  const script = '({value:new Float16Array([1.5,-2,NaN]),read:v=>Array.from(v)})';
  const local: Fixture = runInThisContext(script);
  const foreign: Fixture = runInNewContext(script);
  expect(foreign.read(clone(foreign.value))).toEqual(local.read(clone(local.value)));
});

it('round-3 common-utils 5: a Buffer over VM-owned typed-array storage copies its bytes', () => {
  const foreign: Uint8Array = runInNewContext('Object.setPrototypeOf(new Uint8Array([1,2,3]), Buffer.prototype)', { Buffer });
  expect(Buffer.isBuffer(foreign)).toBe(true);
  const copy = clone(foreign);
  expect(Buffer.isBuffer(copy)).toBe(true);
  expect(Array.from(copy)).toEqual(Array.from(clone(Buffer.from([1,2,3]))));
  copy[0] = 9;
  expect(foreign[0]).toBe(1);
});

it('round-3 common-utils 5: nonzero shared buffers and offset views retain independent bytes', () => {
  for (const expression of [
    '(()=>{const b=new SharedArrayBuffer(8);new Uint8Array(b).set([1,2,3]);return b;})()',
    '(()=>{const b=new ArrayBuffer(8);new Uint8Array(b).set([0,0,3,4,5]);return new DataView(b,2,4);})()',
  ]) {
    const reader = expression.includes('DataView') ? 'v=>[v.byteOffset,v.byteLength,v.getUint8(0),v.getUint8(1)]' : 'v=>Array.from(new Uint8Array(v))';
    const local: Fixture = runInThisContext(`({value:${expression},read:${reader}})`);
    const foreign: Fixture = runInNewContext(`({value:${expression},read:${reader}})`);
    expect(foreign.read(clone(foreign.value))).toEqual(local.read(clone(local.value)));
  }
});

it('round-3 common-utils 5: slotless Error tags preserve ordinary objects without invoking their constructors', () => {
  for (const expression of [
    '({[Symbol.toStringTag]:"Error",count:1,constructor:()=>{throw new Error("must not construct")}})',
    'Object.assign(Object.create({}),{[Symbol.toStringTag]:"Error",count:1,constructor:()=>{throw new Error("must not construct")}})',
    'new (class Tagged { [Symbol.toStringTag]="Error"; count=1; constructor(){ if(arguments.length)throw new Error("must not construct"); } })()',
  ]) {
    const local: Record<PropertyKey, unknown> = runInThisContext(expression);
    const foreign: Record<PropertyKey, unknown> = runInNewContext(expression);
    const copy = clone(foreign);
    expect(copy.count).toBe(clone(local).count);
    expect(Reflect.ownKeys(copy)).toEqual(Reflect.ownKeys(clone(local)));
    expect(copy).not.toBe(foreign);
  }
});
