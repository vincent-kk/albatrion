import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue });

/** Inline every local `$ref` (non-recursive schemas only). */
describe('diagnostic: recursive template control', () => {
  it('D4 O13 plus an unrelated visible control', () => {
    const schema = {
      type: 'object',
      properties: {
        root: { $ref: '#/$defs/N' },
        extra: {
          type: 'string',
          controls: { visible: '../root/open === true' },
        },
      },
      $defs: {
        N: {
          type: 'object',
          properties: {
            open: { type: 'boolean', default: true },
            label: {
              type: 'string',
              default: 'L',
              controls: { active: '../../../open === true' },
            },
            kids: { type: 'array', items: { $ref: '#/$defs/N' } },
          },
        },
      },
    };
    const root = tree(schema, {
      root: { open: true, kids: [{ open: true, kids: [{}] }] },
    });
    const before = root.find('/root/kids/0/kids/0/label')! !== null;
    root.find('/root/kids/0/open')!.setValue(false);
    const after = root.find('/root/kids/0/kids/0/label')! !== null;
    expect({ before, after }).toEqual({ before: true, after: false });
  });
});
