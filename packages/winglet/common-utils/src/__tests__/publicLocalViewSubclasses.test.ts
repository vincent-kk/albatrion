import { expect, it } from 'vitest';

import { clone } from '../index';

it('uses typed array species and copies a partial view to offset zero', () => {
  let constructed = 0;
  class Bytes extends Uint8Array {
    constructor(buffer: ArrayBuffer, offset: number, length: number) {
      super(buffer, offset, length);
      constructed++;
    }
  }
  const source = new Bytes(new ArrayBuffer(8), 2, 3);
  source.set([4, 5, 6]);
  const copy = clone(source);
  expect(constructed).toBe(2);
  expect(Object.getPrototypeOf(copy)).toBe(Bytes.prototype);
  expect(copy.byteOffset).toBe(0);
  expect([...copy]).toEqual([4, 5, 6]);
});

it('copies the DataView bytes through a base view without rerunning its subclass', () => {
  let constructed = 0;
  class View extends DataView<ArrayBuffer> {
    constructor(buffer: ArrayBuffer) {
      super(buffer, 1, 2);
      constructed++;
    }
  }
  const source = new View(new ArrayBuffer(8));
  source.setInt16(0, 1234);
  const copy = clone(source);
  expect(constructed).toBe(1);
  expect(Object.getPrototypeOf(copy)).toBe(DataView.prototype);
  expect(copy.getInt16(0)).toBe(1234);
});

it('reuses the public native constructors for an Error and ArrayBuffer subclass', () => {
  let errors = 0;
  let buffers = 0;
  class AppError extends Error {
    constructor(message: string) {
      super(message);
      errors++;
    }
  }
  class BufferSubclass extends ArrayBuffer {
    constructor(size: number) {
      super(size);
      buffers++;
    }
  }
  expect(clone(new AppError('message'))).toBeInstanceOf(AppError);
  expect(clone(new BufferSubclass(4))).toBeInstanceOf(BufferSubclass);
  expect([errors, buffers]).toEqual([2, 2]);
});
