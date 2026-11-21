import { describe, expect, it } from 'vitest';

import {
  combination,
  digitSum,
  factorial,
  fromBase,
  permutation,
  toBase,
} from '../../index';

/**
 * docs/agents/skills/common-utils-skill/SKILL.md:14 — "Degenerate return over throw. Bad input
 * yields 0, [array], Infinity, NaN, or undefined rather than an error. `factorial` and
 * `fibonacci` are the only exports that throw on invalid input."
 */
const outcome = (run: () => unknown) => {
  try {
    run();
    return 'returned';
  } catch (error) {
    return 'threw: ' + (error as Error).message;
  }
};

describe('r3-contracts common-utils SKILL.md "degenerate return over throw"', () => {
  it('control: factorial, a documented exception, throws on invalid input', () => {
    expect(outcome(() => factorial(-1))).toMatch(/^threw/);
  });

  it('other exports return a degenerate value instead of throwing on invalid input', () => {
    expect({
      combination: outcome(() => combination(-1, 2)),
      permutation: outcome(() => permutation(2.5, 1)),
      digitSum: outcome(() => digitSum(1.5)),
      toBase: outcome(() => toBase(1.5, 2)),
      fromBase: outcome(() => fromBase('', 10)),
    }).toEqual({
      combination: 'returned',
      permutation: 'returned',
      digitSum: 'returned',
      toBase: 'returned',
      fromBase: 'returned',
    });
  });
});
