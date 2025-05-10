import { isArray, isString } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

type GetWatchValues = Fn<[dependencies: unknown[]], unknown[]>;

/**
 * 의존성 경로와 watchValue paths를 받아 watchValues를 반환하는 함수를 생성합니다.
 * @param dependencyPaths - 의존성 경로 배열
 * @param watch - watchValue paths
 * @returns watchValue를 반환하는 함수 또는 undefined
 */
export const getObservedValuesFactory =
  (schema: JsonSchemaWithVirtual) =>
  (
    dependencyPaths: string[],
    fieldName: string,
  ): GetWatchValues | undefined => {
    const watch = schema?.computed?.[fieldName] ?? schema?.[`&${fieldName}`];
    if (!watch || !(isString(watch) || isArray(watch))) return;
    const watchValues = isArray(watch) ? watch : [watch];
    const watchValueIndexes = [] as number[];
    for (let i = 0; i < watchValues.length; i++) {
      const path = watchValues[i];
      if (!dependencyPaths.includes(path)) dependencyPaths.push(path);
      watchValueIndexes.push(dependencyPaths.indexOf(path));
    }
    if (watchValueIndexes.length === 0) return;
    return new Function(
      'dependencies',
      `const result = [];
     const indexes = [${watchValueIndexes.join(',')}];
     for (let i = 0; i < indexes.length; i++)
       result.push(dependencies[indexes[i]]);
     return result;`,
    ) as GetWatchValues;
  };
