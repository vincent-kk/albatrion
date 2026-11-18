import { describe, expect, it } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { FieldNodeWriteKind, WriteOption } from '../../types/value';
import { writeFieldNode } from '../utils/write/writeFieldNode';

interface NestedValue {
  v: string;
  kids?: NestedValue[];
}
const nested = (depth: number): NestedValue => {
  let value: NestedValue = { v: 'leaf' };
  for (let i = 0; i < depth; i++) value = { v: String(i), kids: [value] };
  return value;
};
describe('round-2 schema-form 5: bounded recursive caller values', () => {
  it.each([300, 1000])(
    'reports the existing diagnostic at depth %s',
    (depth) => {
      const { root } = createTestTree({
        $defs: {
          n: {
            type: 'object',
            properties: {
              v: { type: 'string' },
              kids: { type: 'array', items: { $ref: '#/$defs/n' } },
            },
          },
        },
        $ref: '#/$defs/n',
      });
      expect(() =>
        writeFieldNode(
          root,
          nested(depth),
          FieldNodeWriteKind.Load,
          WriteOption.Overwrite,
        ),
      ).toThrow(
        expect.objectContaining({
          code: 'SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED',
        }),
      );
    },
  );
});
