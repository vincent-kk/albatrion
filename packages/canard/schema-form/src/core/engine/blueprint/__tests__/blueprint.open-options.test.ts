import { describe, expect, it, vi } from 'vitest';

import { FormErrorCode } from '../../../../errors';
import { blueprint } from '../blueprint';

describe('open-options authoring', () => {
  it('accepts custom keys at node and fragment positions without diagnostics', () => {
    const collect = vi.fn();
    expect(() =>
      blueprint(
        {
          type: 'object',
          options: { propertyKeys: ['a'], custom: 1 },
          properties: { a: { type: 'string', options: { custom: 'data' } } },
          allOf: [{ options: { vendor: true } }],
        },
        { collect },
      ),
    ).not.toThrow();
    expect(collect).not.toHaveBeenCalled();
  });

  it.each([null, false, 42, 'choices', ['one', 'two'], new Date(0)])(
    'ignores non-object options %j without diagnostics',
    (options) => {
      const collect = vi.fn();
      expect(
        blueprint(
          { type: 'object', options, properties: { a: { type: 'string' } } },
          { collect },
        ).root.strategy,
      ).toBe('branch');
      expect(collect).not.toHaveBeenCalled();
    },
  );

  it('ignores engine-looking keys on an options array or class instance', () => {
    class Choices {
      terminal = true;
      virtual = false;
      trim = true;
    }
    for (const options of [
      Object.assign(['choice'], { terminal: true, virtual: false }),
      new Choices(),
    ]) {
      const graph = blueprint({
        type: 'object',
        options,
        properties: { a: { type: 'string' } },
      });
      expect(graph.root.strategy).toBe('branch');
      expect(graph.root.childEntries.map(({ name }) => name)).toEqual(['a']);
    }
  });

  it('does not warn for custom or non-object options below a terminal', () => {
    const collect = vi.fn();
    blueprint(
      {
        type: 'object',
        options: { terminal: true },
        properties: {
          a: { type: 'string', options: { custom: true } },
          b: { type: 'string', options: ['choice'] },
        },
      },
      { collect },
    );
    expect(collect).not.toHaveBeenCalled();
  });

  it('uses shallow virtual envelope errors and preserves terminal compatibility errors', () => {
    expect(() =>
      blueprint({ type: 'object', options: { virtual: [] } }),
    ).toThrow(
      expect.objectContaining({ code: FormErrorCode.InvalidControlShape }),
    );
    expect(() =>
      blueprint({ type: 'string', options: { terminal: false } }),
    ).toThrow(
      expect.objectContaining({
        code: FormErrorCode.TerminalOptionUnsupported,
      }),
    );
  });

  it('still closes node, fields, and fragment controls', () => {
    for (const schema of [
      { type: 'string', controls: { custom: true } },
      {
        type: 'object',
        controls: { fields: [{ targets: [], controls: { custom: true } }] },
      },
      { type: 'object', allOf: [{ controls: { custom: true } }] },
    ])
      expect(() => blueprint(schema)).toThrow(
        expect.objectContaining({ code: FormErrorCode.UnknownGroupKey }),
      );
  });
});
