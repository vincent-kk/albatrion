import { equals } from '@winglet/common-utils/object';

import type { JsonSchemaError as ValidationError } from '@/schema-form/types';

const RECURSIVE_ERROR_OMITTED_KEYS = new Set(['key']);

/**
 * Manages error state for schema form nodes.
 *
 * @description
 * `ValidationErrorManager` handles pure error state management for form nodes,
 * including local errors, global errors, and external errors from server-side
 * validation. It manages error storage and merging logic.
 *
 * Key responsibilities:
 * - Local error state management
 * - Global error state management (root node only)
 * - External error state management
 * - Error merging logic
 *
 * Note: Event publishing and node tree logic (isRoot, rootNode) are handled
 * by AbstractNode, not by this manager.
 *
 * @example
 * ```typescript
 * // ValidationErrorManager is typically created internally by AbstractNode
 * const manager = new ValidationErrorManager();
 *
 * // Set local errors (returns true if changed)
 * if (manager.setLocalErrors([{ message: 'Required field', dataPath: '/name' }])) {
 *   // Publish event in AbstractNode
 * }
 * ```
 */
export class ValidationErrorManager {
  /**
   * All validation errors from the most recent schema validation.
   * @remarks **[Root Node Only]** Contains raw errors from the validator before
   *          merging with external errors.
   */
  private __globalErrors__: ValidationError[] | undefined;

  /**
   * Validation errors specific to this node from the root's validation.
   * @note Filtered subset of globalErrors matching this node's dataPath.
   */
  private __localErrors__: ValidationError[] | undefined;

  /**
   * Combined array of internal schema errors and external errors.
   * @note Only used by root node. Represents all errors across the entire form.
   */
  public mergedGlobalErrors: ValidationError[] = [];

  /**
   * Combined array of local validation errors and external errors for this node.
   * @note This is the primary error array exposed via the `errors` getter.
   */
  public mergedLocalErrors: ValidationError[] = [];

  /**
   * Errors provided externally (e.g., from server-side validation).
   * @note External errors are merged with local errors but tracked separately
   *       for independent clearing via clearExternalErrors().
   */
  public externalErrors: ValidationError[] = [];

  /**
   * Sets global errors and merges with external errors.
   * @param errors - List of errors to set
   * @returns true if errors changed, false otherwise
   */
  public setGlobalErrors(errors: ValidationError[]): boolean {
    if (equals(this.__globalErrors__, errors)) return true;
    this.__globalErrors__ = errors;
    this.mergedGlobalErrors = [
      ...this.externalErrors,
      ...this.__globalErrors__,
    ];
    return false;
  }

  /**
   * Sets local errors and merges with external errors.
   * @param errors - List of errors to set
   * @returns true if errors changed, false otherwise
   */
  public setLocalErrors(errors: ValidationError[]): boolean {
    if (equals(this.__localErrors__, errors)) return true;
    this.__localErrors__ = errors;
    this.mergedLocalErrors = [...this.externalErrors, ...this.__localErrors__];
    return false;
  }

  /**
   * Sets external errors and merges with local/global errors.
   * @param errors - List of received errors
   * @returns true if errors changed, false otherwise
   */
  public setExternalErrors(
    errors: ValidationError[] = [],
    isRoot: boolean,
  ): boolean {
    if (equals(this.externalErrors, errors, RECURSIVE_ERROR_OMITTED_KEYS))
      return true;

    this.externalErrors = new Array<ValidationError>(errors.length);
    for (let i = 0, l = errors.length; i < l; i++)
      this.externalErrors[i] = { ...errors[i], key: i };

    this.mergedLocalErrors = this.__localErrors__
      ? [...this.externalErrors, ...this.__localErrors__]
      : this.externalErrors;

    if (isRoot)
      this.mergedGlobalErrors = this.__globalErrors__
        ? [...this.externalErrors, ...this.__globalErrors__]
        : this.externalErrors;

    return false;
  }

  /**
   * Filters out specific errors from external errors.
   * @param errors - List of errors to remove
   * @returns The filtered errors array if changed, null otherwise
   */
  public filterExternalErrors(
    errors: ValidationError[],
  ): ValidationError[] | null {
    const deleteKeys: Array<number> = [];
    for (let i = 0, l = errors.length; i < l; i++) {
      const error = errors[i];
      if (typeof error.key === 'number') deleteKeys.push(error.key);
    }
    const currentErrors = this.externalErrors;
    const nextErrors: ValidationError[] = [];
    for (let i = 0, l = currentErrors.length; i < l; i++) {
      const error = currentErrors[i];
      if (!error.key || !deleteKeys.includes(error.key)) nextErrors.push(error);
    }
    if (currentErrors.length !== nextErrors.length) return nextErrors;
    return null;
  }
}
