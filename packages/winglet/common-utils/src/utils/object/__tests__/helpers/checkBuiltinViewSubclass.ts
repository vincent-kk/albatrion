import { runInNewContext } from 'node:vm';
import { expect } from 'vitest';

import { clone } from '../../clone';

/**
 * Compare a built-in view subclass with the same native view across realm and window shapes.
 * @param kind Native typed-array or DataView constructor name.
 * @param partial Whether the view selects the middle of a larger buffer.
 * @param foreign Whether native constructors belong to another realm.
 * @param hostileSlice Whether subclass slice and species hooks refuse invocation.
 * @returns Nothing; assertions pin identity, slot contents and independent storage.
 */
export function checkBuiltinViewSubclass(kind: string, partial: boolean, foreign: boolean, hostileSlice = false): void {
  const constructors = Object.fromEntries([
    'ArrayBuffer', 'DataView', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
    'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float16Array',
    'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array',
  ].map(name => [name, Reflect.get(globalThis, name)]));
  const fixture = runInNewContext(`
    let constructions = 0;
    class Sub extends ${kind} {
      constructor(...args) { super(...args); constructions++; }
      label() { return '${kind}'; }
      first() { return ${kind === 'DataView' ? 'this.getUint8(0)' : 'this[0]'}; }
      ${hostileSlice ? 'slice() { throw new Error("subclass slice called"); } static get [Symbol.species]() { throw new Error("subclass species read"); }' : ''}
    }
    const width = ${kind === 'DataView' ? '1' : kind + '.BYTES_PER_ELEMENT'};
    const buffer = new ArrayBuffer(width * 9);
    const bytes = new Uint8Array(buffer);
    for (let index = 0; index < bytes.length; index++) bytes[index] = (index * 31 + 7) & 255;
    const offset = ${partial ? '2 * width' : '0'};
    const length = ${partial ? '3' : '9'};
    const value = new Sub(buffer, offset, length);
    const plain = new ${kind}(buffer, offset, length);
    value.field = { value: 1 };
    plain.field = { value: 1 };
    constructions = 0;
    ({ value, plain, count: () => constructions });
  `, foreign ? {} : constructors);
  const original = fixture.value;
  const copy = clone(original);
  const plainCopy = clone(fixture.plain);
  expect(fixture.count()).toBe(0);
  expect(Object.getPrototypeOf(copy)).toBe(Object.getPrototypeOf(original));
  expect(copy.label()).toBe(kind);
  expect(copy.first()).toBe(original.first());
  expect(copy.length).toBe(plainCopy.length);
  expect(copy.byteLength).toBe(original.byteLength);
  expect(copy.byteOffset).toBe(plainCopy.byteOffset);
  expect(copy.byteOffset).toBe(kind === 'DataView' ? original.byteOffset : 0);
  expect(copy.buffer.byteLength).toBe(plainCopy.buffer.byteLength);
  const sourceBytes = new Uint8Array(original.buffer, original.byteOffset, original.byteLength);
  const copiedBytes = new Uint8Array(copy.buffer, copy.byteOffset, copy.byteLength);
  expect(Array.from(copiedBytes)).toEqual(Array.from(sourceBytes));
  expect(copy.buffer).not.toBe(original.buffer);
  expect(copy.buffer).not.toBe(plainCopy.buffer);
  if (kind === 'DataView') {
    expect(copy.field).toEqual(original.field);
    expect(copy.field).not.toBe(original.field);
  } else expect(copy.field).toBeUndefined();
  const first = sourceBytes[0];
  copiedBytes[0] ^= 255;
  expect(sourceBytes[0]).toBe(first);
}
