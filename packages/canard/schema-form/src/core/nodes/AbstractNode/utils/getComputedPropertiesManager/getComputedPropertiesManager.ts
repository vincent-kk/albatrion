import type {
  JsonSchemaType,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

import {
  type ComputedProperties,
  ComputedPropertiesManager,
} from './ComputedPropertiesManager';
import { needsRealComputedManager } from './utils/needsRealComputedManager';
import { sharedComputedSentinel } from './utils/sharedComputedSentinel';

/**
 * Returns a node's `ComputedProperties`: a real `ComputedPropertiesManager`
 * when the schema declares any computed surface, otherwise the shared frozen
 * `sharedComputedSentinel` (skips per-node allocation for plain fields).
 * @remarks Gate details in `needsRealComputedManager`; see INTENT.md.
 */
export const getComputedPropertiesManager = (
  schemaType: JsonSchemaType,
  jsonSchema: JsonSchemaWithVirtual,
  rootJsonSchema: JsonSchemaWithVirtual,
): ComputedProperties =>
  needsRealComputedManager(schemaType, jsonSchema, rootJsonSchema)
    ? new ComputedPropertiesManager(schemaType, jsonSchema, rootJsonSchema)
    : sharedComputedSentinel;
