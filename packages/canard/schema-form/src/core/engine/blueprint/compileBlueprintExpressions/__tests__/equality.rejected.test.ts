import { describe, expect, it } from 'vitest';

import { recognizeEqualityExpression } from '../recognizeEqualityExpression';

describe('equality recognition rejects unsupported syntax', () => {
  it('rejects member reads after a correctly substituted dependency', () => {
    expect(
      recognizeEqualityExpression('./x .length === 1', ['./x']),
    ).toBeUndefined();
    expect(
      recognizeEqualityExpression(
        "./x === 'a' || dependencies[0].length === 1",
        ['./x'],
      ),
    ).toBeUndefined();
  });
  it.each([
    "./x === 'a' === 'b'",
    "./x === 'a' || 'b'",
    "./x.length === 'a'",
    "dependencies[0].length === 'a'",
    "dependencies[0][1] === 'a'",
    "dependencies[0]() === 'a'",
    '[1] === ./x',
    '() === ./x',
    "dependencies[1] === 'a'",
    "adependencies[0] === 'a'",
    "['a'].includes(./x)",
    "{ return ./x === 'a'; }",
    './x === undefined',
    './x === NaN',
    './x === Infinity',
    './x === 077',
    './x === 00.5',
    './x === 1_000',
    './x === 1n',
    "./x === 'a\\\nb'",
    "./x === 'a\u2028b'",
    "./x === 'a\u2029b'",
    "./x === '\\1'",
    "./x === '\\01'",
    "./x === '\\8'",
    "./x === '\\a'",
    "./x === '\\u{110000}'",
    './x === 1e999',
    './x == 1',
    './x === true && ./x === false',
  ])('rejects %s', (source) => {
    expect(recognizeEqualityExpression(source, ['./x'])).toBeUndefined();
  });

  it('requires element-wise equality with the compiler dependency list', () => {
    for (const dependencies of [[], ['./other'], ['./x', './other']])
      expect(
        recognizeEqualityExpression("./x === 'a'", dependencies),
      ).toBeUndefined();
  });
});
