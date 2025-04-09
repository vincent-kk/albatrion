import { isString } from '@winglet/common-utils';
import { JSONPath } from '@winglet/json-schema';

import type { Fn } from '@aileron/types';

const JSON_PATH_REGEX = new RegExp(
  `[\\${JSONPath.Root}\\${JSONPath.Current}]\\${JSONPath.Child}([a-zA-Z0-9]+(\\${JSONPath.Child}[a-zA-Z0-9]+)*)`,
  'g',
);

type CheckComputedOption = Fn<[dependencies: any[]], boolean>;

/**
 * jsonPath 표현식을 확인하는 함수를 생성합니다.
 * @param dependencyPaths - 의존성 경로 배열
 * @param expression - 평가할 표현식
 * @returns 의존성 배열을 매개변수로 받는 함수 또는 undefined
 */
export const checkComputedOptionFactory = (
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
