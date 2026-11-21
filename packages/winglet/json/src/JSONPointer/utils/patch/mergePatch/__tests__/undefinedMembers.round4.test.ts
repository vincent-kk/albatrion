import { describe, expect, it } from 'vitest';
import { mergePatch } from '../mergePatch';

/** Build matching nesting around one leaf without assigning reserved keys. */
function nest(value: Record<string, unknown>, depth: number) {
  let result = value;
  for (let index = 0; index < depth; index++) result = { child: result };
  return result;
}

describe('round-4 undefined members equal their JSON omission', () => {
  for (const immutable of [true, false])
    for (const depth of [0, 1, 3])
      for (const key of ['nickname', '__proto__', 'constructor', 'prototype'])
        it(`${key} depth=${depth} immutable=${immutable}`, () => {
          const patch = Object.defineProperty({ name: 'B' }, key, { value: undefined, enumerable: true });
          const expectedPatch = JSON.parse(JSON.stringify(patch));
          expect(mergePatch(nest({ name: 'A' }, depth), nest(patch, depth), immutable)).toEqual(
            mergePatch(nest({ name: 'A' }, depth), nest(expectedPatch, depth), immutable),
          );
          expect(mergePatch(nest({ [key]: 7 }, depth), nest(patch, depth), immutable)).toEqual(
            mergePatch(nest({ [key]: 7 }, depth), nest(expectedPatch, depth), immutable),
          );
        });
});
