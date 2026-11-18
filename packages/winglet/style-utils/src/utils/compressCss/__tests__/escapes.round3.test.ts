import { expect, it } from 'vitest';

import { compressCss } from '../compressCss';

it('round-3 style-utils 1: escape spellings preserve the neighbouring string and rules like an ordinary selector', () => {
  const selectors = [
    String.raw`.a\'x`, String.raw`.a\"x`, String.raw`.a\\\'x`, String.raw`.a\\\"x`,
    String.raw`.a\[\'x\'\]`, String.raw`.a\[\"x\"\]`,
    ...[1, 2, 3, 4, 5, 6].map(length => '.a\\' + '27'.padStart(length, '0') + ' x'),
    String.raw`[data-x=\'x\']`, String.raw`[data-x=\"x\"]`,
  ];
  const values = [String.raw`a\'b`, String.raw`a\"b`, String.raw`a\\b`,
    String.raw`a\\\'b`, String.raw`a\\\"b`, String.raw`a\000027 b`,
    'a\\\nb', 'a\\\r\nb', 'a\\\rb', 'a\\\fb', 'a  b/*x*/;{},'];
  for (const selector of selectors) for (const quote of ["'", '"']) {
    for (const value of values) {
      const safeValue = value.split(quote).join('\\' + quote);
      const tail = `::after { content: ${quote}${safeValue}${quote}; } .b { color: red; }`;
      expect(compressCss(selector + tail).replace(selector, '.control')).toBe(compressCss('.control' + tail));
    }
    const tail = `) { color: red; } .b { content: ${quote}y;${quote}; }`;
    expect(compressCss('.a :is(' + selector + tail).replace(selector, '.control')).toBe(compressCss('.a :is(.control' + tail));
  }
});

it('round-3 style-utils 1: URL and quoted attribute contents are opaque across escape forms', () => {
  for (const value of [String.raw`a\)b`, String.raw`a\\b`, 'a/*b', String.raw`a\ b`, String.raw`a\000029 b`]) {
    const url = `url(https://x/${value})`;
    expect(compressCss(`.a { background: ${url}; } .b { color: red; }`)).toBe(`.a{background:${url}}.b{color:red}`);
    for (const quote of ["'", '"']) {
      const selector = `[data-x=${quote}${value}${quote}]`;
      expect(compressCss(`${selector} { color: red; }`).replace(selector, '.a')).toBe(compressCss('.a { color: red; }'));
    }
  }
});

it('round-3 style-utils 6: escaped trailing whitespace survives like an escaped non-space', () => {
  for (const ending of [' ', '\t', '\n', '\r', '\f']) {
    const selector = '.a\\' + ending;
    expect(compressCss(selector + '  { color: red; }').replace(selector, '.a')).toBe(compressCss('.a  { color: red; }'));
  }
  expect(compressCss('.a\\ ')).toBe('.a\\ ');
  expect(compressCss('.a\\\\  { color: red; }')).toBe(compressCss('.a\\\\{ color: red; }'));
});

it('round-3 style-utils 7: separated tokens keep the same token sequence', () => {
  for (const [left, right] of [['1px','2px'], ['red','blue'], ['foo','('], ['1','.2'], ['-','-x'], ['/', '*']]) {
    const css = `.a { x: ${left}/**/${right}; }`;
    const normalized = (text: string) => text.replace(/\/\*.*?\*\//g, ' ').replace(/\s+/g, ' ').replace(/\s*([{}:;])\s*/g, '$1').replace(';}', '}');
    expect(normalized(compressCss(css))).toBe(normalized(css));
  }
  expect(compressCss('.a/**/.b {color: red}')).toBe('.a/**/.b{color:red}');
});

it('round-3 style-utils 4: a bad string does not change a later real string', () => {
  for (const newline of ['\n', '\r', '\r\n', '\f']) {
    const later = '.b { content: "a  b"; } .c {color: red;}';
    const result = compressCss('.a {content: "bad' + newline + '}' + later);
    expect(result.slice(result.indexOf('.b'))).toBe(compressCss(later));
    expect(result).toContain(newline);
  }
});
