import { expect, it } from 'vitest';
import { compressCss } from '../index';
import { readStylesheet } from './helpers/cssSyntax/readStylesheet';
import { readSignificantTokens } from './helpers/cssSyntax/readSignificantTokens';

it('keeps selector grammar inside supports selector functions', () => {
  for (const css of ['@supports selector(.a: hover){.b{color:red}}', '@supports selector(:is(.a) .b){.c{color:red}}']) {
    expect(readStylesheet(compressCss(css)), css).toEqual(readStylesheet(css));
    expect(readSignificantTokens(compressCss(css)), css).toEqual(readSignificantTokens(css));
  }
});

it('preserves custom-property value trivia for escaped property names', () => {
  for (const css of ['.a{\\2d \\2d x:a > b}', '.a{\\2d \\2d x: ;color:red}', '.a{\\2d \\2d x:a , b}']) {
    expect(readStylesheet(compressCss(css)), css).toEqual(readStylesheet(css));
    expect(readSignificantTokens(compressCss(css)), css).toEqual(readSignificantTokens(css));
  }
});

it('preserves empty custom values in otherwise opaque at-rule functions', () => {
  expect(compressCss('@container style(--x: ){.b{color:red}}')).toContain('style(--x: )');
});

it('preserves ambiguous nested selector preludes and opaque at-rule blocks', () => {
  for (const css of ['.a{p :hover{color:red}}', '.a{p: hover{color:red}}', '@\\6d edia (x){.a: hover{color:red}}', '@unknown{.a: hover{color:red}}'])
    expect(readStylesheet(compressCss(css)), css).toEqual(readStylesheet(css));
});
