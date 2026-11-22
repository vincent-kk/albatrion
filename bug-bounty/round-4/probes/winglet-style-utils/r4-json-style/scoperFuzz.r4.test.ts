import { describe, expect, it } from 'vitest';

import { RuleScoper } from '../../styleManager/StyleManager/utils/RuleScoper';
import { compressCss } from '../../utils/compressCss/compressCss';
import { mulberry32, n1, n2, refScope } from './oracle';

const firstDiff = (a: string[], b: string[]) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return { at: i, a: a.slice(Math.max(0, i - 4), i + 3), b: b.slice(Math.max(0, i - 4), i + 3) };
};
const diff2 = (a: string[], b: string[]) => {
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) return { i, a: a[i], b: b[i] };
  return null;
};

const SIMPLE = [
  '.a',
  '.b-c',
  '#id',
  'div',
  '*',
  'a',
  '[data-x="a,b{}"]',
  "[data-y='}']",
  '[data-z]',
  ':hover',
  '::before',
  ':is(.a, .b)',
  ':not(.c)',
  ':nth-child(2n + 1)',
  '.md\\:flex',
  '.w-1\\/2',
  '.\\32xl',
  '.\\31 0',
  '.a\\,b',
  '.a\\{',
  '.a\\}',
  '.a\\ b',
  '.a\\"',
  ".content-\\[\\'x\\'\\]",
  '.bg-\\[url\\(a\\.png\\)\\]',
  '.x\\;y',
  '.u\\72l',
  '.\\[\\&\\>\\*\\]\\:p-4',
  '.a\\31',
  '.e\\e9',
  '.f\\000041',
  '.a\\31/**/2',
  '.h\\31/**/x',
  '.é',
  '.a\\é',
  '.\\🙂',
  '.t\\9 x',
  '.a\\0',
  '[data-x="a\\"b"]',
  '[x=a\\,b]',
  '[x="\\\n"]',
  '.n\\\r\nk',
  ':host(.dark)',
  '.\\55 RL',
  '.ur\\l',
  '.a\\\\',
  '.ff\\31\fx',
];
const GLOBAL = [':root', ':ROOT', ':host', ':ro\\6f t', ':root/**/', ':Root', ':\\52 OOT', ':r\\6F\r\not', '/**/:root', ':root\t', ':host/**//**/'];
const WS = [' ', '  ', '\t', '\n', '\r\n', ' /* c */ ', '/**/', '\n/* , */\n'];

let EXCLUDE: RegExp | null = null;
const pick = <T,>(rnd: () => number, list: T[]): T => {
  const usable = EXCLUDE
    ? list.filter((x) => typeof x !== 'string' || !EXCLUDE!.test(x))
    : list;
  return usable[Math.floor(rnd() * usable.length)];
};

const genCompound = (rnd: () => number) => {
  let s = pick(rnd, SIMPLE);
  if (rnd() < 0.3) s += pick(rnd, [':hover', '.k', '[x]', '::after', ':focus-visible']);
  return s;
};

const genSelector = (rnd: () => number) => {
  if (rnd() < 0.08) return pick(rnd, GLOBAL);
  let s = genCompound(rnd);
  const n = Math.floor(rnd() * 3);
  for (let i = 0; i < n; i++)
    s += pick(rnd, [' ', ' > ', ' + ', ' ~ ', '\n', '>']) + genCompound(rnd);
  return s;
};

const genList = (rnd: () => number) => {
  const n = 1 + Math.floor(rnd() * 3);
  const parts: string[] = [];
  for (let i = 0; i < n; i++) parts.push(genSelector(rnd));
  return parts.join(pick(rnd, [',', ', ', ' ,\n', ',/* x */', ' , ']));
};

const DECLS = [
  'color: red',
  'content: "a;b}"',
  "content: '\\201C'",
  'content: "\\"/*"',
  'content: "\\22"',
  "content: '\\'{'",
  'background: url(a.png)',
  'background: url( "b c.png" )',
  'background:url(data:image/png;base64,iVBO=)',
  'background:url(http://x/a/*b)',
  'width: calc(100% - 2rem)',
  'width: calc(1px + 2px)',
  'margin: 1px/**/2px',
  'margin: 0 auto',
  'font-family: "A", B',
  'grid-area: 1 / 2',
  'transition: all .2s ease-in-out',
  'margin: -1px',
  'color: red !important',
  '--x: 1px',
  'content: "\\31 0"',
  'background: URL(x.png)',
  'background: u\\72l(y.png)',
  'content: counter(c) "\\A"',
  'content: "\\22\nabc"',
  'content: "a\\\nb"',
  'content: "a\\\r\nb"',
  'background: url(a\\)b.png)',
  'background: url(a\\ b.png)',
  'background: url(  a.png  )',
  'background: \\55 RL(z;z.png)',
  'background: u\\72 l(k/*k.png)',
  'margin: +.5px -.5e3px',
  'color: red ! important',
  'content: "한글🙂"',
  'width: calc(1px - -2px)',
  'width: calc( 1px*2 )',
  'content: "\\"" attr(x)',
  'margin: 1px/**/-2px',
  'margin: \\31/**/2px',
  'font: 12px/1.5 a',
  'content: "\\0"',
  'x: y\\;z',
  'width: calc(var(--a, ")") + 2px)',
];

const genBlockBody = (rnd: () => number) => {
  const n = Math.floor(rnd() * 4);
  const ds: string[] = [];
  for (let i = 0; i < n; i++) ds.push(pick(rnd, DECLS));
  let body = ds.join(pick(rnd, [';', '; ', ';\n  ', ' ;']));
  if (rnd() < 0.5 && body) body += ';';
  return pick(rnd, [' ', '', '\n  ']) + body + pick(rnd, [' ', '', '\n']);
};

