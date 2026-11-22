import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';
import { isTypedArray } from '../isTypedArray';

it.each(['new DataView(new ArrayBuffer(4))', 'new Uint8Array(4)', 'new Int16Array(4)'])('round-4 realm equivalence: %s', expression => {
  expect(isTypedArray(runInNewContext(expression))).toBe(isTypedArray(runInNewContext(expression, { DataView, ArrayBuffer, Uint8Array, Int16Array })));
});
