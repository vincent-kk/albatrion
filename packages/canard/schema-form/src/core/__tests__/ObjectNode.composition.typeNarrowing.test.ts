import { describe, expect, it } from 'vitest';

import {
  NULLABLE_ARRAY,
  NULLABLE_FLAG,
  NULLABLE_REVERSED,
  PLAIN,
  type TypeForm,
  buildCompositionTarget,
} from './ObjectNode.composition.fixtures';

/** Branch types that narrow a nullable parent: rejected before narrowing was allowed. */
const narrowed: [string, TypeForm, TypeForm][] = [
  ["['object','null'] × 'null'", NULLABLE_ARRAY, { type: 'null' }],
  ["['object','null'] × ['null']", NULLABLE_ARRAY, { type: ['null'] }],
  ["['object','null'] × 'object'", NULLABLE_ARRAY, { type: 'object' }],
  ["['object','null'] × ['object']", NULLABLE_ARRAY, { type: ['object'] }],
  ["['null','object'] × 'null'", NULLABLE_REVERSED, { type: 'null' }],
  ["['null','object'] × 'object'", NULLABLE_REVERSED, { type: 'object' }],
  ["nullable:true × 'null'", NULLABLE_FLAG, { type: 'null' }],
  ["nullable:true × ['null']", NULLABLE_FLAG, { type: ['null'] }],
];

/** Branch types that widen the parent or name another type: rejected before and after. */
const rejected: [string, TypeForm, TypeForm][] = [
  ["'object' × 'null'", PLAIN, { type: 'null' }],
  ["'object' × ['null']", PLAIN, { type: ['null'] }],
  ["'object' × ['object','null']", PLAIN, NULLABLE_ARRAY],
  ["['object','null'] × 'string'", NULLABLE_ARRAY, { type: 'string' }],
  ["['object','null'] × 'array'", NULLABLE_ARRAY, { type: 'array' }],
  ["['object','null'] × 'integer'", NULLABLE_ARRAY, { type: 'integer' }],
  [
    "['object','null'] × ['object','string']",
    NULLABLE_ARRAY,
    { type: ['object', 'string'] },
  ],
  ["['object','null'] × []", NULLABLE_ARRAY, { type: [] }],
];

describe.each(['oneOf', 'anyOf'] as const)(
  'ObjectNode composition — %s 분기의 type 좁히기',
  (scope) => {
    it.fails.each(narrowed)(
      'nullable 부모의 type을 좁힌 분기는 만들어져야 함: %s // LIMIT: COMPOSITION_TYPE_REDEFINITION',
      (_label, parent, branch) => {
        const root = buildCompositionTarget(scope, parent, branch);

        expect(root.find('target/kind')).not.toBeNull();
      },
    );

    it.each(rejected)(
      '부모를 넓히거나 다른 타입을 말하는 분기는 거부되어야 함: %s',
      (_label, parent, branch) => {
        expect(() => buildCompositionTarget(scope, parent, branch)).toThrow(
          `Type redefinition not allowed in '${scope}' schema.`,
        );
      },
    );
  },
);
