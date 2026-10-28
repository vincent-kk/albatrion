import { describe, expect, it } from 'vitest';

import { FormErrorCode } from '../../../../errors';
import { blueprint } from '../blueprint';

// filid:contract blueprint-property-addresses
describe('property names equal to a reserved percent spelling', () => {
  it.each(['%2A', '%2E', '%2E%2E', '%40'])(
    'rejects %s on a plain object and names the property and the rule',
    (name) => {
      expect(() =>
        blueprint({ type: 'object', properties: { [name]: { type: 'string' } } }),
      ).toThrow(
        expect.objectContaining({
          code: FormErrorCode.UnknownJsonSchema,
          message: expect.stringContaining(`"${name}"`),
        }),
      );
    },
  );

  it('rejects the name inside a gated branch with the same diagnostic', () => {
    expect(() =>
      blueprint({
        type: 'object',
        properties: { kind: { type: 'string' } },
        oneOf: [
          {
            controls: { active: "./kind === 'a'" },
            properties: { '%2A': { type: 'string' } },
          },
        ],
      }),
    ).toThrow(
      expect.objectContaining({
        code: FormErrorCode.UnknownJsonSchema,
        message: expect.stringContaining('reserved operator name'),
      }),
    );
  });

  it.each(['%2a', '100%', '%2A%2A', '%252A', '*', '.', '..', '@'])(
    'keeps accepting the ordinary or operator-spelled name %s',
    (name) => {
      expect(() =>
        blueprint({ type: 'object', properties: { [name]: { type: 'string' } } }),
      ).not.toThrow();
    },
  );
});
