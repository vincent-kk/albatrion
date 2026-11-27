import { expect, it } from 'vitest';

import { replaceExpressionPaths } from '../utils/expressions/replaceExpressionPaths';

it.each([
  'return',
  'throw',
  'typeof',
  'case',
  'in',
  'of',
  'void',
  'delete',
  'await',
  'yield',
  'else',
  'do',
])(
  'a slash after %s opens the same regex as an assigned literal',
  (keyword) => {
    const literal = '/^\\d+$/g';
    const prefix = keyword + ' ';
    const expression = prefix + literal + '.test(../value);';
    const paths: string[] = [];
    const actual = replaceExpressionPaths(expression, (path) => {
      paths.push(path);
      return 'VALUE';
    });
    expect({ actual, paths }).toEqual({
      actual: prefix + literal + '.test(VALUE);',
      paths: ['../value'],
    });
  },
);


it.each([
  '/[a/b c]/',
  '/[a b]/',
  '/[a/b]/',
  '/[/]/',
  '/[^/]/',
  '/[a\\]b/]/',
  '/[^a b]/',
  '/[ab]tail/',
  '/head[a/b]tail/',
  '/[a/b]{1,2}/',
])('keeps character class literal %s equivalent to an opaque literal', (literal) => {
  const paths: string[] = [];
  const actual = replaceExpressionPaths(
    '{ return ' + literal + '.test(../code); }',
    (path) => { paths.push(path); return 'VALUE'; },
  );
  expect({ actual, paths }).toEqual({
    actual: '{ return ' + literal + '.test(VALUE); }',
    paths: ['../code'],
  });
});

it('keeps a standalone class literal and rewrites only division operand paths', () => {
  expect(replaceExpressionPaths('{ return /[a/b]/; }', () => 'VALUE')).toBe('{ return /[a/b]/; }');
  expect(replaceExpressionPaths('a / [b][0] + ../code', () => 'VALUE')).toBe('a / [b][0] + VALUE');
});
