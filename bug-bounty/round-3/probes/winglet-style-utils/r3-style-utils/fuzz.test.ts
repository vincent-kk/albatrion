import postcss, { type AtRule, type Container, type Rule } from 'postcss';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { compressCss, destroyScope, styleManagerFactory } from '../../index';

/** Seeded generator: mulberry32. */
const createRandom = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const SELECTORS = [
  '.a',
  '.b .c',
  '.d > .e',
  '.f:hover',
  '.g::before',
  ':root',
  '[data-x="{,;}"]',
  '.h:is(.i, .j)',
  '.k:nth-child(2n + 1)',
  "a[href^='http']",
  '#id',
  '*',
  '.l ~ .m',
  '.n + .o',
  '.p:not(.q)',
];
const DECLARATIONS = [
  'color: red',
  'content: "{;}"',
  "content: '/*x*/'",
  'background: url("a{b.png")',
  'background: url(a.png)',
  'width: calc(100% + 10px)',
  '--v: 1px',
  'margin: 0 auto !important',
  '/* c */ color: blue',
  'font-family: "A B", sans-serif',
  'grid-template-columns: repeat(2, 1fr)',
];
const GROUPING = [
  '@media (min-width: 1px)',
  '@supports (display: grid)',
  '@media screen and (max-width: 2px)',
  '@layer base',
  '@container (min-width: 1px)',
  '@supports not (display: none)',
];
const OPAQUE_AT_RULES = [
  '@keyframes k { from { opacity: 0 } to { opacity: 1 } }',
  '@font-face { font-family: "X"; src: url("x.woff2") }',
];

/** Whitespace placeholder, rendered as LF or CRLF. */
const NL = '\u0000';

const generateSheet = (random: () => number): string => {
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(random() * list.length)];
  const ws = () => pick([' ', NL, '\t', NL + '  ', '']);
  const rule = (): string => {
    const count = 1 + Math.floor(random() * 3);
    const selectors = Array.from({ length: count }, () => pick(SELECTORS)).join(
      pick([', ', ',' + NL]),
    );
    const declarationCount = 1 + Math.floor(random() * 3);
    const declarations = Array.from({ length: declarationCount }, () =>
      pick(DECLARATIONS),
    ).join(';' + ws());
    return `${selectors} {${ws()}${declarations}${random() < 0.5 ? ';' : ''}${ws()}}`;
  };
  const ruleList = (depth: number): string => {
    const count = 1 + Math.floor(random() * 3);
    const parts: string[] = [];
    for (let index = 0; index < count; index++) {
      const roll = random();
      if (roll < 0.25 && depth < 3)
        parts.push(`${pick(GROUPING)} {${ws()}${ruleList(depth + 1)}${ws()}}`);
      else if (roll < 0.33) parts.push(pick(OPAQUE_AT_RULES));
      else if (roll < 0.4) parts.push('/* { between } */');
      else parts.push(rule());
    }
    return parts.join(pick([NL, ' ', NL + NL]));
  };
  const head = random() < 0.2 ? '@layer a, b;' + NL : '';
  return head + ruleList(0);
};

const OPAQUE_NAMES = /^(?:-[a-z]+-)?(?:keyframes|font-face)$/i;

/** Expected scoping, built on the postcss tree. */
const scopeWithPostcss = (css: string, scope: string): string => {
  const root = postcss.parse(css);
  root.walkComments((comment) => {
    comment.remove();
  });
  root.walkRules((rule: Rule) => {
    for (let parent: Container | undefined = rule.parent; parent; parent = parent.parent as Container | undefined)
      if (parent.type === 'atrule' && OPAQUE_NAMES.test((parent as AtRule).name)) return;
    rule.selectors = rule.selectors.map((selector) => {
      const trimmed = selector.trim();
      return trimmed === ':root' || trimmed === ':host' ? trimmed : `.${scope} ${trimmed}`;
    });
  });
  return root.toString();
};

const flush = () => vi.advanceTimersByTime(20);
const injected = (scope: string) =>
  document.querySelector(`style.${scope}`)?.textContent ?? '';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  document.head.innerHTML = '';
});

const inject = (scope: string, css: string): string => {
  styleManagerFactory(scope)('x', css);
  flush();
  const text = injected(scope);
  destroyScope(scope);
  return text;
};

describe('RuleScoper differential against a postcss-based scoper', () => {
  it('matches postcss scoping on 2000 seeded sheets (LF)', () => {
    const random = createRandom(20261118);
    const mismatches: string[] = [];
    for (let run = 0; run < 2000 && mismatches.length < 5; run++) {
      const css = generateSheet(random).split(NL).join('\n');
      const expected = compressCss(scopeWithPostcss(css, 'fz'));
      const actual = inject('fz', css);
      if (actual !== expected)
        mismatches.push(JSON.stringify({ css, expected, actual }));
    }
    expect(mismatches).toEqual([]);
  });

  it('gives the same output for CRLF and LF spellings of 2000 seeded sheets', () => {
    const random = createRandom(7);
    const mismatches: string[] = [];
    for (let run = 0; run < 2000 && mismatches.length < 5; run++) {
      const sheet = generateSheet(random);
      const lf = inject('fzlf', sheet.split(NL).join('\n'));
      const crlf = inject('fzlf', sheet.split(NL).join('\r\n'));
      // A form feed is left in place by compressCss (still whitespace to CSS), so it is not compared.
      if (lf !== crlf) mismatches.push(JSON.stringify({ sheet, lf, crlf }));
    }
    expect(mismatches).toEqual([]);
  });

  it('gives the same output with and without a leading BOM on 2000 seeded sheets', () => {
    const random = createRandom(99);
    const mismatches: string[] = [];
    for (let run = 0; run < 2000 && mismatches.length < 3; run++) {
      const css = generateSheet(random).split(NL).join('\n');
      const plain = inject('fzbom', css);
      const withBom = inject('fzbom', '﻿' + css);
      if (plain !== withBom) mismatches.push(JSON.stringify({ css, plain, withBom }));
    }
    // Fails while a BOM before an at-rule turns that at-rule into a scoped selector.
    expect(mismatches).toEqual([]);
  });
});
