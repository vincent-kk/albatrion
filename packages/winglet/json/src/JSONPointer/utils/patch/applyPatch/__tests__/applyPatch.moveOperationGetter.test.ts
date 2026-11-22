import { expect, it } from 'vitest';

import { Operation } from '../../../patchModel';
import { applyPatch } from '../applyPatch';

it.each([
  ['/b', 2, { b: { value: 2 } }, { b: { value: 2 } }],
  ['', 3, { value: 2 }, {}],
] as const)(
  'moves to %j within the operation getter read budget',
  (path, maxReads, expected, remaining) => {
    let reads = 0;
    const source = { a: { value: 2 } };
    const patch = {
      get op() {
        if (++reads > maxReads) throw new Error(`op read #${reads}`);
        return Operation.MOVE;
      },
      from: '/a',
      path,
    };

    expect(applyPatch(source, [patch], { immutable: false })).toEqual(expected);
    expect(source).toEqual(remaining);
    expect(reads).toBe(maxReads);
  },
);
