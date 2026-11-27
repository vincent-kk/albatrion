import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkSchemaConsumer } from '../helpers/checkSchemaConsumer';

const consumer = `
import type { UnknownSchema, RefSchema, NumberSchema, StringSchema, BooleanSchema, ArraySchema, ObjectSchema, NullSchema, BasicSchema, InferJSONSchema } from '@winglet/json-schema';
type Child = StringSchema | RefSchema;
const ref: RefSchema = { $ref: '#/$defs/A', type: undefined };
const unknown: UnknownSchema = ref;
const string: StringSchema<object, Child> = { type: 'string', minLength: undefined, maxLength: undefined, pattern: undefined, format: undefined };
const number: NumberSchema<object, Child> = { type: 'number', minimum: undefined, maximum: undefined, exclusiveMinimum: undefined, exclusiveMaximum: undefined, multipleOf: undefined };
const boolean: BooleanSchema<object, Child> = { type: 'boolean', nullable: undefined, const: undefined, default: undefined, enum: undefined };
const array: ArraySchema<object, Child> = { type: 'array', items: undefined, prefixItems: undefined, contains: undefined, minItems: undefined, maxItems: undefined, minContains: undefined, maxContains: undefined, uniqueItems: undefined, additionalItems: undefined };
const object: ObjectSchema<object, Child> = { type: 'object', additionalProperties: undefined, unevaluatedProperties: undefined, properties: undefined, patternProperties: undefined, propertyNames: undefined, dependencies: undefined, dependentRequired: undefined, dependentSchemas: undefined, minProperties: undefined, maxProperties: undefined, required: undefined };
const nil: NullSchema<object, Child> = { type: 'null', $defs: undefined, if: undefined, then: undefined, else: undefined, not: undefined, allOf: undefined, anyOf: undefined, oneOf: undefined };
const basic: BasicSchema<string, object, Child> = { active: undefined, visible: undefined, readOnly: undefined, disabled: undefined, options: undefined };
const inferred: InferJSONSchema<string, object, Child> = string;
void [unknown, string, number, boolean, array, object, nil, basic, inferred];
`;

describe('strict public schema declarations', () => {
  for (const exactOptionalPropertyTypes of [false, true]) {
    it(`exactOptionalPropertyTypes=${exactOptionalPropertyTypes}`, () => {
      assert.deepEqual(checkSchemaConsumer(consumer, { exactOptionalPropertyTypes }), []);
    });
  }
});
