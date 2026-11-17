import type { BlueprintSchema } from '../../../blueprint';

/** Two dynamic payloads share an always-active scalar selector and fixed child. */
export const preparedHostSchema = {
  type: 'object',
  properties: {
    kind: { type: 'number', default: 0 },
    fixed: { type: 'string', default: 'fixed' },
  },
  oneOf: [
    {
      controls: { active: './kind === 0' },
      properties: { a: { type: 'string', default: 'a' } },
    },
    {
      controls: { active: './kind === 1' },
      properties: { b: { type: 'string', default: 'b' } },
    },
  ],
} satisfies BlueprintSchema;
