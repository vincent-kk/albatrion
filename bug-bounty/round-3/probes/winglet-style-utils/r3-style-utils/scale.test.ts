import { describe, expect, it } from 'vitest';

import { compressCss } from '../../index';
import { RuleScoper } from '../../styleManager/StyleManager/utils/RuleScoper';

/** Median wall time in milliseconds of `run` over `repeats` calls. */
const measure = (run: () => unknown, repeats = 5): number => {
  const times: number[] = [];
  for (let index = 0; index < repeats; index++) {
    const start = performance.now();
    run();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
};

const scopeAndCompress = (css: string) =>
  compressCss(new RuleScoper(css, '.s').scopeSheet());

/** Growth factor when the input grows 4x; linear stays near 4, quadratic near 16. */
const growth = (build: (size: number) => string, size: number) => {
  const small = build(size);
  const large = build(size * 4);
  scopeAndCompress(small);
  scopeAndCompress(large);
  const smallTime = measure(() => scopeAndCompress(small));
  const largeTime = measure(() => scopeAndCompress(large));
  return { smallTime, largeTime, ratio: largeTime / smallTime, bytes: large.length };
};

const realisticRule = (index: number) =>
  [
    `.c${index}, .c${index}:hover > .d { color: red; background: url("i${index}.png") no-repeat; }`,
    `@media (min-width: ${index}px) { .m${index} { margin: calc(1px + ${index}px); content: "{;}"; } }`,
    `/* rule ${index} */ .t${index} :is(.a, .b) { padding: 0 1px; }`,
    String.raw`.md\:w-1\/2-${index} { width: 50%; }`,
  ].join('\n');

describe('style-utils on large style sheets (BS1)', () => {
  it('scopes and compresses a realistic sheet in linear time', () => {
    const result = growth(
      (size) => Array.from({ length: size }, (_, index) => realisticRule(index)).join('\n'),
      2000,
    );
    console.info('realistic', result);
    expect(result.ratio).toBeLessThan(8);
  });

  it('handles many unquoted url() values before a comment in one block in linear time', () => {
    const result = growth(
      (size) =>
        `.a { ${Array.from({ length: size }, (_, index) => `--u${index}: url(u${index}.png);`).join(' ')} /* end */ color: red; }`,
      1000,
    );
    console.info('urls-before-comment', result);
    expect(result.ratio).toBeLessThan(8);
  });

  it('handles a long selector list with sibling combinators in linear time', () => {
    const result = growth(
      (size) =>
        `${Array.from({ length: size }, (_, index) => `.a${index} + .b${index}`).join(', ')} { color: red; }`,
      250,
    );
    console.info('sibling-list', result);
    expect(result.ratio).toBeLessThan(8);
  });

  it('handles deeply nested grouping at-rules without a stack overflow', () => {
    const depth = 10000;
    const css = '@media (x) {'.repeat(depth) + '.a{color:red}' + '}'.repeat(depth);
    expect(() => new RuleScoper(css, '.s').scopeSheet()).not.toThrow();
  });

  it('diagnostic: deepest @media nesting that scopes without throwing', () => {
    let low = 1;
    let high = 20000;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      const css = '@media (x) {'.repeat(middle) + '.a{color:red}' + '}'.repeat(middle);
      try {
        new RuleScoper(css, '.s').scopeSheet();
        low = middle;
      } catch {
        high = middle - 1;
      }
    }
    console.info('max nesting depth', low);
    expect(low).toBeGreaterThan(0);
  });
});
