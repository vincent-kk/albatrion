import { expect, it } from 'vitest';

import { compressCss } from '../index';
import { readStylesheet } from './helpers/cssSyntax/readStylesheet';

it('distinguishes descendant empty-namespace selectors from namespace prefixes and column combinators', () => {
  for (const selector of ['foo |div', 'a |*', 'col || td']) {
    const input = selector + '{color:red}';
    expect(readStylesheet(compressCss(input)), input).toEqual(readStylesheet(input));
    expect(compressCss(input), input).toContain(selector);
  }
});

it('retains attribute-operator trivia independently of selector combinator rules', () => {
  for (const operator of ['~=', '|=', '^=', '$=', '*=', '=']) {
    const input = `[ a ${operator} "b" ]{color:red}`;
    expect(readStylesheet(compressCss(input)), input).toEqual(readStylesheet(input));
  }
});
