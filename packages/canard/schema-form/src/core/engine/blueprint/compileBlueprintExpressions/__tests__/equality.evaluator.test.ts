import { expect, it, vi } from 'vitest';

import { blueprint } from '../../blueprint';
import { createDynamicFunction } from '../createDynamicFunction';
import { getPathManager } from '../getPathManager';
import { recognizeEqualityExpression } from '../recognizeEqualityExpression';
import { createEqualityEvaluator } from '../utils/createEqualityEvaluator';

it('does not construct Function for proven strict equality and OR controls', () => {
  const functions = vi.spyOn(globalThis, 'Function');
  try {
    const result = blueprint({
      type: 'string',
      controls: {
        active: './kind === "a" || ./kind === null',
        visible: './kind === 0',
        derived: './kind === false',
      },
    });
    expect(result.expressions).toHaveLength(3);
    expect(functions).not.toHaveBeenCalled();
    expect(result.expressions.map((entry) => entry.dependencies)).toEqual([
      ['./kind'],
      ['./kind'],
      ['./kind'],
    ]);
  } finally {
    functions.mockRestore();
  }
});

it('matches compiler results throughout accepted syntax and boundary values', () => {
  const literals = [
    "'a'",
    '"b"',
    "'\\\\'",
    "'\\'" + "'",
    '"\\"' + '"',
    "'\\b\\f\\n\\r\\t\\v'",
    "'\\0'",
    "'\\x41'",
    "'\\u0041'",
    "'\\u{1F600}'",
    "'\\uD800'",
    '0',
    '-0',
    '-1',
    '.5',
    '5.',
    '1.25e-2',
    '1E+2',
    '0x10',
    '-0x10',
    '0o10',
    '0b10',
    'true',
    'false',
    'null',
  ];
  const boundaries: unknown[] = [
    undefined,
    null,
    NaN,
    Infinity,
    -Infinity,
    -0,
    0,
    1,
    -1,
    Number.MIN_VALUE,
    Number.MAX_VALUE,
    0.5,
    5,
    0.0125,
    100,
    16,
    -16,
    8,
    2,
    true,
    false,
    '',
    '0',
    'null',
    'a',
    'b',
    'A',
    '😀',
    '\ud800',
    '\\',
    "'",
    '"',
    '\0',
    '\b\f\n\r\t\v',
    {},
    [],
    [0],
    { a: 1 },
    '10',
    BigInt(10),
    Symbol('kind'),
    'other',
  ];
  const sources: string[] = [];
  for (const literal of literals) {
    sources.push(
      `./kind === ${literal}`,
      `${literal} === ./kind`,
      `((./kind)) === ((${literal}))`,
      `((./kind === ${literal}) || ('other' === ./kind));`,
      `./kind === ${literal} || ./kind === ${literal}`,
    );
  }
  for (let start = 0; start < literals.length; start++) {
    for (const count of [2, 3, 4]) {
      const parts = Array.from({ length: count }, (_, offset) => {
        const literal = literals[(start + offset) % literals.length];
        return offset % 2 === 0
          ? `./kind === ${literal}`
          : `${literal} === ./kind`;
      });
      sources.push(parts.join(' || '), `(${parts.join(') || (')});`);
    }
  }
  const functions = vi.spyOn(globalThis, 'Function');
  try {
    for (const source of sources) {
      for (const key of ['active', 'visible', 'derived'] as const) {
        const compiled = createDynamicFunction(
          getPathManager(),
          key,
          source,
          true,
        )!;
        functions.mockClear();
        const recognized = recognizeEqualityExpression(source, ['./kind']);
        expect(recognized, source).toBeDefined();
        const evaluate = createEqualityEvaluator(recognized!.literals);
        const expression = blueprint({
          type: 'string',
          controls: { [key]: source },
        }).expressions[0];
        expect(expression.dependencies, source).toEqual(['./kind']);
        for (const dependencies of [
          ...boundaries.map((value) => [value]),
          [],
          [undefined, 1],
        ]) {
          const label = `${key}: ${source}, ${dependencies.map(String).join(',')}`;
          const expected = compiled(dependencies);
          expect(evaluate(dependencies), label).toBe(expected);
          expect(expression.evaluate(dependencies), label).toBe(expected);
          expect(functions, label).not.toHaveBeenCalled();
        }
      }
    }
  } finally {
    functions.mockRestore();
  }
});

it('keeps fallback dependency order, eager syntax errors and proof descriptors', () => {
  const functions = vi.spyOn(globalThis, 'Function');
  try {
    const result = blueprint({
      type: 'string',
      controls: { active: './b === 1 || ./a === 2', derived: './b + ./a' },
    });
    expect(functions).toHaveBeenCalledTimes(2);
    expect(result.expressions.map((entry) => entry.dependencies)).toEqual([
      ['./b', './a'],
      ['./b', './a'],
    ]);
    for (const entry of result.expressions)
      expect(
        Object.getOwnPropertyDescriptor(entry, 'completeReads'),
      ).toMatchObject({ value: true, enumerable: false, writable: false });
    expect(() =>
      blueprint({
        type: 'string',
        controls: { active: 'false', visible: './kind ===' },
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION',
        details: expect.objectContaining({ schemaPath: '#/controls/visible' }),
      }),
    );
  } finally {
    functions.mockRestore();
  }
});
