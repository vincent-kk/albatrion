import { describe, expect, test } from 'vitest';

import { RuleScoper } from '../utils/RuleScoper';

const SCOPE = '.s';
const scope = (css: string) => new RuleScoper(css, SCOPE).scopeSheet();

/** Deterministic PRNG (mulberry32) so a failing sheet is reproducible from its seed. */
const createRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const SELECTORS = [
  '.c1',
  '#id',
  'div > .c2',
  '.c3:hover',
  'li + li',
  'a[title="x,{};y"]',
  '.c4:is(.p, .q)',
  "[data-a='}']",
  '.c5::before',
];
const DECLARATIONS = [
  'color: red',
  'margin: 0 auto',
  'content: "a{b}c;d,e:f"',
  "content: '/* not a comment */'",
  'background: url("x;y{z}.png")',
  'width: calc(1px + 2px)',
];
const COMMENTS = ['/* { */', '/* } */', '/* ; , : */', '/**/'];

const generateSheet = (random: () => number, depth: number): string => {
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  const space = () => pick(['', ' ', '\n  ']);
  let css = '';
  const count = 1 + Math.floor(random() * 4);
  for (let index = 0; index < count; index++) {
    const kind = random();
    if (kind < 0.15) css += pick(COMMENTS) + space();
    else if (kind < 0.3 && depth < 2)
      css +=
        pick(['@media (min-width: 1px)', '@supports (display: grid)']) +
        ' {' +
        space() +
        generateSheet(random, depth + 1) +
        '}' +
        space();
    else {
      const selectors = Array.from(
        { length: 1 + Math.floor(random() * 3) },
        () => pick(SELECTORS),
      );
      const declarations = Array.from(
        { length: 1 + Math.floor(random() * 3) },
        () => pick(DECLARATIONS) + (random() < 0.3 ? ' ' + pick(COMMENTS) : ''),
      );
      css +=
        selectors.join(',' + space()) +
        space() +
        '{' +
        space() +
        declarations.join(';' + space()) +
        space() +
        '}' +
        space();
    }
  }
  return css;
};

type FlatRule = { groups: string; selectors: string[]; declarations: string };

/** Splits a selector list at top-level commas, outside parentheses, brackets, strings and escapes. */
const splitSelectors = (list: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let index = 0; index < list.length; index++) {
    const char = list[index];
    if (char === '\\') index++;
    else if (quote) quote = char === quote ? '' : quote;
    else if (char === '"' || char === "'") quote = char;
    else if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    else if (char === ',' && depth === 0) {
      parts.push(list.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(list.slice(start).trim());
  return parts;
};

/** Parses a stylesheet with jsdom's CSS parser and flattens its style rules in order. */
const parseRules = (css: string): FlatRule[] | null => {
  const element = document.createElement('style');
  element.textContent = css;
  document.head.appendChild(element);
  const rules: FlatRule[] = [];
  const visit = (list: CSSRuleList, groups: string) => {
    for (const rule of Array.from(list)) {
      if ('selectorText' in rule)
        rules.push({
          groups,
          selectors: splitSelectors((rule as CSSStyleRule).selectorText),
          declarations: (rule as CSSStyleRule).style.cssText,
        });
      else if ('cssRules' in rule)
        visit(
          (rule as CSSGroupingRule).cssRules,
          groups + '|' + (rule as CSSConditionRule).conditionText,
        );
    }
  };
  const sheet = element.sheet;
  element.remove();
  if (!sheet) return null;
  visit(sheet.cssRules, '');
  return rules;
};

describe('RuleScoper differential property', () => {
  test('scopes every selector exactly once and keeps every rule', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const input = generateSheet(createRandom(seed), 0);
      const inputRules = parseRules(input);
      expect(
        inputRules,
        `seed ${seed} input must parse: ${input}`,
      ).not.toBeNull();
      const expected = inputRules!.map((rule) => ({
        ...rule,
        selectors: rule.selectors.map((selector) => SCOPE + ' ' + selector),
      }));
      expect(
        { seed, input, rules: parseRules(scope(input)) },
        `seed ${seed}`,
      ).toEqual({ seed, input, rules: expected });
    }
  });
});
