import { expect, it } from 'vitest';

import { compressCss } from '../compressCss';
import { findStringEnd } from '../utils/findStringEnd';

it('round-3 style-utils 1: hex terminators and following semantic whitespace stay distinct', () => {
  for (const digits of ['61', '061', '0061', '00061', '000061'])
    for (const delimiter of [' ', '\t', '\n', '\r', '\r\n', '\f']) {
      const selector = '.\\' + digits + delimiter;
      for (const next of ['.child', ':hover', '[data-x]']) {
        const tail = `  ${next} { color: red; }`;
        expect(compressCss(selector + tail).replace(selector, '.a')).toBe(
          compressCss('.a' + tail),
        );
      }
    }
});

it('round-3 style-utils 1: string hex escapes consume their newline terminator in either quote context', () => {
  for (const quote of ["'", '"'])
    for (const delimiter of ['\n', '\r', '\r\n', '\f', '\t', ' '])
      for (const digits of ['41', '041', '0041', '00041', '000041']) {
        const value =
          quote + '\\' + digits + delimiter + '/*literal*/  b;{},' + quote;
        const css = `.a :is([data-x=${value}]) { content: ${value}; } .tail { color: red; }`;
        expect(compressCss(css).split(value).join('"control"')).toBe(
          compressCss(css.split(value).join('"control"')),
        );
        expect(findStringEnd(new TextEncoder().encode(value + ';'), 0)).toBe(
          new TextEncoder().encode(value).length,
        );
      }
});

it('round-3 style-utils 1: escaped URL function names preserve literal comments like the ordinary spelling', () => {
  for (const name of [
    String.raw`u\72l`,
    String.raw`\75 rl`,
    String.raw`ur\6c`,
    String.raw`\000075\000072\00006c`,
    String.raw`\U\R\L`,
  ]) {
    const css = `.a { background: ${name}(https://x/a/*b); } .tail { color: red; }`;
    expect(compressCss(css).replace(name, 'url')).toBe(
      compressCss(css.replace(name, 'url')),
    );
  }
});

it('round-3 style-utils 1: escaped identifier prefixes do not turn other functions into URL tokens', () => {
  for (const name of [
    String.raw`foo\20 url`,
    String.raw`foo\20 u\72l`,
    String.raw`foo\.url`,
    String.raw`foo\.u\72l`,
    String.raw`myu\72l`,
  ]) {
    const css = `.a { x: ${name}(1/*removed*/2); }`;
    expect(compressCss(css)).not.toContain('removed');
  }
});
