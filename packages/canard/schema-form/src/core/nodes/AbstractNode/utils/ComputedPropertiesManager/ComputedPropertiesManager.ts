import type {
  JsonSchemaType,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

import { checkComputedOptionFactory } from './utils/checkComputedOptionFactory';
import {
  getConditionIndexFactory,
  getConditionIndicesFactory,
} from './utils/getConditionIndexFactory';
import { getDerivedValueFactory } from './utils/getDerivedValueFactory';
import { getObservedValuesFactory } from './utils/getObservedValuesFactory';
import { getPathManager } from './utils/getPathManager';
import type { DynamicFunction } from './utils/type';

/**
 * Manages dynamic properties based on the `computed` attribute of JSON Schema.
 *
 * @description
 * `ComputedPropertiesManager` parses the `computed` attribute defined in JSON Schema
 * to manage dynamic node states (visible, active, readOnly, disabled, etc.).
 * It tracks dependency paths and recalculates each property when dependency values change.
 *
 * @example
 * ```typescript
 * // Define computed properties in JSON Schema
 * const schema = {
 *   type: 'string',
 *   computed: {
 *     visible: '../category === "premium"',
 *     readOnly: '../locked === true',
 *     watch: ['../status', '../price'],
 *   }
 * };
 *
 * // Create and use the manager
 * const manager = new ComputedPropertiesManager(type, schema, rootSchema);
 * manager.recalculate(dependencyValues);
 * console.log(manager.visible); // Result of condition evaluation
 * ```
 *
 * @see {@link https://json-schema.org/understanding-json-schema/ JSON Schema}
 */
export class ComputedPropertiesManager {
  /**
   * The active state of the node.
   * @description Result of evaluating the `computed.active` expression. When `false`, the node is treated as inactive.
   * @default true
   */
  public active: boolean = true;

  /**
   * The visibility state of the node.
   * @description Result of evaluating the `computed.visible` expression. When `false`, the node is hidden in the UI.
   * @default true
   */
  public visible: boolean = true;

  /**
   * The read-only state of the node.
   * @description Result of evaluating the `computed.readOnly` expression. When `true`, the node value cannot be modified.
   * @default false
   */
  public readOnly: boolean = false;

  /**
   * The disabled state of the node.
   * @description Result of evaluating the `computed.disabled` expression. When `true`, the node is disabled in the UI.
   * @default false
   */
  public disabled: boolean = false;

  /**
   * The currently selected index in oneOf conditions.
   * @description The index of the first `oneOf[n]['&if']` condition that evaluates to `true`.
   * @default -1 (no matching condition)
   */
  public oneOfIndex: number = -1;

  /**
   * List of matching indices in anyOf conditions.
   * @description An array of all indices where `anyOf[n]['&if']` conditions evaluate to `true`.
   * @default []
   */
  public anyOfIndices: number[] = [];

  /**
   * Array of watched dependency values.
   * @description Current values of paths specified in the `computed.watch` array.
   * @default []
   */
  public watchValues: any[] = [];

  /**
   * List of all dependency paths referenced by computed properties.
   * @description An array of paths in JSONPointer format. Recalculation is needed when values at these paths change.
   * @readonly
   */
  public readonly dependencyPaths: string[];

  /**
   * Function to calculate derived values.
   * @description Evaluates the `computed.derived` expression to return the node's derived value.
   * @readonly
   */
  public readonly getDerivedValue: DynamicFunction<any> | undefined;

  /**
   * Function to calculate pristine state.
   * @description Evaluates the `computed.pristine` expression to return whether the node is in its initial state.
   * @readonly
   */
  public readonly getPristine: DynamicFunction<boolean> | undefined;

  /** @internal Internal function to calculate active state */
  private __active__: DynamicFunction<boolean> | undefined;

  /** @internal Internal function to calculate visible state */
  private __visible__: DynamicFunction<boolean> | undefined;

  /** @internal Internal function to calculate readOnly state */
  private __readOnly__: DynamicFunction<boolean> | undefined;

  /** @internal Internal function to calculate disabled state */
  private __disabled__: DynamicFunction<boolean> | undefined;

  /** @internal Internal function to calculate oneOfIndex */
  private __oneOfIndex__: DynamicFunction<number> | undefined;

  /** @internal Internal function to calculate anyOfIndices */
  private __anyOfIndices__: DynamicFunction<number[]> | undefined;

  /** @internal Internal function to calculate watchValues */
  private __watchValues__: DynamicFunction<any[]> | undefined;

  /**
   * Creates a ComputedPropertiesManager instance.
   *
   * @param type - The JSON Schema type of the node (string, number, object, etc.)
   * @param schema - The JSON Schema containing computed property definitions
   * @param rootSchema - The root schema (used for reference resolution)
   *
   * @description
   * The constructor performs the following operations:
   * 1. Parses the schema's computed properties to create dynamic functions for each
   * 2. Collects all dependency paths and stores them in `dependencyPaths`
   * 3. Processes `&if` conditions in oneOf/anyOf to support conditional schemas
   *
   * @example
   * ```typescript
   * const manager = new ComputedPropertiesManager(
   *   'string',
   *   {
   *     type: 'string',
   *     computed: {
   *       visible: '../showField === true',
   *       disabled: '../isLocked',
   *     }
   *   },
   *   rootSchema
   * );
   * ```
   */
  constructor(
    type: JsonSchemaType,
    schema: JsonSchemaWithVirtual,
    rootSchema: JsonSchemaWithVirtual,
  ) {
    const checkComputedOption = checkComputedOptionFactory(schema, rootSchema);
    const getConditionIndex = getConditionIndexFactory(type, schema);
    const getConditionIndices = getConditionIndicesFactory(type, schema);
    const getObservedValues = getObservedValuesFactory(schema);
    const getDerivedValue = getDerivedValueFactory(schema);
    const pathManager = getPathManager();

    this.dependencyPaths = pathManager.get();
    this.getDerivedValue = getDerivedValue(pathManager, 'derived');
    this.getPristine = checkComputedOption(pathManager, 'pristine');

    this.__active__ = checkComputedOption(pathManager, 'active');
    this.__visible__ = checkComputedOption(pathManager, 'visible');
    this.__readOnly__ = checkComputedOption(pathManager, 'readOnly');
    this.__disabled__ = checkComputedOption(pathManager, 'disabled');
    this.__oneOfIndex__ = getConditionIndex(pathManager, 'oneOf', 'if');
    this.__anyOfIndices__ = getConditionIndices(pathManager, 'anyOf', 'if');
    this.__watchValues__ = getObservedValues(pathManager, 'watch');
  }

  /**
   * Recalculates all computed properties based on dependency values.
   *
   * @param dependencies - Array of dependency values corresponding to the order of `dependencyPaths`
   *
   * @description
   * This method is called when dependency values change and updates the following properties:
   * - `active`, `visible`, `readOnly`, `disabled`: Boolean state values
   * - `oneOfIndex`: Index of the matching oneOf condition
   * - `anyOfIndices`: Array of indices for all matching anyOf conditions
   * - `watchValues`: Current values of watched paths
   *
   * @example
   * ```typescript
   * // Dependency paths: ['../category', '../locked']
   * // Dependency values: ['premium', true]
   * manager.recalculate(['premium', true]);
   *
   * console.log(manager.visible); // Result of computed.visible expression
   * console.log(manager.readOnly); // Result of computed.readOnly expression
   * ```
   */
  public recalculate(this: ComputedPropertiesManager, dependencies: any[]) {
    if (this.__active__) this.active = this.__active__(dependencies);
    if (this.__visible__) this.visible = this.__visible__(dependencies);
    if (this.__readOnly__) this.readOnly = this.__readOnly__(dependencies);
    if (this.__disabled__) this.disabled = this.__disabled__(dependencies);
    if (this.__oneOfIndex__)
      this.oneOfIndex = this.__oneOfIndex__(dependencies);
    if (this.__anyOfIndices__)
      this.anyOfIndices = this.__anyOfIndices__(dependencies);
    if (this.__watchValues__)
      this.watchValues = this.__watchValues__(dependencies);
  }
}
