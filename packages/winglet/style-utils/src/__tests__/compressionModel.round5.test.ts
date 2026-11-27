import { expect, it } from 'vitest';
import { compressCss } from '../index';
import { createRandom } from './helpers/cssSyntax/createRandom';
import { readSignificantTokens } from './helpers/cssSyntax/readSignificantTokens';
import { readStylesheet } from './helpers/cssSyntax/readStylesheet';
import { generateValidSheet } from './helpers/generateValidSheet';

it('preserves Syntax trees and token boundaries for 5000 seeded valid sheets on both compression paths', () => {
  const seed = 0xc55105, random = createRandom(seed);
  for (let trial = 0; trial < 5000; trial++) {
    const sheet = generateValidSheet(random);
    for (const css of [sheet, sheet + '/* general-path */', sheet + '.round5{color:red;margin:0 2px;--x:1px + 2px}'.repeat(8)]) {
      const output = compressCss(css);
      const label = `seed=${seed}, trial=${trial}, css=${JSON.stringify(css)}, output=${JSON.stringify(output)}`;
      expect(readSignificantTokens(output), label).toEqual(readSignificantTokens(css));
      expect(readStylesheet(output), label).toEqual(readStylesheet(css));
    }
  }
}, 60_000);

it('keeps selector whitespace distinct from declaration punctuation and empty custom values', () => {
  for (const css of ['.a [b]{color:red}', '[a] .b{color:red}', ':is(.a) .b{color:red}', '.a: hover{color:red}', '.a{--x:a > b}', '.a{--x:a ~ b}', '.a{--x:1px + 2px}', '.a{--x:1px - 2px}']) {
    expect(readStylesheet(compressCss(css)), css).toEqual(readStylesheet(css));
    expect(readSignificantTokens(compressCss(css)), css).toEqual(readSignificantTokens(css));
  }
  expect(compressCss('.a{--x: ;}')).toContain('--x: ');
});
