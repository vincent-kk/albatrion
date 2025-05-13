import { isArray } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { ALIAS, JSON_PATH_REGEX } from './regex';

type GetConditionIndex = Fn<[dependencies: unknown[]], number>;

/**
 * 단순 동등성 비교를 위한 정규식 패턴
 * dependencies[n] === "value" 형태의 표현식을 매칭합니다.
 */
const SIMPLE_EQUALITY_REGEX =
  /^\s*dependencies\[(\d+)\]\s*===\s*(['"])([^'"]+)\2\s*$/;

/**
 * 조건 스키마의 인덱스를 계산하는 함수를 생성합니다.
 *
 * @param jsonSchema - JSON 스키마
 * @returns 조건 인덱스 팩토리 함수
 */
export const getConditionIndexFactory =
  (jsonSchema: JsonSchemaWithVirtual) =>
  /**
   * 주어진 의존성 경로와 필드명에 대해 조건 인덱스 계산 함수를 반환합니다.
   *
   * @param dependencyPaths - 의존성 경로 배열
   * @param fieldName - 인덱스를 계산할 필드명 (oneOf, anyOf 등)
   * @param conditionField - 조건이 명시된 필드명 (if, ifNot, ifAny, ifAll)
   * @returns 조건 인덱스 계산 함수 또는 undefined
   */
  (
    dependencyPaths: string[],
    fieldName: string,
    conditionField: string,
  ): GetConditionIndex | undefined => {
    // 유효하지 않은 스키마면 undefined 반환
    if (jsonSchema.type !== 'object' || !isArray(jsonSchema[fieldName]))
      return undefined;

    const conditionSchemas = jsonSchema[fieldName];
    const expressions: string[] = [];
    const schemaIndices: number[] = [];

    // 유효한 표현식만 수집하고 원래 스키마 인덱스 유지
    for (let index = 0; index < conditionSchemas.length; index++) {
      // `computed.[<conditionField>]` 또는 `&[<conditionField>]` 필드에서 표현식 추출
      const condition =
        conditionSchemas[index]?.computed?.[conditionField] ??
        conditionSchemas[index]?.[`${ALIAS}${conditionField}`];

      // 불리언 조건 처리
      if (typeof condition === 'boolean') {
        if (condition === true) {
          expressions.push('true');
          schemaIndices.push(index);
        }
        continue;
      }

      // 문자열 조건 처리
      const expression = condition?.trim?.();
      if (!expression || typeof expression !== 'string') continue;

      // JSON 경로를 의존성 배열 참조로 변환
      expressions.push(
        expression
          .replace(JSON_PATH_REGEX, (path) => {
            if (!dependencyPaths.includes(path)) dependencyPaths.push(path);
            return `dependencies[${dependencyPaths.indexOf(path)}]`;
          })
          .replace(/;$/, ''),
      );
      schemaIndices.push(index);
    }

    if (expressions.length === 0) return undefined;

    // 단순 동등성 비교 최적화를 위한 분석
    const equalityMap: Record<number, Record<string, number>> = {};
    let isSimpleEquality = true;

    for (let index = 0; index < expressions.length; index++) {
      if (expressions[index] === 'true') {
        isSimpleEquality = false;
        break;
      }

      // 단순 동등성 패턴 매칭
      const matches = expressions[index].match(SIMPLE_EQUALITY_REGEX);
      if (matches) {
        const depIndex = parseInt(matches[1], 10);
        const value = matches[3];
        if (!equalityMap[depIndex]) equalityMap[depIndex] = {};
        if (!(value in equalityMap[depIndex]))
          equalityMap[depIndex][value] = schemaIndices[index];
      } else {
        // 복잡한 표현식은 최적화에서 제외
        isSimpleEquality = false;
        break;
      }
    }

    // 단순 동등성 최적화: 모든 조건이 단순하고 하나의 dependency만 사용하는 경우
    const keys = Object.keys(equalityMap);
    if (isSimpleEquality && keys.length === 1) {
      const dependencyIndex = parseInt(keys[0], 10);
      const valueMap = equalityMap[dependencyIndex];

      // 최적화된 단순 동등성 비교 함수 반환
      return (dependencies: unknown[]) => {
        const value = dependencies[dependencyIndex];
        return typeof value === 'string' && value in valueMap
          ? valueMap[value]
          : -1;
      };
    }

    // 일반적인 조건식 처리: Function 생성자를 통한 동적 함수 생성
    const lines = new Array<string>(expressions.length);
    for (let index = 0; index < expressions.length; index++)
      lines[index] =
        `if(${expressions[index]}) return ${schemaIndices[index]};`;

    return new Function(
      'dependencies',
      `${lines.join('\n')}
    return -1;
  `,
    ) as GetConditionIndex;
  };
