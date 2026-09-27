import { describe, expect, it } from 'vitest';

import { ENHANCED_KEY } from '@/schema-form/app/constants/internal';
import type { JSONSchema } from '@/schema-form/types';

import { preprocessSchema } from '../preprocessSchema';

/** The branch marker is an object property, so a `{ type: 'null' }` branch has nowhere to carry it; the object branches keep the marker of their own array position. */
describe('preprocessSchema — oneOf의 null 분기', () => {
  it.each([
    ["'null'", { type: 'null' }],
    ["['null']", { type: ['null'] }],
  ])('type %s 분기에는 분기 마커를 넣지 않아야 함', (_label, nullBranch) => {
    // Through JSON, as a schema from a server arrives: the static types have no single-element `['null']`.
    const schema: JSONSchema = JSON.parse(
      JSON.stringify({
        type: ['object', 'null'],
        oneOf: [
          nullBranch,
          { type: 'object', properties: { a: { type: 'string' } } },
          { type: 'object', properties: { b: { type: 'number' } } },
        ],
      }),
    );

    expect(preprocessSchema(schema)).toEqual({
      type: ['object', 'null'],
      oneOf: [
        nullBranch,
        {
          type: 'object',
          properties: { [ENHANCED_KEY]: { const: 1 }, a: { type: 'string' } },
        },
        {
          type: 'object',
          properties: { [ENHANCED_KEY]: { const: 2 }, b: { type: 'number' } },
        },
      ],
    });
  });
});
