import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@winglet/json-schema';

import { nodeFromJSONSchema } from '@/schema-form/core';

/**
 * The standard JSON Schema way to let a nullable object with `oneOf` validate
 * as `null`: one `{ type: 'null' }` branch, and object branches that declare
 * `type: 'object'` so `null` matches exactly one branch.
 */
describe('nullable.object-null-branch.render — the standard null-branch pattern', () => {
  const schema: JSONSchema = {
    type: 'object',
    properties: {
      target: {
        type: ['object', 'null'],
        properties: {
          kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
        },
        oneOf: [
          { type: 'null' },
          {
            type: 'object',
            '&if': "./kind === 'a'",
            properties: { aValue: { type: 'string', minLength: 3 } },
          },
          {
            type: 'object',
            '&if': "./kind === 'b'",
            properties: { bValue: { type: 'string' } },
          },
        ],
      },
    },
  };

  it('builds a form from the pattern', () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: { target: null },
    });

    expect(root.value).toEqual({ target: null });
    expect(root.find('target/aValue')).not.toBeNull();
  });
});
