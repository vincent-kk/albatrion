import { describe, expect, it, vi } from 'vitest';

import { blueprint } from '../index';
import { BlueprintErrorCode } from '../utils/diagnostics/constant';

// filid:contract expressions
describe('blueprint expression compilation', () => {
  it('compiles but does not execute authored expressions', () => {
    const result = blueprint({
      type: 'number',
      controls: { derived: '(() => { throw new Error("execute"); })()' },
    });
    expect(result.expressions).toHaveLength(1);
    expect(() => result.expressions[0].evaluate([])).toThrow('execute');
  });
  it('unions watches and expression paths from every gated declaration', () => {
    const result = blueprint({
      type: 'object',
      properties: {
        a: {
          type: 'number',
          controls: {
            watch: ['./left', './left'],
            derived: './right * 2',
            default: 'literal default',
          },
        },
      },
      if: {},
      then: {
        properties: { a: { type: 'number', controls: { watch: './gated' } } },
      },
    });
    expect(Object.keys(result.dependencies)).toEqual([
      './left',
      './right',
      './gated',
    ]);
    expect(result.expressions).toHaveLength(1);
    expect(result.expressions[0].evaluate([3])).toBe(6);
    expect(result.expressions[0].hostPath).toBe('/a');
  });
  it('keeps fragment and children expression origins on the host', () => {
    const result = blueprint({
      type: 'object',
      properties: { a: { type: 'string' } },
      controls: {
        children: [{ targets: ['a'], controls: { visible: './enabled' } }],
      },
      allOf: [
        {
          controls: { active: './branch' },
          properties: { b: { type: 'string' } },
        },
      ],
    });
    expect(result.expressions.map((expression) => expression.hostPath)).toEqual(
      ['', ''],
    );
    expect(
      result.expressions.map((expression) => expression.dependencies),
    ).toEqual([['./enabled'], ['./branch']]);
  });
  it('preserves relative dependencies across shared reference hosts', () => {
    const root = blueprint({
      type: 'object',
      $defs: { value: { type: 'number', controls: { derived: '../source' } } },
      properties: {
        a: { $ref: '#/$defs/value' },
        b: { $ref: '#/$defs/value' },
      },
    });
    expect(root.root.childEntries[0].node).toBe(root.root.childEntries[1].node);
    expect(root.expressions[0].dependencies).toEqual(['../source']);
    expect(root.root.childEntries[1].declarations[0].path).toBe('/b');
  });
  it('rejects wildcard dependencies and non-path watch values', () => {
    for (const watch of ['./rows/*/value', [12]])
      expect(() => blueprint({ type: 'number', controls: { watch } })).toThrow(
        expect.objectContaining({
          specific: BlueprintErrorCode.ObservedValues,
        }),
      );
  });
  it('adds the authored location to compile errors', () => {
    const collect = vi.fn();
    expect(() =>
      blueprint({ type: 'number', controls: { derived: '(()' } }, { collect }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.CreateDynamicFunction,
        details: expect.objectContaining({ schemaPath: '#/controls/derived' }),
      }),
    );
    expect(collect).toHaveBeenCalledWith(
      expect.objectContaining({
        code: BlueprintErrorCode.CreateDynamicFunction,
      }),
    );
  });
});
