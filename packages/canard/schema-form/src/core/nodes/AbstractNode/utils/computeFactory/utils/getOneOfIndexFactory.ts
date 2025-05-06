import { isArray } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { JsonSchema } from '@/schema-form/types';

import { JSON_PATH_REGEX } from './regex';

export type GetOneOf = Fn<[dependencies: unknown[]], number | null>;

const SIMPLE_EQUALITY_REGEX =
  /^\s*dependencies\[(\d+)\]\s*===\s*(['"])([^'"]+)\2\s*$/;

export const getOneOfIndexFactory = (
  dependencyPaths: string[],
  jsonSchema: JsonSchema,
): GetOneOf | undefined => {
  if (jsonSchema.type !== 'object' || !isArray(jsonSchema.oneOf))
    return undefined;

  const oneOfSchemas = jsonSchema.oneOf;
  const expressions: string[] = [];
  const schemaIndices: number[] = [];

  // 유효한 표현식만 수집하고 원래 스키마 인덱스 유지
  for (let index = 0; index < oneOfSchemas.length; index++) {
    const condition =
      oneOfSchemas[index]?.computed?.if ?? oneOfSchemas[index]?.['&if'];

    if (typeof condition === 'boolean') {
      if (condition === true) {
        expressions.push('true');
        schemaIndices.push(index);
      }
      continue;
    }

    const expression = condition?.trim?.();
    if (!expression || typeof expression !== 'string') continue;
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
    const matches = expressions[index].match(SIMPLE_EQUALITY_REGEX);
    if (matches) {
      const depIndex = parseInt(matches[1], 10);
      const value = matches[3];
      if (!equalityMap[depIndex]) equalityMap[depIndex] = {};
      equalityMap[depIndex][value] = schemaIndices[index];
    } else {
      isSimpleEquality = false;
      break;
    }
  }

  // 단순 동등성 최적화: 모든 조건이 단순하고 하나의 dependency만 사용하는 경우
  const keys = Object.keys(equalityMap);
  if (isSimpleEquality && keys.length === 1) {
    const dependencyIndex = parseInt(keys[0], 10);
    const valueMap = equalityMap[dependencyIndex];
    return (dependencies: unknown[]) => {
      const value = dependencies[dependencyIndex];
      return typeof value === 'string' && value in valueMap
        ? valueMap[value]
        : -1;
    };
  }

  const lines = new Array<string>(expressions.length);
  for (let index = 0; index < expressions.length; index++)
    lines[index] = `if(${expressions[index]}) return ${schemaIndices[index]};`;

  return new Function(
    'dependencies',
    `${lines.join('\n')}
    return -1;
  `,
  ) as GetOneOf;
};
