import { falseFunction, trueFunction } from '@winglet/common-utils';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { checkComputedOptionFactory, getWatchValuesFactory } from './utils';

export const computeFactory = (
  jsonSchema: JsonSchemaWithVirtual,
  rootJsonSchema: JsonSchemaWithVirtual,
) => {
  const dependencyPaths: string[] = [];

  const computedVisible = jsonSchema?.computed?.visible;
  const isHidden = jsonSchema?.visible === false || computedVisible === false;
  const visible = isHidden
    ? falseFunction
    : checkComputedOptionFactory(dependencyPaths, computedVisible);

  const computedReadOnly = jsonSchema?.computed?.readOnly;
  const isReadOnly =
    rootJsonSchema.readOnly === true ||
    jsonSchema?.readOnly === true ||
    computedReadOnly === true;
  const readOnly = isReadOnly
    ? trueFunction
    : checkComputedOptionFactory(dependencyPaths, computedReadOnly);

  const computedDisabled = jsonSchema?.computed?.disabled;
  const isDisabled =
    rootJsonSchema.disabled === true ||
    jsonSchema?.disabled === true ||
    computedDisabled === true;
  const disabled = isDisabled
    ? trueFunction
    : checkComputedOptionFactory(dependencyPaths, computedDisabled);

  const watchValues = getWatchValuesFactory(
    dependencyPaths,
    jsonSchema?.computed?.watch,
  );

  return {
    dependencyPaths,
    visible,
    readOnly,
    disabled,
    watchValues,
  };
};
