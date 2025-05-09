import { falseFunction, trueFunction } from '@winglet/common-utils';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import {
  checkComputedOptionFactory,
  getOneOfIndexFactory,
  getWatchValuesFactory,
} from './utils';

/**
 * 주어진 JSON 스키마로부터 계산된 프로퍼티 관리 함수를 생성합니다.
 * @param jsonSchema - 노드의 JSON 스키마
 * @param rootJsonSchema - 루트 노드의 JSON 스키마
 * @returns 계산된 프로퍼티 함수뤼
 */
export const computeFactory = (
  jsonSchema: JsonSchemaWithVirtual,
  rootJsonSchema: JsonSchemaWithVirtual,
) => {
  const dependencyPaths: string[] = [];

  const computedVisible =
    jsonSchema?.computed?.visible ?? jsonSchema?.['&visible'];
  const isHidden = jsonSchema?.visible === false || computedVisible === false;
  const visible = isHidden
    ? falseFunction
    : checkComputedOptionFactory(dependencyPaths, computedVisible);

  const computedReadOnly =
    jsonSchema?.computed?.readOnly ?? jsonSchema?.['&readOnly'];
  const isReadOnly =
    rootJsonSchema.readOnly === true ||
    jsonSchema?.readOnly === true ||
    computedReadOnly === true;
  const readOnly = isReadOnly
    ? trueFunction
    : checkComputedOptionFactory(dependencyPaths, computedReadOnly);

  const computedDisabled =
    jsonSchema?.computed?.disabled ?? jsonSchema?.['&disabled'];
  const isDisabled =
    rootJsonSchema.disabled === true ||
    jsonSchema?.disabled === true ||
    computedDisabled === true;
  const disabled = isDisabled
    ? trueFunction
    : checkComputedOptionFactory(dependencyPaths, computedDisabled);

  const oneOfIndex = getOneOfIndexFactory(dependencyPaths, jsonSchema);

  const watchValues = getWatchValuesFactory(
    dependencyPaths,
    jsonSchema?.computed?.watch ?? jsonSchema?.['&watch'],
  );

  return {
    dependencyPaths,
    visible,
    readOnly,
    disabled,
    oneOfIndex,
    watchValues,
  };
};
