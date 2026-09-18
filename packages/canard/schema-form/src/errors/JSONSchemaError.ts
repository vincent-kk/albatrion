import { BaseError, type ErrorDetails } from '@winglet/common-utils/error';

/**
 * Error class for json schema errors.
 *
 * Thrown during the process of building the schema node tree from JSON Schema definitions.
 * These errors indicate structural issues or invalid configurations in the schema.
 *
 * Common error scenarios:
 * - Unknown or unsupported JSON Schema types
 * - Invalid oneOf schema configurations (type or property redefinitions)
 * - Virtual field configuration errors
 * - Virtual fields referencing non-existent properties
 *
 * @remarks
 * Error details typically include:
 * - jsonSchema: The problematic schema definition
 * - path: Path to the node in the schema tree
 * - type/oneOfType: Type information for type-related errors
 * - property: Property name for property-related errors
 * - nodeKey/nodeValue: Node information for virtual field errors
 * - notFoundFields: List of missing fields for virtual field validation
 */
export class JSONSchemaError extends BaseError {
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('JSON_SCHEMA_ERROR', code, message, details);
    this.name = 'JSONSchemaError';
  }
}

/**
 * Type guard to check if an error is a JSONSchemaError instance.
 *
 * @param error - Error object to check
 * @returns Whether the error is a JSONSchemaError instance
 */
export const isJSONSchemaError = (error: unknown): error is JSONSchemaError =>
  error instanceof JSONSchemaError;
