import {
  isEmptyObject,
  isObject,
  isTruthy,
} from '@winglet/common-utils/filter';
import { equals } from '@winglet/common-utils/object';
import { escapeSegment } from '@winglet/json/pointer';

import type { Fn } from '@aileron/declare';

import { PluginManager } from '@/schema-form/app/plugin';
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
import { transformErrors } from '@/schema-form/helpers/error';
import {
  JSONPointer,
  isAbsolutePath,
  joinSegment,
} from '@/schema-form/helpers/jsonPointer';
import type {
  AllowedValue,
  JsonSchema,
  JsonSchemaError,
  JsonSchemaWithVirtual,
  ValidateFunction,
  ValidatorFactory,
} from '@/schema-form/types';

import {
  type ChildNode,
  type HandleChange,
  type NodeEvent,
  NodeEventType,
  type NodeListener,
  type NodeStateFlags,
  type SchemaNode,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
  ValidationMode,
} from '../type';
import {
  EventCascade,
  computeFactory,
  find,
  getFallbackValidator,
  getNodeGroup,
  getNodeType,
  getPathSegments,
  getSafeEmptyValue,
} from './utils';

const IGNORE_ERROR_KEYWORDS = new Set(['oneOf']);
const RECURSIVE_ERROR_OMITTED_KEYS = new Set(['key']);
const RESET_NODE_OPTION = SetValueOption.Replace | SetValueOption.Propagate;

export abstract class AbstractNode<
  Schema extends JsonSchemaWithVirtual = JsonSchemaWithVirtual,
  Value extends AllowedValue = any,
