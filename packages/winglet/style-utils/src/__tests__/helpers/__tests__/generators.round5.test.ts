import { expect, it } from 'vitest';

import { createRandom } from '../cssSyntax/createRandom';
import { generateFragment } from '../generateFragment';
import { generateValidSheet } from '../generateValidSheet';

it('generates spaced column, empty-namespace, attribute and comment-only value boundaries', () => {
  const random = createRandom(0xc55105);
  const sheets = Array.from({ length: 5000 }, () => generateValidSheet(random));
  for (const selector of ['foo |div', 'a |*', 'col || td', '[ a ~= "b" ]', '[ a |= "b" ]']) {
    expect(sheets.some(sheet => sheet.includes(selector)), selector).toBe(true);
  }
  expect(sheets.some(sheet => sheet.includes(': /*c*/;'))).toBe(true);
  expect(sheets.some(sheet => sheet.includes('(--x: /*c*/)'))).toBe(true);
});

it('generates an unclosed URL directly in addition to arbitrary prefix cuts', () => {
  const random = createRandom(0xf12a6);
  const fragments = Array.from({ length: 1000 }, () => generateFragment(random));
  expect(fragments.some(css => /\.tail\{background:url\([^)]*$/.test(css))).toBe(true);
});
