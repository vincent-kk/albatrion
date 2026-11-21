import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

import { clone } from '../clone';

it.each(['Uint8Array', 'DataView'])(
  'normalizes %s before cloning without running the subclass constructor',
  (kind) => {
    const fixture = runInNewContext(
      `
    let constructions = 0;
    class Sub extends ${kind} {
      constructor(...args) { super(...args); constructions++; }
      label() { return '${kind}'; }
    }
    const buffer = new ArrayBuffer(16);
    new Uint8Array(buffer).set([1, 2, 3, 4, 5, 6, 7, 8]);
    const value = new Sub(buffer, 4, 4);
    constructions = 0;
    ({ value, count: () => constructions });
  `,
      { Uint8Array, DataView, ArrayBuffer },
    );
    const original = fixture.value;
    const native =
      kind === 'DataView'
        ? new DataView(
            original.buffer,
            original.byteOffset,
            original.byteLength,
          )
        : new Uint8Array(original.buffer, original.byteOffset, original.length);
    const copy = clone(native);
    Object.setPrototypeOf(copy, Object.getPrototypeOf(original));
    expect(fixture.count()).toBe(0);
    expect(Object.getPrototypeOf(copy)).toBe(Object.getPrototypeOf(original));
    expect(Reflect.get(copy, 'label')()).toBe(kind);
    expect(copy.byteLength).toBe(original.byteLength);
    expect(
      Array.from(new Uint8Array(copy.buffer, copy.byteOffset, copy.byteLength)),
    ).toEqual(
      Array.from(
        new Uint8Array(
          original.buffer,
          original.byteOffset,
          original.byteLength,
        ),
      ),
    );
    expect(copy.buffer).not.toBe(original.buffer);
  },
);
