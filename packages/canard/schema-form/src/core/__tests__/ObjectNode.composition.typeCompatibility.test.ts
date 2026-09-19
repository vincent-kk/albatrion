import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';
import {
  NULLABLE_ARRAY,
  NULLABLE_FLAG,
  PLAIN,
  type TypeForm,
  buildCompositionTarget,
} from './ObjectNode.composition.fixtures';

/** Branch types accepted all along; narrowing must not take any of them away. */
const compatible: [string, TypeForm, TypeForm][] = [
  ["'object' × (type 생략)", PLAIN, {}],
  ["['object','null'] × (type 생략)", NULLABLE_ARRAY, {}],
  ['nullable:true × (type 생략)', NULLABLE_FLAG, {}],
  ["'object' × 'object'", PLAIN, { type: 'object' }],
  ["'object' × ['object']", PLAIN, { type: ['object'] }],
  ["'object' × {object, nullable:true}", PLAIN, NULLABLE_FLAG],
  ["['object','null'] × ['object','null']", NULLABLE_ARRAY, NULLABLE_ARRAY],
  [
    "['object','null'] × {object, nullable:true}",
    NULLABLE_ARRAY,
    NULLABLE_FLAG,
  ],
  ["nullable:true × 'object'", NULLABLE_FLAG, { type: 'object' }],
];

describe.each(['oneOf', 'anyOf'] as const)(
  'ObjectNode composition — %s 분기의 type 호환',
  (scope) => {
    it.each(compatible)(
      '좁히기 이전부터 만들어지던 조합은 계속 만들어져야 함: %s',
      (_label, parent, branch) => {
        const root = buildCompositionTarget(scope, parent, branch);

        expect(root.find('target/kind')).not.toBeNull();
      },
    );
  },
);

/** A branch entry with a `type` is a field node; one without is a branch condition. Narrowing leaves that boundary where it was. */
describe('ObjectNode composition — type이 있으면 노드, 없으면 분기 조건', () => {
  const schemaWith = (discriminator: { const: string; type?: 'string' }) =>
    ({
      type: 'object',
      properties: { kind: { type: 'string', enum: ['a', 'b'], default: 'a' } },
      oneOf: [
        {
          properties: {
            kind: discriminator,
            aValue: { type: 'string' },
          },
        },
        {
          properties: {
            kind: { const: 'b' },
            bValue: { type: 'string' },
          },
        },
      ],
    }) satisfies JSONSchema;

  it('type 없는 const 항목은 분기 조건으로 쓰여야 함', () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schemaWith({ const: 'a' }),
    }) as ObjectNode;

    expect(root.oneOfIndex).toBe(0);
    expect(root.find('aValue')).not.toBeNull();
  });

  it('같은 항목에 type을 붙이면 부모의 같은 이름 필드와 충돌해야 함', () => {
    expect(() =>
      nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: schemaWith({ const: 'a', type: 'string' }),
      }),
    ).toThrow("Property redefinition not allowed in 'oneOf' schema.");
  });
});