> {
  /** [readonly] Node group, `branch` or `terminal` */
  public readonly group: 'branch' | 'terminal';

  /** [readonly] Node type, `array`, `number`, `object`, `string`, `boolean`, `virtual`, `null` */
  public readonly type: Exclude<Schema['type'], 'integer'>;

  /** [readonly] Node depth */
  public readonly depth: number;

  /** [readonly] Whether this is the root node */
  public readonly isRoot: boolean;

  /** [readonly] Root node */
  public readonly rootNode: SchemaNode;

  /** [readonly] Parent node */
  public readonly parentNode: SchemaNode | null;

  /** [readonly] Node's JSON Schema */
  public readonly jsonSchema: Schema;

  /** [readonly] Original property key of the node */
  public readonly propertyKey: string;

  /** [readonly] Node's escaped key(it can be same as propertyKey if not escape needed) */
  public readonly escapedKey: string;

  /** [readonly] Whether the node is required */
  public readonly required: boolean;

  /** Node name */
  #name: string;

  /**
   * [readonly] Node name
   * @note Basically it is readonly, but can be changed with `setName` by the parent node.
   * */
  public get name() {
    return this.#name;
  }

  /**
   * Sets the node's name. Only the parent can change the name.
   * @param name - The name to set
   * @param actor - The node setting the name
   */
  public setName(this: AbstractNode, name: string, actor: SchemaNode) {
    if (actor === this.parentNode || actor === this) {
      this.#name = name;
      this.updatePath();
    }
  }

  /** Node path */
  #path: string;

  /**
   * [readonly] Node path.
   * @note Basically it is readonly, but can be changed with `updatePath` by the parent node.
   * */
  public get path() {
    return this.#path;
  }

  /**
   * Updates the node's path. Updates its own path by referencing the parent node's path.
   * @returns Whether the path was changed
   * @returns {boolean} Whether the path was changed
   */
  public updatePath(this: AbstractNode) {
    const previous = this.#path;
    const parentPath = this.parentNode?.path;
    const current = joinSegment(parentPath, this.escapedKey);
    if (previous === current) return false;
    this.#path = current;
    this.publish({
      type: NodeEventType.UpdatePath,
      payload: { [NodeEventType.UpdatePath]: current },
      options: {
        [NodeEventType.UpdatePath]: {
          previous,
          current,
        },
      },
    });
    return true;
  }

  /** Node key */
  #key?: string;

  /** [readonly] Node key */
  public get key() {
    return this.#key;
  }

  /** Node's initial default value */
  #initialValue: Value | undefined;

  /** Node's current default value */
  #defaultValue: Value | undefined;

  /**
   * Node's default value
   *  - set: `setDefaultValue`, can only be updated by inherited nodes
   *  - get: `defaultValue`, can be read in all situations
   */
  public get defaultValue() {
    return this.#defaultValue;
  }

  /**
   * Changes the node's default value, can only be performed by inherited nodes
   * For use in `constructor`
   * @param value input value for updating defaultValue
   */
  protected setDefaultValue(this: AbstractNode, value: Value | undefined) {
    this.#initialValue = this.#defaultValue = value;
  }

  /**
   * Changes the node's default value and publishes a Refresh event. Can only be performed by inherited nodes
   * For use outside of `constructor`
   * @param value input value for updating defaultValue
   * @returns {Promise<void>} A promise that resolves when the refresh is complete
   */
  protected refresh(this: AbstractNode, value: Value | undefined) {
    this.#defaultValue = value;
    this.publish({ type: NodeEventType.RequestRefresh });
  }

  /**
   * Gets the node's value
   * @returns The node's value
   */
  public abstract get value(): Value | undefined;

  /**
   * Sets the node's value
   * @param input - The value to set
   */
  public abstract set value(input: Value | undefined);

  /**
   * Sets the node's value, can be redefined by inherited nodes
   * @param input The value to set or a function that returns a value
   * @param options Set options
   *   - replace(boolean): Overwrite existing value, (default: false, merge with existing value)
   */
  protected abstract applyValue(
    this: AbstractNode,
    input: Value | undefined,
    option: UnionSetValueOption,
  ): void;

  /**
   * Sets the node's value. Performs preprocessing on the input before reflecting the actual data with applyValue.
   * @param input - The value to set or a function that returns a value
   * @param option - Set options, can be combined using bitwise operators
   *   - `Overwrite`(default): `Replace` | `Propagate` | `Refresh`
   *   - `Merge`: `Propagate` | `Refresh`
   *   - `Replace`: Replace the current value
   *   - `Propagate`: Propagate the update to child nodes
   *   - `Refresh`: Trigger a refresh to update the FormTypeInput
   *   - `Normal`: Only update the value
   */
  public setValue(
    this: AbstractNode,
    input: Value | undefined | ((prev: Value | undefined) => Value | undefined),
    option: UnionSetValueOption = SetValueOption.Overwrite,
  ): void {
    const inputValue = typeof input === 'function' ? input(this.value) : input;
    this.applyValue(inputValue, option);
  }

  /**
   * Function called when the node's value changes
   * @note For RootNode, the onChange function is called only after all microtasks have been completed.
   * @param input - The changed value
   * @param batch - Optional flag indicating whether the change should be batched
   */
  #handleChange: HandleChange<Value>;

  /**
   * Function called when the node's value changes.
   * @param input - The changed value
   * @param batch - Optional flag indicating whether the change should be batched
   */
  protected onChange(
    this: AbstractNode,
    input: Value | undefined,
    batch?: boolean,
  ): void {
    if (this.isRoot)
      this.#handleChange(getSafeEmptyValue(input, this.jsonSchema), batch);
    else this.#handleChange(input, batch);
  }

  /** List of child nodes, nodes without child nodes return an `null` */
  public get children(): ChildNode[] | null {
    return null;
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    validationMode,
    validatorFactory,
    required,
  }: SchemaNodeConstructorProps<Schema, Value>) {
    this.type = getNodeType(jsonSchema);
    this.group = getNodeGroup(jsonSchema);

    this.jsonSchema = jsonSchema;
    this.parentNode = parentNode || null;
    this.required = required ?? false;

    this.rootNode = (this.parentNode?.rootNode || this) as SchemaNode;
    this.isRoot = !this.parentNode;
    this.#name = name || '';
    this.propertyKey = this.#name;
    this.escapedKey = escapeSegment(this.propertyKey);

    this.#path = joinSegment(this.parentNode?.path, this.escapedKey);
    this.#key = key ? joinSegment(this.parentNode?.path, key) : this.#path;

    this.depth = this.#path
      .split(JSONPointer.Separator)
      .filter(isTruthy).length;

    if (this.parentNode) {
      const unsubscribe = this.parentNode.subscribe(({ type }) => {
        if (type & NodeEventType.UpdatePath) this.updatePath();
      });
      this.saveUnsubscribe(unsubscribe);
    }

    this.#compute = computeFactory(this.jsonSchema, this.rootNode.jsonSchema);

    this.setDefaultValue(
      defaultValue !== undefined ? defaultValue : getDefaultValue(jsonSchema),
    );
    this.#handleChange = onChange;

    // NOTE: Special behavior for root node
    if (this.isRoot) this.#prepareValidator(validatorFactory, validationMode);
  }

  /**
   * Finds the node corresponding to the given path in the node tree.
   * @param path - Path of the node to find (e.g., '/foo/0/bar'), returns itself if not provided
   * @returns {SchemaNode|null} The found node, null if not found
   */
  public find(this: AbstractNode, path?: string): SchemaNode | null {
    if (path === undefined) return this as SchemaNode;
    const useRootNode = isAbsolutePath(path);
    if (useRootNode && path.length === 1) return this.rootNode;
    return find(
      useRootNode ? this.rootNode : (this as SchemaNode),
      getPathSegments(path),
    );
  }

  /** List of node event listeners */
  #listeners: Set<NodeListener> = new Set();

  /** Collects pushed events and publishes them at once */
  #eventCascade = new EventCascade((event: NodeEvent) => {
    for (const listener of this.#listeners) listener(event);
  });

  /** List of unsubscribe functions for other nodes */
  #unsubscribes: Array<Fn> = [];

  /**
   * Saves an event unsubscribe function.
   * @param unsubscribe - The unsubscribe function to save
   */
  protected saveUnsubscribe(this: AbstractNode, unsubscribe: Fn) {
    this.#unsubscribes.push(unsubscribe);
  }

  /**
   * Cancels all saved event subscriptions.
   * @internal Internal implementation method. Do not call directly.
   */
  #clearUnsubscribes(this: AbstractNode) {
    for (let i = 0, l = this.#unsubscribes.length; i < l; i++)
      this.#unsubscribes[i]();
    this.#unsubscribes = [];
  }

  /**
   * Initializes the node's event listener/subscription list. Initialization must be called by itself or by the parent node.
   * @param actor - The node requesting initialization
   * @internal Internal implementation method. Do not call directly.
   */
  public cleanUp(this: AbstractNode, actor?: SchemaNode) {
    if (actor !== this.parentNode && !this.isRoot) return;
    this.#clearUnsubscribes();
    this.#listeners.clear();
  }

  /**
   * Registers a node event listener
   * @param listener Event listener
   * @returns Event listener removal function
   */
  public subscribe(this: AbstractNode, listener: NodeListener) {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  /**
   * Publishes an event to the node's listeners
   * @param event Event to publish
   *    - type: Event type (see NodeEventType)
   *    - payload: Data for the event (see MethodPayload)
   *    - options: Options for the event (see MethodOptions)
   */
  public publish(this: AbstractNode, event: NodeEvent) {
    this.#eventCascade.schedule(event);
  }

  /** Whether the node is activated */
  #activated: boolean = false;

  /** [readonly] Whether the node is activated */
  public get activated() {
    return this.#activated;
  }

  /**
   * Activates the node. Activation must be called by itself or by the parent node.
   * @param actor - The node requesting activation
   * @returns {boolean} Whether activation occurred
   * @internal Internal implementation method. Do not call directly.
   */
  public activate(this: AbstractNode, actor?: SchemaNode) {
    if (this.#activated || (actor !== this.parentNode && !this.isRoot))
      return false;
    this.#activated = true;
    this.#prepareUpdateDependencies();
    this.publish({ type: NodeEventType.Activated });
    return true;
  }

  /**
   * Tools for handling computed properties
   *  - `dependencyPaths`: List of paths to dependencies
   *  - `visible`: Calculate whether the node is visible
   *  - `readOnly`: Calculate whether the node is read only
   *  - `disabled`: Calculate whether the node is disabled
   *  - `oneOfIndex`: Calculate the index of the oneOf branch
   *  - `watchValues`: Calculate the list of values to watch
   */
  #compute: ReturnType<typeof computeFactory>;

  /** List of dependencies for the node */
  #dependencies: any[] = [];

  /** Whether the node is visible */
  #visible: boolean = true;

  /** [readonly] Whether the node is visible */
  public get visible() {
    return this.#visible;
  }

  /** Whether the node is read only */
  #readOnly: boolean = false;

  /** [readonly] Whether the node is read only */
  public get readOnly() {
    return this.#readOnly;
  }

  /** Whether the node is disabled */
  #disabled: boolean = false;

  /** [readonly] Whether the node is disabled */
  public get disabled() {
    return this.#disabled;
  }

  /** Index of the oneOf branch */
  #oneOfIndex: number = -1;

  /** [readonly] Index of the oneOf branch */
  public get oneOfIndex() {
    return this.#oneOfIndex;
  }

  /** List of values to watch */
  #watchValues: ReadonlyArray<any> = [];

  /** [readonly] List of values to watch */
  public get watchValues() {
    return this.#watchValues;
  }

  /**
   * Prepares dependencies for update computation.
   * @internal Internal implementation method. Do not call directly.
   */
  #prepareUpdateDependencies(this: AbstractNode) {
    const dependencyPaths = this.#compute.dependencyPaths;
    if (dependencyPaths.length > 0) {
      this.#dependencies = new Array(dependencyPaths.length);
      for (let i = 0, l = dependencyPaths.length; i < l; i++) {
        const dependencyPath = dependencyPaths[i];
        const targetNode = this.find(dependencyPath);
        if (!targetNode) continue;
        this.#dependencies[i] = targetNode.value;
        const unsubscribe = targetNode.subscribe(({ type, payload }) => {
          if (type & NodeEventType.UpdateValue) {
            if (
              this.#dependencies[i] !== payload?.[NodeEventType.UpdateValue]
            ) {
              this.#dependencies[i] = payload?.[NodeEventType.UpdateValue];
              this.updateComputedProperties();
            }
          }
        });
        this.saveUnsubscribe(unsubscribe);
      }
    }
    this.updateComputedProperties();
    this.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateComputedProperties)
        this.#hasPublishedUpdateComputedProperties = false;
    });
  }

  /** Whether the node has published an UpdateComputedProperties event */
  #hasPublishedUpdateComputedProperties = false;

  /**
   * Updates the node's computed properties.
   * @internal Internal implementation method. Do not call directly.
   */
  protected updateComputedProperties(this: AbstractNode) {
    const previousVisible = this.#visible;
    this.#visible = this.#compute.visible?.(this.#dependencies) ?? true;
    this.#readOnly = this.#compute.readOnly?.(this.#dependencies) ?? false;
    this.#disabled = this.#compute.disabled?.(this.#dependencies) ?? false;
    this.#watchValues = this.#compute.watchValues?.(this.#dependencies) || [];
    this.#oneOfIndex = this.#compute.oneOfIndex?.(this.#dependencies) ?? -1;
    if (previousVisible !== this.#visible) this.resetNode(true);
    if (!this.#hasPublishedUpdateComputedProperties) {
      this.publish({ type: NodeEventType.UpdateComputedProperties });
      this.#hasPublishedUpdateComputedProperties = true;
    }
  }

  /**
   * Resets the current node to its initial value. Uses the current node's initial value, or the provided value if one is given.
   * @param preferLatest - Whether to use the latest value, uses the latest value if available
   * @param input - The value to set, uses the provided value if given
   * @internal Internal implementation method. Do not call directly.
   */
  public resetNode(
    this: AbstractNode,
    preferLatest: boolean,
    input?: Value | undefined,
  ) {
    const defaultValue = preferLatest
      ? input !== undefined
        ? input
        : this.value !== undefined
          ? this.value
          : this.#initialValue
      : this.#initialValue;
    this.#defaultValue = defaultValue;

    const value = this.#visible ? defaultValue : undefined;
    this.setValue(value, RESET_NODE_OPTION);
    this.onChange(value, true);

    this.setState();
  }

  /** Node's state flags */
  #state: NodeStateFlags = {};

  /**
   * [readonly] Node's state flags
   * @note use `setState` method to set the state
   * */
  public get state() {
    return this.#state;
  }

  /**
   * Sets the node's state. Maintains existing state unless explicitly passing undefined.
   * @param input - The state to set or a function that computes new state based on previous state
   */
  public setState(
    this: AbstractNode,
    input?: ((prev: NodeStateFlags) => NodeStateFlags) | NodeStateFlags,
  ) {
    // Calculate new state based on previous state if received as function
    const newInput = typeof input === 'function' ? input(this.#state) : input;
    let dirty = false;
    if (newInput === undefined) {
      if (isEmptyObject(this.#state)) return;
      this.#state = Object.create(null);
      dirty = true;
    } else if (isObject(newInput)) {
      for (const [key, value] of Object.entries(newInput)) {
        if (value === undefined) {
          if (key in this.#state) {
            delete this.#state[key];
            dirty = true;
          }
        } else if (this.#state[key] !== value) {
          this.#state[key] = value;
          dirty = true;
        }
      }
    }
    if (!dirty) return;
    this.publish({
      type: NodeEventType.UpdateState,
      payload: { [NodeEventType.UpdateState]: this.#state },
    });
  }

  /** Errors received from external sources */
  #externalErrors: JsonSchemaError[] = [];

  /** [root only] All errors that occurred inside the form */
  #globalErrors: JsonSchemaError[] | undefined;

  /** [root only] List of dataPath for all errors that occurred inside the form */
  #errorDataPaths: string[] | undefined;

  /** [root only] Result of merging all errors that occurred inside the form with externally received errors */
  #mergedGlobalErrors: JsonSchemaError[] = [];

  /** Own errors */
  #localErrors: JsonSchemaError[] | undefined;

  /** Result of merging own errors with externally received errors */
  #mergedLocalErrors: JsonSchemaError[] = [];

  /**
   * Returns the merged result of errors that occurred inside the form and externally received errors.
   * @returns All of the errors that occurred inside the form and externally received errors
   */
  public get globalErrors(): JsonSchemaError[] {
    return this.isRoot ? this.#mergedGlobalErrors : this.rootNode.globalErrors;
  }

  /**
   * Returns the merged result of own errors and externally received errors.
   * @returns Local errors and externally received errors
   */
  public get errors(): JsonSchemaError[] {
    return this.#mergedLocalErrors;
  }

  /**
   * Updates own errors and then merges them with externally received errors.
   * @param errors - List of errors to set
   */
  public setErrors(this: AbstractNode, errors: JsonSchemaError[]) {
    if (equals(this.#localErrors, errors)) return;
    this.#localErrors = errors;
    this.#mergedLocalErrors = [...this.#externalErrors, ...this.#localErrors];
    this.publish({
      type: NodeEventType.UpdateError,
      payload: { [NodeEventType.UpdateError]: this.#mergedLocalErrors },
    });
  }

  /**
   * Merges externally received errors into the global errors.
   * @param errors - List of errors to set
   * @returns {boolean} Whether the merge result changed
   */
  #setGlobalErrors(this: AbstractNode, errors: JsonSchemaError[]) {
    if (equals(this.#globalErrors, errors)) return false;
    this.#globalErrors = errors;
    this.#mergedGlobalErrors = [...this.#externalErrors, ...this.#globalErrors];
    this.publish({
      type: NodeEventType.UpdateGlobalError,
      payload: { [NodeEventType.UpdateGlobalError]: this.#mergedGlobalErrors },
    });
    return true;
  }

  /**
   * Clears own errors.
   * @note Does not clear externally received errors.
   */
  public clearErrors(this: AbstractNode) {
    this.setErrors([]);
  }

  /**
   * Merges externally received errors with local errors. For rootNode, also merges internal errors.
   * @param errors - List of received errors
   */
  public setExternalErrors(this: AbstractNode, errors: JsonSchemaError[] = []) {
    if (equals(this.#externalErrors, errors, RECURSIVE_ERROR_OMITTED_KEYS))
      return;

    this.#externalErrors = new Array<JsonSchemaError>(errors.length);
    for (let i = 0, l = errors.length; i < l; i++)
      this.#externalErrors[i] = { ...errors[i], key: i };

    this.#mergedLocalErrors = this.#localErrors
      ? [...this.#externalErrors, ...this.#localErrors]
      : this.#externalErrors;
    this.publish({
      type: NodeEventType.UpdateError,
      payload: { [NodeEventType.UpdateError]: this.#mergedLocalErrors },
    });

    if (this.isRoot) {
      this.#mergedGlobalErrors = this.#globalErrors
        ? [...this.#externalErrors, ...this.#globalErrors]
        : this.#externalErrors;
      this.publish({
        type: NodeEventType.UpdateGlobalError,
        payload: {
          [NodeEventType.UpdateGlobalError]: this.#mergedGlobalErrors,
        },
      });
    }
  }

  /**
   * Clears externally received errors.
   * @note Does not clear localErrors / internalErrors.
   */
  public clearExternalErrors(this: AbstractNode) {
    if (!this.#externalErrors.length) return;
    if (!this.isRoot)
      this.rootNode.removeFromExternalErrors(this.#externalErrors);
    this.setExternalErrors([]);
  }

  /**
   * Finds and removes specific errors from the externally received errors.
   * @param errors - List of errors to remove
   */
  public removeFromExternalErrors(
    this: AbstractNode,
    errors: JsonSchemaError[],
  ) {
    const deleteKeys: Array<number> = [];
    for (const error of errors)
      if (typeof error.key === 'number') deleteKeys.push(error.key);
    const nextErrors: JsonSchemaError[] = [];
    for (const error of this.#externalErrors)
      if (!error.key || !deleteKeys.includes(error.key)) nextErrors.push(error);
    if (this.#externalErrors.length !== nextErrors.length)
      this.setExternalErrors(nextErrors);
  }

  /** Node's validator function */
  #validator: ValidateFunction | undefined;

  /**
   * Performs validation using the node's JsonSchema
   * @note Only available for rootNode
   * */
  async #validate(
    this: AbstractNode,
    value: Value | undefined,
  ): Promise<JsonSchemaError[]> {
    if (!this.isRoot || !this.#validator) return [];
    const errors = await this.#validator(value);
    if (errors) return transformErrors(errors, IGNORE_ERROR_KEYWORDS);
    else return [];
  }

  /**
   * Performs validation when own value changes
   * @note Only works for rootNode
   */
  async #handleValidation(this: AbstractNode) {
    if (!this.isRoot) return;

    // NOTE: Perform validation using current value and schema in the form
    //    - getDataWithSchema: Transforms and returns value data based on current JsonSchema
    //    - filterErrors: Filters oneOf-related errors from errors
    const internalErrors = await this.#validate(this.value);

    // Save all errors, return false if same as previous errors
    if (!this.#setGlobalErrors(internalErrors)) return;

    // Classify obtained errors by dataPath
    const errorsByDataPath = new Map<
      JsonSchemaError['dataPath'],
      JsonSchemaError[]
    >();
    for (const error of internalErrors) {
      if (!errorsByDataPath.has(error.dataPath))
        errorsByDataPath.set(error.dataPath, []);
      errorsByDataPath.get(error.dataPath)?.push(error);
    }

    // Find nodes by dataPath and set errors for child nodes as well
    for (const [dataPath, errors] of errorsByDataPath.entries())
      this.find(dataPath)?.setErrors(errors);

    // Clear errors for nodes that had errors in previous error list but not in new error list
    const errorDataPaths = Array.from(errorsByDataPath.keys());
    if (this.#errorDataPaths)
      for (const dataPath of this.#errorDataPaths)
        if (!errorDataPaths.includes(dataPath))
          this.find(dataPath)?.clearErrors();

    // Update list of dataPaths with errors
    this.#errorDataPaths = errorDataPaths;
  }

  /**
   * Performs validation based on the current value.
   * @returns {Promise<JsonSchemaError[]>} List of errors that occurred inside the form
   * @note If `ValidationMode.None` is set, an empty array is returned.
   */
  public async validate(this: AbstractNode) {
    if (this.isRoot) await this.#handleValidation();
    else await this.rootNode.validate();
    return this.globalErrors;
  }

  /**
   * Prepares validator, only available for rootNode
   * @param validator ValidatorFactory, creates new one if not provided
   */
  #prepareValidator(
    this: AbstractNode,
    validatorFactory?: ValidatorFactory,
    validationMode?: ValidationMode,
  ) {
    if (!validationMode) return;
    try {
      this.#validator =
        validatorFactory?.(this.jsonSchema as JsonSchema) ||
        PluginManager.validator?.compile(this.jsonSchema as JsonSchema);
    } catch (error: any) {
      this.#validator = getFallbackValidator(error, this.jsonSchema);
    }
    if (validationMode & ValidationMode.OnChange)
      this.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) this.#handleValidation();
      });
  }
}
