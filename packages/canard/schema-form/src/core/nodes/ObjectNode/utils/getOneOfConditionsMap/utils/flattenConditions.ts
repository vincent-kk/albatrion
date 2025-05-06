import { isArray, isEmptyObject } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import type { JsonSchema } from '@/schema-form/types';

import { isValidConst, isValidEnum } from './filter';

interface FlatRequiredRule {
  condition: Record<string, string | string[]>;
  required: string[];
  inverse?: boolean;
}

export const flattenConditions = (schema: JsonSchema): FlatRequiredRule[] => {
  const conditions: FlatRequiredRule[] = [];
  flattenConditionsInto(schema, conditions);
  return conditions;
};

const flattenConditionsInto = (
  schema: JsonSchema,
  conditions: FlatRequiredRule[],
  collectedConditions: Dictionary<Array<string | string[]>> = {},
): void => {
  if (!schema.if || !schema.then) return;

  // if 조건 추출
  const ifCondition = schema.if.properties
    ? extractCondition(schema.if.properties)
    : null;

  if (ifCondition === null) return;

  // 현재 조건을 수집
  for (const [key, value] of Object.entries(ifCondition)) {
    if (!collectedConditions[key]) collectedConditions[key] = [];
    collectedConditions[key].push(value);
  }

  // then 부분 처리
  const thenRequired = schema.then?.required;
  if (isArray(thenRequired) && thenRequired.length > 0)
    conditions[conditions.length] = {
      condition: ifCondition,
      required: thenRequired,
    };

  // else 부분 처리
  if (schema.else) {
    // 중첩된 if-then-else 처리 (재귀 호출)
    if (schema.else.if && schema.else.then) {
      flattenConditionsInto(schema.else, conditions, collectedConditions);
    } else {
      const elseRequired = schema.else.required;
      if (elseRequired.length) {
        // 지금까지 수집된 모든 조건을 통합
        const inverseCondition: Record<string, string | string[]> = {};

        for (const [key, values] of Object.entries(collectedConditions)) {
          if (values.length === 1) {
            inverseCondition[key] = values[0];
          } else {
            // 배열로 병합
            const merged: string[] = [];
            values.forEach((value) => {
              if (Array.isArray(value)) {
                merged.push(...value);
              } else {
                merged.push(value);
              }
            });
            inverseCondition[key] = merged;
          }
        }
        conditions[conditions.length] = {
          condition: inverseCondition,
          required: elseRequired,
          inverse: true,
        };
      }
    }
  }
};

// 조건 추출 함수
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
