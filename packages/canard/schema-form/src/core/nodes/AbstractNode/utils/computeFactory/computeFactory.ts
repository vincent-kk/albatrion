import { falseFunction, trueFunction } from '@winglet/common-utils';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { checkComputedOptionFactory, getWatchValuesFactory } from './utils';

export const computeFactory = (
  jsonSchema: JsonSchemaWithVirtual,
  rootJsonSchema: JsonSchemaWithVirtual,
) => {
  const dependencyPaths: string[] = [];

  const renderVisible = jsonSchema?.renderOptions?.visible;
  const isHidden = jsonSchema?.visible === false || renderVisible === false;
  const visible = isHidden
    ? falseFunction
    : checkComputedOptionFactory(dependencyPaths, renderVisible);

  const renderReadOnly = jsonSchema?.renderOptions?.readOnly;
  const isReadOnly =
    rootJsonSchema.readOnly === true ||
    jsonSchema?.readOnly === true ||
    renderReadOnly === true;
  const readOnly = isReadOnly
    ? trueFunction
    : checkComputedOptionFactory(dependencyPaths, renderReadOnly);

  const renderDisabled = jsonSchema?.renderOptions?.disabled;
  const isDisabled =
    rootJsonSchema.disabled === true ||
    jsonSchema?.disabled === true ||
    renderDisabled === true;
  const disabled = isDisabled
    ? trueFunction
    : checkComputedOptionFactory(dependencyPaths, renderDisabled);

  const watchValues = getWatchValuesFactory(
    dependencyPaths,
    jsonSchema?.options?.watch,
  );

  return {
    dependencyPaths,
    visible,
    readOnly,
    disabled,
    watchValues,
  };
};
