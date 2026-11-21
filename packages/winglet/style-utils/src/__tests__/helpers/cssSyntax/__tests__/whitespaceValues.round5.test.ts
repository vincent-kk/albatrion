import { expect, it } from 'vitest';

import { readStylesheet } from '../readStylesheet';

it('distinguishes whitespace-only declaration values from absent values even at component edges', () => {
  for (const [prefix, suffix] of [
    ['.a{--x:', '}'], ['.a{--x:', ';}'],
    ['@supports (--x:', '){.a{color:red}}'],
    ['@container style(--x:', '){.a{color:red}}'],
  ]) {
    const empty = readStylesheet(prefix + suffix);
    const whitespace = readStylesheet(prefix + ' ' + suffix);
    expect(whitespace, prefix + suffix).not.toEqual(empty);
    expect(readStylesheet(prefix + ' /*c*/' + suffix)).toEqual(whitespace);
  }
});

it('continues to normalize irrelevant component-edge whitespace and trailing semicolons', () => {
  expect(readStylesheet('.a { color:red; }')).toEqual(readStylesheet('.a{color:red}'));
});
