import { isArray, isEmptyObject } from '@winglet/common-utils/filter';

import type { Dictionary, RequiredBy } from '@aileron/declare';

import type { JsonSchema, JsonSchemaWithVirtual } from '@/schema-form/types';

interface FlattenCondition {
  condition: Dictionary<string | string[]>;
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
 * @param collectedConditions - Collected conditions
 */
const flattenConditionsInto = (
  schema: JsonSchema,
  conditions: FlattenCondition[],
  collectedConditions: Dictionary<Array<string | string[]>> = {},
): void => {
  if (!schema.if || !schema.then) return;

  const ifCondition = schema.if.properties
    ? extractCondition(schema.if.properties)
    : null;

  if (ifCondition === null) return;

  for (const [key, value] of Object.entries(ifCondition)) {
    if (!collectedConditions[key]) collectedConditions[key] = [];
    collectedConditions[key].push(value);
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
      flattenConditionsInto(schema.else, conditions, collectedConditions);
    else {
      const elseRequired = schema.else.required;
      if (elseRequired?.length) {
        const inverseCondition: Record<string, string | string[]> = {};
        for (const [key, values] of Object.entries(collectedConditions)) {
          if (values.length === 1) {
            inverseCondition[key] = values[0];
          } else {
            const merged: string[] = [];
            for (let i = 0; i < values.length; i++) {
              const value = values[i];
              if (isArray(value)) {
                for (let j = 0, l = value.length; j < l; j++)
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
): Record<string, string | string[]> | null => {
  const condition: Dictionary<string | string[]> = {};
  const propertyEntries = Object.entries(properties);
  for (let i = 0; i < propertyEntries.length; i++) {
    const [propName, propSchema] = propertyEntries[i];
    if (!propSchema || typeof propSchema !== 'object') continue;
    if (isValidConst(propSchema)) {
      condition[propName] = '' + propSchema.const;
    } else if (isValidEnum(propSchema)) {
      const enumValues = propSchema.enum;
      if (enumValues.length === 1) {
        condition[propName] = '' + enumValues[0];
      } else {
        const stringArray: string[] = [];
        for (let j = 0; j < enumValues.length; j++)
          stringArray.push('' + enumValues[j]);
        condition[propName] = stringArray;
      }
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
