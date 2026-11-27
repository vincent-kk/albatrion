import { describe, expect, it } from 'vitest';

import { blueprint } from '../blueprint';

const compileDerived = (derived: string) =>
  blueprint({
    type: 'object',
    properties: {
      first: { type: 'string' },
      last: { type: 'string' },
      target: { type: 'string', controls: { derived } },
    },
  }).expressions[0];

describe('expression paths that end at a template placeholder brace', () => {
  it.each([
    [
      'two placeholders separated by a space (documented example)',
      '`${../first} ${../last}`',
      'a b',
    ],
    ['a placeholder followed by text', '`${../first}x`', 'ax'],
    ['two placeholders back to back', '`${../first}${../last}`', 'ab'],
    ['a placeholder followed by the closing backtick', '`${../first}`', 'a'],
    [
      'a template nested inside a placeholder',
      '`${`${../first}-` + ../last}`',
      'a-b',
    ],
    [
      'an object literal closed inside a placeholder',
      '`${{v:../first}.v}${../last}`',
      'ab',
    ],
  ])('reads both fields through %s', (_label, expression, expected) => {
    const compiled = compileDerived(expression);
    expect(compiled.dependencies).toEqual(
      expression.includes('../last') ? ['../first', '../last'] : ['../first'],
    );
    expect(compiled.evaluate(['a', 'b'])).toBe(expected);
  });
});
