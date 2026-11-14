import { describe, expect, it } from 'vitest';

import { getBlueprintNodeIdentity } from '../utils/nodeIdentity/getBlueprintNodeIdentity';

// Regression records for the shared identity token, including unchanged scalar keys.
describe('blueprint fold identity tokens', () => {
  it.each([
    { kind: 'string', types: ['string', 'number'], token: 'union:3' },
    { kind: 'number', types: ['number', 'string'], token: 'union:3' },
    { kind: 'boolean', types: ['string', 'boolean'], token: 'union:5' },
    { kind: 'object', types: ['integer', 'string', 'null'], token: 'union:3' },
    { kind: 'array', types: ['boolean', 'number', 'string'], token: 'union:7' },
    { kind: 'null', types: ['string', 'number', 'null'], token: 'union:3' },
    {
      kind: 'virtual',
      types: ['number', 'string', 'integer'],
      token: 'union:3',
    },
  ] as const)(
    'keeps $kind dispatch and identifies $types as $token',
    ({ kind, types, token }) => {
      expect(getBlueprintNodeIdentity({ kind })).toBe(kind);
      const node = { kind: 'union', schemaType: types };
      expect(getBlueprintNodeIdentity(node)).toBe(token);
      expect(getBlueprintNodeIdentity(node)).toBe(token);
      expect(
        getBlueprintNodeIdentity({
          kind: 'union',
          schemaType: [...types].reverse(),
        }),
      ).toBe(token);
    },
  );
});
