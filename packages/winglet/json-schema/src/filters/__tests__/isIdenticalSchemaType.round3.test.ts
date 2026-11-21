import { expect, it } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isIdenticalSchemaType } from '../isIdenticalSchemaType';

it.each([
  'string',
  'number',
  'integer',
  'boolean',
  'object',
  'array',
  'null',
] as const)(
  'round-3 json-schema 2: nullable spellings agree for %s',
  (type) => {
    const shared = [type];
    const nullableTypes = type === 'null' ? [type] : ([type, 'null'] as const);
    const expanded: UnknownSchema = { type: [...nullableTypes] };
    const base: UnknownSchema = { type };
    const nullableForms: UnknownSchema[] = [
      { type, nullable: true },
      { type: [type], nullable: true },
      { type: shared, nullable: true },
    ];
    const plainForms: UnknownSchema[] = [
      base,
      { type: [type] },
      { type: shared },
      { type, nullable: false },
    ];
    for (const nullable of nullableForms) {
      expect(isIdenticalSchemaType(nullable, expanded)).toBe(
        isIdenticalSchemaType(expanded, expanded),
      );
      for (const plain of plainForms) {
        expect(isIdenticalSchemaType(nullable, plain)).toBe(
          isIdenticalSchemaType(expanded, plain),
        );
        expect(isIdenticalSchemaType(plain, nullable)).toBe(
          isIdenticalSchemaType(plain, expanded),
        );
      }
    }
  },
);
