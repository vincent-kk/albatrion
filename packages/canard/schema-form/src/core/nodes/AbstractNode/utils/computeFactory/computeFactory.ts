import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import {
  checkComputedOptionFactory,
  getConditionIndexFactory,
  getWatchValuesFactory,
} from './utils';

/**
 * 주어진 JSON 스키마로부터 계산된 프로퍼티 관리 함수를 생성합니다.
 * @param jsonSchema - 노드의 JSON 스키마
 * @param rootJsonSchema - 루트 노드의 JSON 스키마
 * @returns 계산된 프로퍼티 함수뤼
 */
export const computeFactory = (
  schema: JsonSchemaWithVirtual,
  rootSchema: JsonSchemaWithVirtual,
) => {
  const checkComputedOption = checkComputedOptionFactory(schema, rootSchema);
  const getConditionIndex = getConditionIndexFactory(schema);

  const dependencyPaths: string[] = [];

  const visible = checkComputedOption(dependencyPaths, 'visible', false);

  const readOnly = checkComputedOption(dependencyPaths, 'readOnly', true);

  const disabled = checkComputedOption(dependencyPaths, 'disabled', true);

  const oneOfIndex = getConditionIndex(dependencyPaths, 'oneOf');

  const watchValues = getWatchValuesFactory(
    dependencyPaths,
    schema?.computed?.watch ?? schema?.['&watch'],
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
