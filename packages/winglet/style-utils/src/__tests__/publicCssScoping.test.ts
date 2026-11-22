import { afterEach, expect, it, vi } from 'vitest';

import { compressCss, destroyScope, styleManagerFactory } from '../index';
import { normalizeCss } from './helpers/normalizeCss';

afterEach(() => {
  destroyScope('contract-scope');
  vi.unstubAllGlobals();
});

function scoped(...sheets: string[]): string {
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    frames.push(callback),
  );
  vi.stubGlobal('cancelAnimationFrame', () => {});
  const inject = styleManagerFactory('contract-scope');
  sheets.forEach((sheet, index) => inject(String(index), sheet, true));
  frames.forEach((frame) => frame(0));
  return document.head.querySelector('style.contract-scope')?.textContent ?? '';
}

it.each([
  'media',
  'supports',
  'container',
  'layer',
  'scope',
  'document',
  'starting-style',
])('scopes rules inside the @%s grouping rule', (name) => {
  expect(normalizeCss(scoped(`@${name} { .a { x:y } }`))).toEqual(
    normalizeCss(`@${name}{.contract-scope .a{x:y}}`),
  );
});

it.each([
  [
    '@keyframes fade { from { opacity:0 } } .a{}',
    '@keyframes fade{from{opacity:0}}.contract-scope .a{}',
  ],
  [
    '.a, .b:is(.c, .d), [title="x,y"], .e\\,f, :root, :host { x:y }',
    '.contract-scope .a,.contract-scope .b:is(.c, .d),.contract-scope [title="x,y"],.contract-scope .e\\,f,:root,:host{x:y}',
  ],
  [
    '} /* note */ @media (x) { .a{content:"}"} } .b{}',
    '@media (x){.contract-scope .a{content:"}"}}.contract-scope .b{}',
  ],
  [
    '@import URL(http://x/a/*b;c); .a{}',
    '@import URL(http://x/a/*b;c);.contract-scope .a{}',
  ],
  [
    '.a{b:myurl(x /* ) } */)}.b{}',
    '.contract-scope .a{b:myurl(x /* ) } */)}.contract-scope .b{}',
  ],
  ['.a, /* empty */, {x:y}', '.contract-scope .a,,{x:y}'],
  [
    String.raw`:\72 oot, :HOST, :root .child{x:y}`,
    String.raw`:\72 oot,:HOST,.contract-scope :root .child{x:y}`,
  ],
  [
    String.raw`.a\ , .b{x:y}`,
    String.raw`.contract-scope .a\ ,.contract-scope .b{x:y}`,
  ],
])('emits scoped CSS for %j', (css, expected) => {
  expect(normalizeCss(scoped(css))).toEqual(normalizeCss(expected));
});

it('preserves statement-only CSS and separates statements from the next style identifier', () => {
  expect(
    normalizeCss(scoped('@import url(a.css); @layer x', '.b{x:y}')),
  ).toEqual(
    normalizeCss('@import url(a.css);@layer x;.contract-scope .b{x:y}'),
  );
});

it.each([
  ['.a + .b { width : calc(1px + 2px) }', '.a+.b{width:calc(1px + 2px)}'],
  [
    '.a { content: "a ; b"; background: url(http://x/a/*b;c) }',
    '.a{content:"a ; b";background:url(http://x/a/*b;c)}',
  ],
  ['.a{--p:1px/* split */2px}', '.a{--p:1px/**/2px}'],
])('preserves CSS lexical boundaries when compressing %j', (css, expected) => {
  expect(compressCss(css)).toBe(expected);
});

it('keeps the selector colon when a comment contains a brace', () => {
  expect(compressCss('.a :hover /* } */ { color: red }')).toMatch(
    /^\.a :hover ?\{color:red\}$/,
  );
});

it('preserves later rules when an unquoted data URL includes a brace', () => {
  expect(
    normalizeCss(scoped('.a{background:url(data:x,{)}.b{color:red}')),
  ).toEqual(
    normalizeCss(
      '.contract-scope .a{background:url(data:x,{)}.contract-scope .b{color:red}',
    ),
  );
});
