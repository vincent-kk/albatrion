import { expect, it } from 'vitest';

import { replaceExpressionPaths } from '../utils/expressions/replaceExpressionPaths';

it.each([
  '(',
  '[',
  '{',
  '=',
  '+',
  '-',
  '*',
  '!',
  '~',
  '?',
  ':',
  ',',
  ';',
  '=>',
])(
  'a regex after %s is preserved while its argument path is replaced',
  (prefix) => {
    const literal = '/^\\d+$/';
    expect(
      replaceExpressionPaths(
        prefix + ' ' + literal + '.test(../value)',
        () => 'VALUE',
      ),
    ).toBe(prefix + ' ' + literal + '.test(VALUE)');
  },
);

it.each([
  'value',
  'value.field',
  'value[0]',
  'fn()',
  '42',
  'true',
  'false',
  'null',
  'undefined',
  '"text"',
  "'text'",
  '`text`',
])('a slash after the value %s stays division', (prefix) => {
  const expression = prefix + ' / 2 + ../value';
  expect(replaceExpressionPaths(expression, () => 'VALUE')).toBe(
    prefix + ' / 2 + VALUE',
  );
});
