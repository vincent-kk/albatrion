import { PluginManager } from '@/schema-form/app/plugin';
import type { ValidationMode } from '@/schema-form/core/nodes/type';
import { JsonSchemaError } from '@/schema-form/errors';
import {
  formatCircularReferenceError,
  transformErrors,
} from '@/schema-form/helpers/error';
import { stripSchemaExtensions } from '@/schema-form/helpers/jsonSchema';
import type {
  ValidateFunction,
  JsonSchemaError as ValidationError,
  ValidatorFactory,
} from '@/schema-form/types';

import type { AbstractNode } from '../../AbstractNode';
import { getFallbackValidator } from './utils/getFallbackValidator';
import { matchesSchemaPath } from './utils/matchesSchemaPath';

/**
 * Manages validation logic for schema form nodes.
 *
 * @description
 * `ValidationManager` handles the compilation and execution of JSON Schema validators
 * for form nodes. It integrates with the plugin system to use registered validators
 * and distributes validation errors to the appropriate child nodes based on their data paths.
 *
 * Key responsibilities:
 * - Compiles JSON Schema into a validator function during initialization
 * - Executes validation against form values
 * - Distributes errors to corresponding child nodes by data path
 * - Handles circular reference errors gracefully with fallback validators
 * - Clears stale errors from nodes that no longer have validation issues
 *
 * @example
 * ```typescript
 * // ValidationManager is typically created internally by AbstractNode
 * const manager = new ValidationManager(node, validatorFactory, 'OnChange');
 *
 * // Check if validation is enabled
 * if (manager.enabled) {
 *   await manager.validate(formValue);
 * }
 * ```
 */
export class ValidationManager {
  /** @internal Reference to the host node that owns this manager */
  private __host__: AbstractNode;

  /** @internal Compiled validator function from JSON Schema */
  private __validator__: ValidateFunction | undefined;

  /**
   * Indicates whether validation is enabled for this manager.
   * @description `true` if a validator was successfully compiled, `false` otherwise.
   * @readonly
   */
  public readonly enabled: boolean = false;

  /** @internal Tracks data paths that had errors in the previous validation run */
  private __errorDataPaths__: string[] | undefined;

  /**
   * Creates a ValidationManager instance.
   *
   * @param host - The AbstractNode that owns this validation manager
   * @param validatorFactory - Optional factory function to create custom validators
   * @param validationMode - The validation mode (OnChange, OnRequest, None). If undefined, validation is disabled.
   *
   * @description
   * The constructor performs the following:
   * 1. If `validationMode` is falsy, validation remains disabled
   * 2. Strips schema extensions (computed, formType, etc.) before compilation
   * 3. Attempts to compile the schema using the provided factory or the plugin's validator
   * 4. On circular reference errors, creates a fallback validator that returns the error
   *
   * @example
   * ```typescript
   * // With custom validator factory
   * const manager = new ValidationManager(
   *   node,
   *   (schema) => ajv.compile(schema),
   *   'OnChange'
   * );
   *
   * // Using plugin validator
   * const manager = new ValidationManager(node, undefined, 'OnRequest');
   * ```
   */
  constructor(
    host: AbstractNode,
    validatorFactory: ValidatorFactory | undefined,
    validationMode: ValidationMode | undefined,
  ) {
    this.__host__ = host;

    if (!validationMode) return;
    const jsonSchema = host.jsonSchema;
    const schema = stripSchemaExtensions(jsonSchema);
    try {
      this.__validator__ =
        validatorFactory?.(schema) || PluginManager.validator?.compile(schema);
      this.enabled = this.__validator__ !== undefined;
    } catch (error: any) {
      const jsonSchemaError = new JsonSchemaError(
        'CIRCULAR_REFERENCE',
        formatCircularReferenceError(error.message, jsonSchema),
        { error, schema: jsonSchema },
      );
      this.__validator__ = getFallbackValidator(jsonSchemaError, jsonSchema);
      console.error(jsonSchemaError);
    }
  }

  /**
   * Executes the validator against the provided value.
   *
   * @param value - The value to validate
   * @returns A promise that resolves to an array of validation errors, or empty array if valid
   *
   * @internal
   */
  private async __validate__(
    this: ValidationManager,
    value: any,
  ): Promise<ValidationError[]> {
    if (this.__validator__ === undefined) return [];
    const errors = await this.__validator__(value);
    if (errors === null) return [];
    else return transformErrors(errors);
  }

  /**
   * Validates the form value and distributes errors to child nodes.
   *
   * @param value - The form value to validate (typically the root node's enhancedValue)
   *
   * @description
   * This method performs full form validation and error distribution:
   *
   * 1. **Guard checks**: Only runs on root nodes with validation enabled
   * 2. **Validation execution**: Runs the compiled validator against the value
   * 3. **Global error handling**: Delegates to host's global error handler first
   * 4. **Error grouping**: Groups errors by their data path (JSONPointer)
   * 5. **Stale error cleanup**: Clears errors from nodes that no longer have issues
   * 6. **Error distribution**: Sets errors on each child node matching the data path
   * 7. **Schema path filtering**: For variant nodes, filters errors by schema path match
   *
   * @example
   * ```typescript
   * // Trigger validation on form submit
   * const rootNode = form.getNode();
   * await rootNode.validationManager.validate(rootNode.enhancedValue);
   *
   * // Check for errors after validation
   * const hasErrors = rootNode.errors.length > 0;
   * ```
   *
   * @remarks
   * - This method is async and should be awaited
   * - Errors are distributed to nodes found via `host.find(dataPath)`
   * - Nodes not found in the tree will have their errors silently ignored
   * - Previous error paths are tracked to clear stale errors on re-validation
   */
  public async validate(this: ValidationManager, value: any) {
    if (this.__host__.isRoot === false || this.enabled === false) return;

    const internalErrors = await this.__validate__(value);

    // @ts-expect-error [internal] __setGlobalErrors__ is protected
    if (this.__host__.__setGlobalErrors__(internalErrors)) return;

    const errorsByDataPath = new Map<
      ValidationError['dataPath'],
      ValidationError[]
    >();
    for (const error of internalErrors) {
      const errors = errorsByDataPath.get(error.dataPath);
      if (errors) errors.push(error);
      else errorsByDataPath.set(error.dataPath, [error]);
    }

    const errorDataPaths = Array.from(errorsByDataPath.keys());
    if (this.__errorDataPaths__)
      for (const dataPath of this.__errorDataPaths__) {
        if (errorDataPaths.includes(dataPath)) continue;
        this.__host__.find(dataPath)?.clearErrors();
      }

    for (const [dataPath, errors] of errorsByDataPath) {
      const childNode = this.__host__.find(dataPath);
      if (childNode === null) continue;
      childNode.setErrors(
        childNode.variant !== undefined
          ? errors.filter(
              (error) =>
                error.schemaPath === undefined ||
                matchesSchemaPath(error.schemaPath, childNode.schemaPath),
            )
          : errors,
      );
    }
    this.__errorDataPaths__ = errorDataPaths;
  }
}
