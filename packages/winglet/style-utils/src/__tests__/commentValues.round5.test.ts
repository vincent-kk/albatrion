import { expect, it } from 'vitest';

import { compressCss } from '../index';
import { readStylesheet } from './helpers/cssSyntax/readStylesheet';

it('retains whitespace-only values across trailing comments in declarations and declaration queries', () => {
  for (const trivia of [' /*c*/', '\t/*c*/\n', ' /*a*/ /**/ ']) {
    for (const [prefix, suffix, expected] of [
      ['.a{--x:', ';}', '.a{--x: }'],
      ['.a{--x:', '}', '.a{--x: }'],
      ['@supports (--x:', '){.a{color:red}}', '@supports (--x: ){.a{color:red}}'],
      ['@container style(--x:', '){.a{color:red}}', '@container style(--x: ){.a{color:red}}'],
    ]) {
      const input = prefix + trivia + suffix;
      expect(compressCss(input), input).toBe(expected);
    }
  }
});

it('preserves whitespace-only values at EOF, including comments that consume the remaining sheet', () => {
  for (const prefix of ['.a{--x:', '@supports (--x:', '@container style(--x:']) {
    for (const trivia of [' ', ' /*c*/', ' /*unfinished']) {
      const input = prefix + trivia;
      expect(readStylesheet(compressCss(input)), input).toEqual(readStylesheet(input));
    }
  }
});
