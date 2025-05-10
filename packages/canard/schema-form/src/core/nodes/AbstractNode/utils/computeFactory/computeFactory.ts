import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import {
  checkComputedOptionFactory,
  getConditionIndexFactory,
  getObservedValuesFactory,
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
  const getObservedValues = getObservedValuesFactory(schema);
  const dependencyPaths: string[] = [];
  return {
    dependencyPaths,
    visible: checkComputedOption(dependencyPaths, 'visible', false),
    readOnly: checkComputedOption(dependencyPaths, 'readOnly', true),
    disabled: checkComputedOption(dependencyPaths, 'disabled', true),
    oneOfIndex: getConditionIndex(dependencyPaths, 'oneOf'),
    watchValues: getObservedValues(dependencyPaths, 'watch'),
  };
};
