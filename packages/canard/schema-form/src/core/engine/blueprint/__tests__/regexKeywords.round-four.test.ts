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
