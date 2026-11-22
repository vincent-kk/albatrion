import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue });

/** Inline every local `$ref` (non-recursive schemas only). */
describe('control: one array whose item template reads the array owner', () => {
  it('A1 every item follows the owner flag (no $ref reuse)', () => {
    const schema = {
      type: 'object',
      properties: {
        flag: { type: 'boolean', default: false },
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              a: { type: 'string', default: 'v' },
              t: {
                type: 'string',
                default: 't',
                controls: { active: '../../../flag === true' },
              },
            },
          },
        },
      },
    };
    const root = tree(schema, { list: [{}, {}] });
    root.find('/flag')!.setValue(true);
    const on = root.value;
    root.find('/flag')!.setValue(false);
    expect({ on, off: root.value }).toEqual({
      on: {
        flag: true,
        list: [
          { a: 'v', t: 't' },
          { a: 'v', t: 't' },
        ],
      },
      off: { flag: false, list: [{ a: 'v' }, { a: 'v' }] },
    });
  });
});
