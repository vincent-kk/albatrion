import { isString } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { ALIAS, JSON_PATH_REGEX } from './regex';

type CheckComputedOption = Fn<[dependencies: unknown[]], boolean>;

/**
 * JSON 스키마의 계산된 옵션을 확인하는 함수를 생성합니다.
 *
 * @param jsonSchema - 노드의 JSON 스키마
 * @param rootJsonSchema - 루트 노드의 JSON 스키마
 * @returns 계산된 옵션 팩토리 함수
 */
export const checkComputedOptionFactory =
  (jsonSchema: JsonSchemaWithVirtual, rootJsonSchema: JsonSchemaWithVirtual) =>
  /**
   * 주어진 의존성 경로와 필드명에 대한 조건 확인 함수를 반환합니다.
   *
   * @param dependencyPaths - 의존성 경로 배열
   * @param fieldName - 확인할 필드명
   * @param checkCondition - 확인할 조건 값
   * @returns 계산된 옵션 확인 함수 또는 undefined
   */
  (
    dependencyPaths: string[],
    fieldName: string,
    checkCondition: boolean,
  ): CheckComputedOption | undefined => {
    // `computed.[<fieldName>]` 또는 `&[<fieldName>]` 필드에서 표현식 추출
    const expression =
      jsonSchema?.computed?.[fieldName] ?? jsonSchema?.[`${ALIAS}${fieldName}`];

    // 선호되는 조건이 이미 boolean 값과 일치하는지 확인
    const preferredCondition =
      rootJsonSchema[fieldName] === checkCondition ||
      jsonSchema[fieldName] === checkCondition ||
      expression === checkCondition;

    // 선호되는 조건이 일치하면 고정 함수 반환, 아니면 동적 함수 생성
    return preferredCondition
      ? () => checkCondition
      : createDynamicFunction(dependencyPaths, expression);
  };

/**
 * 의존성 경로와 표현식을 이용해 동적 조건 확인 함수를 생성합니다.
 *
 * @param dependencyPaths - 의존성 경로 배열
 * @param expression - 평가할 표현식
 * @returns 의존성 배열을 매개변수로 받아 조건 결과를 반환하는 함수 또는 undefined
 */
const createDynamicFunction = (
  dependencyPaths: string[],
  expression: string | boolean | undefined,
): CheckComputedOption | undefined => {
  // 문자열이 아닌 표현식은 처리할 수 없음
  if (!isString(expression)) return;

  // JSON 경로를 의존성 배열 참조로 변환
  const computedExpression = expression
    .replace(JSON_PATH_REGEX, (path) => {
      if (!dependencyPaths.includes(path)) dependencyPaths.push(path);
      return `dependencies[${dependencyPaths.indexOf(path)}]`;
    })
    .trim()
    .replace(/;$/, '');

  // 변환 후 빈 표현식이면 함수 생성 불가
  if (computedExpression.length === 0) return;

  // 동적 조건 확인 함수 생성
  return new Function(
    'dependencies',
    `return !!(${computedExpression})`,
  ) as CheckComputedOption;
};
