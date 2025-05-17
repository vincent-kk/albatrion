import { isArray, isEmptyObject } from '@winglet/common-utils';

import type { Dictionary, RequiredBy } from '@aileron/declare';

import type { JsonSchema, JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * 필드의 조건을 평탄화한 형태로 나타내는 인터페이스
 */
interface FlattenCondition {
  condition: Dictionary<string | string[]>;
  required: string[];
  inverse?: boolean;
}

/**
 * JSON 스키마의 if-then-else 구조를 평탄화하여 조건 목록을 추출합니다.
 * @param schema - 평탄화할 JSON 스키마
 * @returns 평탄화된 조건 목록 또는 조건이 없을 경우 undefined
 */
export const flattenConditions = (
  schema: JsonSchema,
): FlattenCondition[] | undefined => {
  const conditions: FlattenCondition[] = [];
  flattenConditionsInto(schema, conditions);
  return conditions.length > 0 ? conditions : undefined;
};

/**
 * 스키마에서 추출한 조건을 배열에 추가합니다.
 * @param schema - 추출할 JSON 스키마
 * @param conditions - 조건을 추가할 배열
 * @param collectedConditions - 수집된 조건들
 */
const flattenConditionsInto = (
  schema: JsonSchema,
  conditions: FlattenCondition[],
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
      if (elseRequired?.length) {
        // 지금까지 수집된 모든 조건을 통합
        const inverseCondition: Record<string, string | string[]> = {};

        for (const [key, values] of Object.entries(collectedConditions)) {
          if (values.length === 1) {
            inverseCondition[key] = values[0];
          } else {
            // 배열로 병합
            const merged: string[] = [];
            for (let i = 0; i < values.length; i++) {
              const value = values[i];
              if (isArray(value)) merged.push(...value);
              else merged.push(value);
            }
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

/**
 * JSON 스키마 if 조건에서 속성들의 값 조건을 추출합니다.
 * @param properties - 스키마 속성들
 * @returns 추출된 조건 객체 또는 조건이 없을 경우 null
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
 * 스키마가 유효한 enum 속성을 가지는지 확인합니다.
 * @param schema - 확인할 스키마
 * @returns enum 속성을 가지는지 여부
 */
const isValidEnum = (
  schema: JsonSchemaWithVirtual,
): schema is RequiredBy<JsonSchemaWithVirtual, 'enum'> => !!schema.enum?.length;

/**
 * 스키마가 유효한 const 속성을 가지는지 확인합니다.
 * @param schema - 확인할 스키마
 * @returns const 속성을 가지는지 여부
 */
const isValidConst = (
  schema: JsonSchemaWithVirtual,
): schema is RequiredBy<JsonSchemaWithVirtual, 'const'> =>
  schema.const !== undefined;
