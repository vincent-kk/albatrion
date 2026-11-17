import { describe, expect, test } from 'vitest';

import { RuleScoper } from '../utils/RuleScoper';
import { createRandom } from './fixtures/createRandom';
import { generateSheet } from './fixtures/generateSheet';

const SCOPE = '.s';
const scope = (css: string) => new RuleScoper(css, SCOPE).scopeSheet();

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
