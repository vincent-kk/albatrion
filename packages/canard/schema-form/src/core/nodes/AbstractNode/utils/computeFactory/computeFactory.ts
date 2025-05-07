import { falseFunction, trueFunction } from '@winglet/common-utils';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import {
  checkComputedOptionFactory,
  getOneOfIndexFactory,
  getWatchValuesFactory,
} from './utils';

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
