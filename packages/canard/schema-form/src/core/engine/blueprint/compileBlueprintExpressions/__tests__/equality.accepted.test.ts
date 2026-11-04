import { describe, expect, it, vi } from 'vitest';

import { blueprint } from '../../blueprint';
import { createDynamicFunction } from '../createDynamicFunction';
import * as compiler from '../createDynamicFunction';
import { getPathManager } from '../getPathManager';
import { recognizeEqualityExpression } from '../recognizeEqualityExpression';

describe('non-executing equality recognition', () => {
  it('adds no Function or eval calls while compiling the five branch benchmark fixtures', () => {
    const functions = vi.spyOn(globalThis, 'Function');
    const evaluations = vi.spyOn(globalThis, 'eval');
    const compile = compiler.createDynamicFunction;
    let compilerCalls = 0;
    const compiling = vi
      .spyOn(compiler, 'createDynamicFunction')
      .mockImplementation((manager, key, source, boolean) => {
        const before = functions.mock.calls.length;
        const result = boolean
          ? compile(manager, key, source, true)
          : compile(manager, key, source, false);
        compilerCalls += functions.mock.calls.length - before;
        return result;
      });
    try {
      for (const count of [5, 10, 20, 40, 80]) {
        const analysis = blueprint({
          type: 'object',
          properties: {
            common: { type: 'string', default: 'shared' },
            kind: { type: 'string', default: 'kind_0' },
          },
          oneOf: Array.from({ length: count }, (_, index) => ({
            controls: { active: `./kind === 'kind_${index}'` },
            properties: {
              [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
              [`payload_${index}_b`]: { type: 'number', default: index },
              [`payload_${index}_c`]: {
                type: 'boolean',
                default: index % 2 === 0,
              },
            },
          })),
        });
        expect(
          analysis.expressions.every(
            (expression) => expression.equality !== undefined,
          ),
        ).toBe(true);
      }
      expect(compilerCalls).toBe(155);
      expect(functions).toHaveBeenCalledTimes(compilerCalls);
      expect(evaluations).not.toHaveBeenCalled();
    } finally {
      compiling.mockRestore();
      evaluations.mockRestore();
      functions.mockRestore();
    }
  });
  it.each([
    ["./kind === 'a'", ['a']],
    ["'a' === ./kind", ['a']],
    ["(./kind === 'a') || (./kind === 'b')", ['a', 'b']],
    ["((./kind)) === (('a'))", ['a']],
    ["((./kind === 'a') || ('b' === ./kind));", ['a', 'b']],
    ["./kind === 'a' || ./kind === 'a'", ['a', 'a']],
  ])('recognizes the whole expression %s', (source, literals) => {
    expect(recognizeEqualityExpression(String(source), ['./kind'])).toEqual({
      literals,
    });
  });

  it('resolves every supported literal exactly like the compiled comparison', () => {
    const literals = [
      ["'a'", 'a'],
      ['"b"', 'b'],
      ["'\\\\'", '\\'],
      ["'\\'" + "'", "'"],
      ['"\\"' + '"', '"'],
      ["'\\b\\f\\n\\r\\t\\v'", '\b\f\n\r\t\v'],
      ["'\\0'", '\0'],
      ["'\\x41'", 'A'],
      ["'\\u0041'", 'A'],
      ["'\\u{1F600}'", '😀'],
      ["'\\uD800'", '\uD800'],
      ['0', 0],
      ['-0', -0],
      ['-1', -1],
      ['.5', 0.5],
      ['5.', 5],
      ['1.25e-2', 0.0125],
      ['1E+2', 100],
      ['0x10', 16],
      ['-0x10', -16],
      ['0o10', 8],
      ['0b10', 2],
      ['true', true],
      ['false', false],
      ['null', null],
    ] as const;
    for (const [text, value] of literals) {
      const source = './kind === ' + text;
      const result = recognizeEqualityExpression(source, ['./kind']);
      expect(result, text).toBeDefined();
      expect(Object.is(result!.literals[0], value), text).toBe(true);
      const evaluate = createDynamicFunction(
        getPathManager(),
        'active',
        source,
        true,
      )!;
      expect(evaluate([value]), text).toBe(true);
      for (const other of [undefined, NaN, {}, 'other'])
        expect(evaluate([other]), text).toBe(false);
    }
  });

  it('attaches evidence only to active expressions with one dependency', () => {
    const analysis = blueprint({
      type: 'object',
      properties: { kind: { type: 'string' }, other: { type: 'string' } },
      controls: { active: "./kind === 'a'", visible: "./kind === 'a'" },
      oneOf: [
        { controls: { active: "./kind === 'a' || ./other === 'b'" } },
        { controls: { active: 'true' } },
      ],
    });
    expect(
      analysis.expressions.find(
        (expression) => expression.schemaPath === '#/controls/active',
      )?.equality,
    ).toEqual({ literals: ['a'] });
    expect(
      analysis.expressions
        .filter((expression) => expression.schemaPath !== '#/controls/active')
        .every((expression) => expression.equality === undefined),
    ).toBe(true);
  });
});
