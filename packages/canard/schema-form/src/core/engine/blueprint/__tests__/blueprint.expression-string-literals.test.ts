import { describe, expect, it } from 'vitest';

import { blueprint } from '../blueprint';

const compile = (active: string) =>
  blueprint({
    type: 'object',
    properties: {
      source: { type: 'string' },
      target: { type: 'string', controls: { active } },
    },
  });

describe('expression paths inside string literals', () => {
  it('keeps a standalone @ inside a string literal as text', () => {
    const result = compile('../source === "a @ b"');
    expect(result.expressions[0].dependencies).toEqual(['../source']);
    expect(result.expressions[0].evaluate(['a @ b'])).toBe(true);
  });

  it('keeps a slash-led word inside a string literal as text', () => {
    const result = compile('../source === "km /h"');
    expect(result.expressions[0].dependencies).toEqual(['../source']);
    expect(result.expressions[0].evaluate(['km /h'])).toBe(true);
    expect(result.expressions[0].hasCompleteReads).toBe(true);
  });

  it('keeps parent and current paths inside single-quoted literals as text', () => {
    const result = compile("../source === 'go ../up or ./here'");
    expect(result.expressions[0].dependencies).toEqual(['../source']);
    expect(result.expressions[0].evaluate(['go ../up or ./here'])).toBe(true);
  });

  it('reads a path after a regular-expression literal that holds a quote', () => {
    const result = compile('../source === /["]/ || ../other === 1');
    expect(result.expressions[0].dependencies).toEqual([
      '../source',
      '../other',
    ]);
    expect(result.expressions[0].evaluate(['x', 1])).toBe(true);
  });

  it('reads a path after a block comment that holds a quote', () => {
    const result = compile('../source /* " */ && ../other === 1');
    expect(result.expressions[0].dependencies).toEqual([
      '../source',
      '../other',
    ]);
    expect(result.expressions[0].evaluate([true, 1])).toBe(true);
  });

  it('leaves paths inside quoteless comments and regular-expression literals as text', () => {
    const lineComment = compile('// ../ignored\n../source === 1');
    expect(lineComment.expressions[0].dependencies).toEqual(['../source']);
    expect(lineComment.expressions[0].evaluate([1])).toBe(true);
    const pattern = compile('/km\\/h/.test(../source)');
    expect(pattern.expressions[0].dependencies).toEqual(['../source']);
    expect(pattern.expressions[0].evaluate(['5 km/h'])).toBe(true);
  });

  it('keeps a slash after a value as division', () => {
    const result = compile('(../source) / 100 > 1 && ../other / 2 < 1');
    expect(result.expressions[0].dependencies).toEqual([
      '../source',
      '../other',
    ]);
    expect(result.expressions[0].evaluate([200, 1])).toBe(true);
  });

  it('keeps gate evaluation reads to the paths outside string literals', () => {
    const result = compile('../source === "a /b" || "@" === ../source');
    const gate = result.root.childEntries[1].declarations[0].gates[0];
    expect(gate.evaluationReads).toEqual([1, 1]);
  });
});
