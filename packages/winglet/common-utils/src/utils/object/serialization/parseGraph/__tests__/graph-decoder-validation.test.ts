// filid:contract graph-decoder-validation
import { expect, it, vi } from 'vitest';

import { parseGraph, stringifyGraph } from '../../index';

const wire = (nodes: unknown[], root: unknown = ['ref', 0]) =>
  JSON.stringify(['winglet.graph', 1, root, nodes]);

it('rejects oversized UTF-8 and excessive node tables', () => {
  expect(() => stringifyGraph('한'.repeat(6000000))).toThrow(TypeError);
  expect(() => parseGraph(' '.repeat(16777217))).toThrow(TypeError);
  expect(() =>
    parseGraph(
      wire(
        Array.from({ length: 100001 }, () => ['object', 'plain', []]),
        ['null'],
      ),
    ),
  ).toThrow(TypeError);
});

it('accepts the cumulative array boundary while preserving holes', () => {
  const result = parseGraph(stringifyGraph(new Array(1000000))) as unknown[];
  expect(result.length).toBe(1000000);
  expect(Object.keys(result)).toEqual([]);
});

it('validates unreachable malformed nodes and rejects experimental tags', () => {
  expect(() =>
    parseGraph(wire([['object', 'plain', [['x', ['ref', 2]]]]], ['null'])),
  ).toThrow(TypeError);
  expect(() => parseGraph(wire([['array-dense', [], []]]))).toThrow(TypeError);
});

it('rejects malformed envelope, tokens, references and payloads', () => {
  for (const value of [
    null,
    ['winglet.graph', 2, ['null'], []],
    ['winglet.graph', 1, ['ref', 0], []],
    ['winglet.graph', 1, ['bigint', '01'], []],
    ['winglet.graph', 1, ['null', 1], []],
  ])
    expect(() => parseGraph(JSON.stringify(value))).toThrow(TypeError);
  for (const node of [
    ['date', ['number', Infinity]],
    ['date', ['number', 1.5]],
    ['regexp', '[', '', ['number', 0]],
    ['array', 1, [['1', ['null']]]],
    ['array', 0, [['length', ['number', 1]]]],
    [
      'object',
      'plain',
      [
        ['x', ['null']],
        ['x', ['null']],
      ],
    ],
  ])
    expect(() => parseGraph(wire([node]))).toThrow(TypeError);
  expect(() => parseGraph('{')).toThrow(SyntaxError);
});
it('rejects duplicate Map and Set entries including numeric equivalence', () => {
  expect(() =>
    parseGraph(
      wire([
        [
          'set',
          [
            ['number', 0],
            ['number', '-0'],
          ],
        ],
      ]),
    ),
  ).toThrow(TypeError);
  expect(() =>
    parseGraph(
      wire([
        [
          'map',
          [
            [['string', 'x'], ['null']],
            [['string', 'x'], ['null']],
          ],
        ],
      ]),
    ),
  ).toThrow(TypeError);
});
it('validates all array lengths including unreachable nodes', () => {
  expect(() =>
    parseGraph(
      wire(
        [
          ['array', 600000, []],
          ['array', 600000, []],
        ],
        ['null'],
      ),
    ),
  ).toThrow(TypeError);
  expect(() => stringifyGraph([new Array(600000), new Array(600000)])).toThrow(
    TypeError,
  );
  expect(() => stringifyGraph(new Array(1000001))).toThrow(TypeError);
});
it('restores own properties independently of inherited setters and readonly values', () => {
  const setter = vi.fn();
  Object.defineProperty(Object.prototype, 'graphTestSetter', {
    set: setter,
    configurable: true,
  });
  Object.defineProperty(Object.prototype, 'graphTestReadonly', {
    value: 9,
    configurable: true,
  });
  try {
    const input = JSON.parse(
      '{"__proto__":1,"constructor":2,"graphTestSetter":3,"graphTestReadonly":4}',
    );
    const result = parseGraph(stringifyGraph(input));
    expect(result).toEqual(input);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(setter).not.toHaveBeenCalled();
  } finally {
    delete (Object.prototype as any).graphTestSetter;
    delete (Object.prototype as any).graphTestReadonly;
  }
});
