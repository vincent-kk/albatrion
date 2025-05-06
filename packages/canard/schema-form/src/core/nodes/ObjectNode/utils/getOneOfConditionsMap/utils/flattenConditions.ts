import { isArray, isEmptyObject } from '@winglet/common-utils';

import type { JsonSchema } from '@/schema-form/types';

import { isValidConst, isValidEnum } from './filter';

interface FlatRequiredRule {
  condition: Record<string, string | string[]> | true;
  required: string[];
}

export const flattenConditions = (schema: JsonSchema): FlatRequiredRule[] => {
  const conditions: FlatRequiredRule[] = [];
  flattenConditionsInto(schema, conditions);
  return conditions;
};

const flattenConditionsInto = (
  schema: JsonSchema,
  conditions: FlatRequiredRule[],
): void => {
  if (!schema.if || !schema.then) return;

  // if 조건 추출
  const ifCondition = schema.if.properties
    ? extractCondition(schema.if.properties)
    : null;

  // then 부분 처리
  const thenRequired = schema.then?.required;
  if (ifCondition && isArray(thenRequired) && thenRequired.length > 0)
    conditions[conditions.length] = {
      condition: ifCondition,
      required: thenRequired,
    };

  // else 부분 처리
  if (schema.else) {
    // 중첩된 if-then-else 처리 (재귀 호출)
    if (schema.else.if && schema.else.then)
      flattenConditionsInto(schema.else, conditions);
    else {
      const elseRequired = schema.else.required;
      if (isArray(elseRequired) && elseRequired.length > 0)
        conditions[conditions.length] = {
          condition: true,
          required: elseRequired,
        };
    }
  }
};

// 조건 추출 함수
const extractCondition = (
  properties: Record<string, any>,
): Record<string, string | string[]> | null => {
  const condition: Record<string, string | string[]> = {};
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
