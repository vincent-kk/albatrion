import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { checkComputedOptionFactory } from './utils/checkComputedOptionFactory';
import {
  getConditionIndexFactory,
  getConditionIndicesFactory,
} from './utils/getConditionIndexFactory';
import { getObservedValuesFactory } from './utils/getObservedValuesFactory';
import { getPathManager } from './utils/getPathManager';

/**
 * Creates computed property management functions from the given JSON schema.
 * @param jsonSchema - Node's JSON schema
 * @param rootJsonSchema - Root node's JSON schema
 * @returns Computed property functions
 */
export const computeFactory = (
  schema: JsonSchemaWithVirtual,
  rootSchema: JsonSchemaWithVirtual,
) => {
  const checkComputedOption = checkComputedOptionFactory(schema, rootSchema);
  const getConditionIndex = getConditionIndexFactory(schema);
  const getConditionIndices = getConditionIndicesFactory(schema);
  const getObservedValues = getObservedValuesFactory(schema);
  const pathManager = getPathManager();
  return {
    /** List of paths to dependencies */
    dependencyPaths: pathManager.get(),
    /**
     * Calculate whether the node is active
     * @param dependencies - List of dependencies
     * @returns Whether the node is active
     */
    active: checkComputedOption(pathManager, 'active'),
    /**
     * Calculate whether the node is visible
     * @param dependencies - List of dependencies
     * @returns Whether the node is visible
     */
    visible: checkComputedOption(pathManager, 'visible'),
    /**
     * Calculate whether the node is read only
     * @param dependencies - List of dependencies
     * @returns Whether the node is read only
     */
    readOnly: checkComputedOption(pathManager, 'readOnly'),
    /**
     * Calculate whether the node is disabled
     * @param dependencies - List of dependencies
     * @returns Whether the node is disabled
     */
    disabled: checkComputedOption(pathManager, 'disabled'),
    /**
     * Calculate the index of the oneOf branch
     * @param dependencies - List of dependencies
     * @returns Index of the oneOf branch
     */
    oneOfIndex: getConditionIndex(pathManager, 'oneOf', 'if'),
    /**
     * Calculate the indices of the anyOf branches
     * @param dependencies - List of dependencies
     * @returns Indices of the anyOf branches
     */
    anyOfIndices: getConditionIndices(pathManager, 'anyOf', 'if'),
    /**
     * Calculate the list of values to watch
     * @param dependencies - List of dependencies
     * @returns List of values to watch
     */
    watchValues: getObservedValues(pathManager, 'watch'),
  };
};
