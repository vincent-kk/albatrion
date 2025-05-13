import { isArray, isString } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { ALIAS } from './regex';

type GetObservedValues = Fn<[dependencies: unknown[]], unknown[]>;

/**
 * JSON 스키마의 특정 필드에 대한 관찰값 계산 함수를 생성합니다.
 *
 * @param schema - JSON 스키마
 * @returns 관찰값 팩토리 함수
 */
export const getObservedValuesFactory =
  (schema: JsonSchemaWithVirtual) =>
  /**
   * 주어진 의존성 경로와 필드명으로 관찰값 계산 함수를 반환합니다.
   *
   * @param dependencyPaths - 의존성 경로 배열
   * @param fieldName - 관찰할 필드명
   * @returns 의존성 배열로부터 관찰값 배열을 반환하는 함수 또는 undefined
   */
  (
    dependencyPaths: string[],
    fieldName: string,
  ): GetObservedValues | undefined => {
    // `computed.[<fieldName>]` 또는 `&[<fieldName>]` 필드에서 표현식 추출
    const watch =
      schema?.computed?.[fieldName] ?? schema?.[`${ALIAS}${fieldName}`];

    // 유효한 watch 값이 없으면 undefined 반환
    if (!watch || !(isString(watch) || isArray(watch))) return;

    // 단일 watch 값은 배열로 변환하여 처리
    const watchValues = isArray(watch) ? watch : [watch];
    const watchValueIndexes = [] as number[];

    // 각 watch 경로를 dependencyPaths에 추가하고 인덱스 저장
    for (let i = 0; i < watchValues.length; i++) {
      const path = watchValues[i];
      if (!dependencyPaths.includes(path)) dependencyPaths.push(path);
      watchValueIndexes.push(dependencyPaths.indexOf(path));
    }

    if (watchValueIndexes.length === 0) return;

    // 관찰값 계산 함수 동적 생성
    return new Function(
      'dependencies',
      `const result = [];
     const indexes = [${watchValueIndexes.join(',')}];
     for (let i = 0; i < indexes.length; i++)
       result[result.length] = dependencies[indexes[i]];
     return result;`,
    ) as GetObservedValues;
  };
