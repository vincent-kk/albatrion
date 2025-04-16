import { falseFunction, trueFunction } from '@winglet/common-utils';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { checkComputedOptionFactory, getWatchValuesFactory } from './utils';

export const computedPropertiesFactory = (
  jsonSchema: JsonSchemaWithVirtual,
  rootJsonSchema: JsonSchemaWithVirtual,
) => {
  const dependencyPaths: string[] = [];

  const visible = jsonSchema?.renderOptions?.visible;
  const isHidden = jsonSchema?.visible === false || visible === false;
  const checkVisible = isHidden
    ? falseFunction
    : checkComputedOptionFactory(dependencyPaths, visible);

  const readOnly = jsonSchema?.renderOptions?.readOnly;
  const isReadOnly =
    rootJsonSchema.readOnly === true ||
    jsonSchema?.readOnly === true ||
    readOnly === true;
  const checkReadOnly = isReadOnly
    ? trueFunction
    : checkComputedOptionFactory(dependencyPaths, readOnly);

  const disabled = jsonSchema?.renderOptions?.disabled;
  const isDisabled =
    rootJsonSchema.disabled === true ||
    jsonSchema?.disabled === true ||
    disabled === true;
  const checkDisabled = isDisabled
    ? trueFunction
    : checkComputedOptionFactory(dependencyPaths, disabled);

  const getWatchValues = getWatchValuesFactory(
    dependencyPaths,
    jsonSchema?.options?.watch,
  );

  return {
    dependencyPaths,
    checkVisible,
    checkReadOnly,
    checkDisabled,
    getWatchValues,
  };
};
