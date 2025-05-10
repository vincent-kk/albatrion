import { isString } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { JSON_PATH_REGEX } from './regex';

type CheckComputedOption = Fn<[dependencies: unknown[]], boolean>;

/**
 * 주어진 JSON 스키마에서 계산된 옵션을 확인하는 함수를 생성합니다.
 * @param jsonSchema - 노드의 JSON 스키마
 * @param rootJsonSchema - 루트 노드의 JSON 스키마
 * @returns 계산된 옵션 함수 또는 undefined
 */
export const checkComputedOptionFactory =
  (jsonSchema: JsonSchemaWithVirtual, rootJsonSchema: JsonSchemaWithVirtual) =>
  (
    dependencyPaths: string[],
    fieldName: string,
    checkCondition: boolean,
  ): CheckComputedOption | undefined => {
    const expression =
      jsonSchema?.computed?.[fieldName] ?? jsonSchema?.[`&${fieldName}`];
    const preferredCondition =
      rootJsonSchema[fieldName] === checkCondition ||
      jsonSchema[fieldName] === checkCondition ||
      expression === checkCondition;
    return preferredCondition
      ? () => checkCondition
      : createDynamicFunction(dependencyPaths, expression);
  };

/**
 * jsonPath 표현식을 확인하는 함수를 생성합니다.
 * @param dependencyPaths - 의존성 경로 배열
 * @param expression - 평가할 표현식
 * @returns 의존성 배열을 매개변수로 받는 함수 또는 undefined
 */
const createDynamicFunction = (
  dependencyPaths: string[],
  expression: string | boolean | undefined,
): CheckComputedOption | undefined => {
  if (!isString(expression)) return;
  const computedExpression = expression
    .replace(JSON_PATH_REGEX, (path) => {
      if (!dependencyPaths.includes(path)) dependencyPaths.push(path);
      return `dependencies[${dependencyPaths.indexOf(path)}]`;
    })
    .trim()
    .replace(/;$/, '');
  if (computedExpression.length === 0) return;
  return new Function(
    'dependencies',
    `return !!(${computedExpression})`,
  ) as CheckComputedOption;
};