const genRule = (rnd: () => number): string =>
  genList(rnd) + pick(rnd, [' ', '', '\n']) + '{' + genBlockBody(rnd) + '}';

const genRules = (rnd: () => number, depth: number): string => {
  const n = 1 + Math.floor(rnd() * 4);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const r = rnd();
    if (depth > 0 && r < 0.15)
      out.push(
        pick(rnd, [
          '@media (min-width: 600px)',
          '@media screen and (max-width:100px)',
          '@supports (display:grid) and (not (display:inline-grid))',
          '@layer base',
          '@container c (min-width: 1px)',
          '@scope (.card) to (.content)',
          '@MEDIA print',
        ]) +
          pick(rnd, [' ', '', '/**/']) +
          '{' +
          genRules(rnd, depth - 1) +
          '}',
      );
    else if (r < 0.2)
      out.push(
        pick(rnd, [
          '@keyframes k { from { opacity: 0 } to { opacity: 1 } }',
          '@font-face { font-family: X; src: url(x.woff2) }',
          '@layer a, b;',
          '@import url("x.css");',
          '@page :first { margin: 0 }',
          '@import url(a;b.css);',
          '@import "a;b{}.css";',
          '@import u\\72 l(a/*b.css);',
          '@layer x , y ;',
          '@namespace svg url(http://www.w3.org/2000/svg);',
        ]),
      );
    else out.push(genRule(rnd));
  }
  return out.join(pick(rnd, WS));
};

describe('r4 RuleScoper and compressCss token-oracle fuzz', () => {
  it('SF1 RuleScoper matches a token-level reference scoper on 3000 seeded sheets', () => {
    const rnd = mulberry32(20261119);
    const failures: any[] = [];
    for (let run = 0; run < 3000 && failures.length < 6; run++) {
      const css = genRules(rnd, 2);
      let ref: string;
      try {
        ref = refScope(css, '.s');
      } catch {
        continue;
      }
      const ours = new RuleScoper(css, '.s').scopeSheet();
      const a1 = n1(ours).join(' ');
      const b1 = n1(ref).join(' ');
      const a2 = n2(ours);
      const b2 = n2(ref);
      if (a1 !== b1 || JSON.stringify(a2) !== JSON.stringify(b2))
        failures.push({ run, css, ours, ref, n1Same: a1 === b1 });
    }
    expect(failures).toEqual([]);
  });

  it('SF2 compressCss keeps the token stream and the selector preludes on 3000 seeded sheets', () => {
    const rnd = mulberry32(99);
    const failures: any[] = [];
    for (let run = 0; run < 3000 && failures.length < 6; run++) {
      const css = genRules(rnd, 2);
      const out = compressCss(css);
      const a1 = n1(out).join(' ');
      const b1 = n1(css).join(' ');
      const a2 = n2(out);
      const b2 = n2(css);
      if (a1 !== b1 || JSON.stringify(a2) !== JSON.stringify(b2))
        failures.push({ run, d1: a1 === b1 ? null : firstDiff(n1(out), n1(css)), d2: diff2(a2, b2) });
    }
    expect(failures).toEqual([]);
  });

  it('SF3 compressing the scoped sheet keeps the scoped token stream', () => {
    const rnd = mulberry32(31337);
    const failures: any[] = [];
    for (let run = 0; run < 2000 && failures.length < 6; run++) {
      const css = genRules(rnd, 2);
      const scoped = new RuleScoper(css, '.s').scopeSheet();
      const out = compressCss(scoped);
      if (
        n1(out).join(' ') !== n1(scoped).join(' ') ||
        JSON.stringify(n2(out)) !== JSON.stringify(n2(scoped))
      )
        failures.push({ run, d1: firstDiff(n1(out), n1(scoped)), d2: diff2(n2(out), n2(scoped)) });
    }
    expect(failures).toEqual([]);
  });

  it('SF2b compressCss oracle without the two understood shapes (escape then comment, string paren in calc)', () => {
    EXCLUDE = /\\[0-9a-fA-F]+\/\*|calc\(var/;
    const rnd = mulberry32(4711);
    const failures: any[] = [];
    try {
      for (let run = 0; run < 6000 && failures.length < 6; run++) {
        const css = genRules(rnd, 2);
        const out = compressCss(css);
        const a1 = n1(out).join(' ');
        const b1 = n1(css).join(' ');
        const a2 = n2(out);
        const b2 = n2(css);
        if (a1 !== b1 || JSON.stringify(a2) !== JSON.stringify(b2))
          failures.push({ run, css, out, d1: a1 === b1 ? null : firstDiff(n1(out), n1(css)), d2: diff2(a2, b2) });
      }
    } finally {
      EXCLUDE = null;
    }
    expect(failures).toEqual([]);
  });

  it('SF3b compressing the scoped sheet keeps the scoped token stream, without the two understood shapes', () => {
    EXCLUDE = /\\[0-9a-fA-F]+\/\*|\\:\/\*|calc\(var/;
    const rnd = mulberry32(8080);
    const failures: any[] = [];
    try {
      for (let run = 0; run < 6000 && failures.length < 6; run++) {
        const css = genRules(rnd, 2);
        const scoped = new RuleScoper(css, '.s').scopeSheet();
        const out = compressCss(scoped);
        if (
          n1(out).join(' ') !== n1(scoped).join(' ') ||
          JSON.stringify(n2(out)) !== JSON.stringify(n2(scoped))
        )
          failures.push({ run, scoped, out, d1: firstDiff(n1(out), n1(scoped)), d2: diff2(n2(out), n2(scoped)) });
      }
    } finally {
      EXCLUDE = null;
    }
    expect(failures).toEqual([]);
  });
});
