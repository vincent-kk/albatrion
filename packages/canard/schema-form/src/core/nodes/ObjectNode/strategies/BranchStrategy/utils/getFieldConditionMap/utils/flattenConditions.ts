import { isArray, isEmptyObject } from '@winglet/common-utils/filter';
import { getEmptyObject } from '@winglet/common-utils/object';

import type { Dictionary, RequiredBy } from '@aileron/declare';

import type {
  AllowedValue,
  JsonSchema,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

export interface FlattenCondition {
  condition: Dictionary<AllowedValue | AllowedValue[]>;
  required: string[];
  inverse?: boolean;
}

/**
 * Flattens the if-then-else structure of JSON schema to extract condition lists.
 * @param schema - JSON schema to flatten
 * @returns Flattened condition list or undefined if no conditions exist
 */
export const flattenConditions = (
  schema: JsonSchema,
): FlattenCondition[] | undefined => {
  const conditions: FlattenCondition[] = [];
  flattenConditionsInto(schema, conditions);
  return conditions.length > 0 ? conditions : undefined;
};

/**
 * Adds conditions extracted from schema to the array.
 * @param schema - JSON schema to extract from
 * @param conditions - Array to add conditions to
 * @param accumulator - Collected conditions
 */
const flattenConditionsInto = (
  schema: JsonSchema,
  conditions: FlattenCondition[],
  accumulator: Dictionary<
    Array<AllowedValue | AllowedValue[]>
  > = getEmptyObject(),
): void => {
  if (!schema.if || !schema.then) return;
  const ifCondition = schema.if.properties
    ? extractCondition(schema.if.properties)
    : null;
  if (ifCondition === null) return;
  for (const key in ifCondition) {
    if (accumulator[key]) accumulator[key].push(ifCondition[key]);
    else accumulator[key] = [ifCondition[key]];
  }
  const thenRequired = schema.then?.required as string[];
  if (thenRequired?.length) {
    const thenVirtualRequired = schema.then.virtualRequired as string[];
    conditions[conditions.length] = {
      condition: ifCondition,
      required: thenVirtualRequired?.length
        ? [...thenRequired, ...thenVirtualRequired]
        : thenRequired,
    };
  }
  if (schema.else) {
    if (schema.else.if && schema.else.then)
      flattenConditionsInto(schema.else, conditions, accumulator);
    else {
      const elseRequired = schema.else.required;
      if (elseRequired?.length) {
        const inverseCondition: FlattenCondition['condition'] = {};
        for (const key in accumulator) {
          const values = accumulator[key];
          if (values.length === 1) {
            inverseCondition[key] = values[0];
          } else {
            const merged: AllowedValue[] = [];
            for (let i = 0, il = values.length; i < il; i++) {
              const value = values[i];
              if (isArray(value)) {
                for (let j = 0, jl = value.length; j < jl; j++)
                  merged.push(value[j]);
              } else merged.push(value);
            }
            inverseCondition[key] = merged;
          }
        }
        const elseVirtualRequired = schema.else.virtualRequired as string[];
        conditions[conditions.length] = {
          condition: inverseCondition,
          required: elseVirtualRequired?.length
            ? [...elseRequired, ...elseVirtualRequired]
            : elseRequired,
          inverse: true,
        };
      }
    }
  }
};

/**
 * Extracts value conditions for properties from JSON schema if conditions.
 * @param properties - Schema properties
 * @returns Extracted condition object or null if no conditions exist
 */
const extractCondition = (
  properties: Record<string, any>,
): FlattenCondition['condition'] | null => {
  const condition: FlattenCondition['condition'] = getEmptyObject();
  const keys = Object.keys(properties);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const propSchema = properties[k];
    if (!propSchema || typeof propSchema !== 'object') continue;
    if (isValidConst(propSchema)) condition[k] = propSchema.const;
    else if (isValidEnum(propSchema)) {
      const enumValues = propSchema.enum;
      if (enumValues.length === 1) condition[k] = enumValues[0];
      else condition[k] = enumValues;
    }
  }
  return isEmptyObject(condition) ? null : condition;
};

/**
 * Checks if schema has valid enum property.
 * @param schema - Schema to check
 * @returns Whether it has enum property
 */
const isValidEnum = (
  schema: JsonSchemaWithVirtual,
): schema is RequiredBy<JsonSchemaWithVirtual, 'enum'> => !!schema.enum?.length;

/**
 * Checks if schema has valid const property.
 * @param schema - Schema to check
 * @returns Whether it has const property
 */
const isValidConst = (
  schema: JsonSchemaWithVirtual,
): schema is RequiredBy<JsonSchemaWithVirtual, 'const'> =>
  schema.const !== undefined;
