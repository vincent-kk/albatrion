import { map } from '@winglet/common-utils/array';
import { isArray, isEmptyObject, isObject } from '@winglet/common-utils/filter';
import { cloneLite, merge } from '@winglet/common-utils/object';
import { escapeSegment, setValue } from '@winglet/json/pointer';

import type { Dictionary, Fn, Nullish } from '@aileron/declare';

import { UNIT_SEPARATOR } from '@/schema-form/app/constants';
import { JsonSchemaError } from '@/schema-form/errors';
import {
  getDefaultValue,
  getEmptyValue,
} from '@/schema-form/helpers/defaultValue';
import { formatInjectToError } from '@/schema-form/helpers/error';
import {
  JSONPointer as $,
  getAbsolutePath,
  isAbsolutePath,
  joinSegment,
} from '@/schema-form/helpers/jsonPointer';
import type {
  AllowedValue,
  InjectHandlerContext,
  JsonSchemaType,
  JsonSchemaWithVirtual,
  JsonSchemaError as ValidationError,
} from '@/schema-form/types';

import {
  type ChildNode,
  type HandleChange,
  type NodeEventOptions,
  type NodeEventPayload,
  NodeEventType,
  type NodeListener,
  type NodeStateFlags,
  type ResetOptions,
  type SchemaNode,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
  ValidationMode,
} from '../type';
import {
  ComputedPropertiesManager,
  EventCascadeManager,
  InjectionGuardManager,
  ValidationErrorManager,
  ValidationManager,
  afterMicrotask,
  checkDefinedValue,
  depthFirstSearch,
  findNode,
  findNodes,
  getNodeGroup,
  getSafeEmptyValue,
  getScopedSegment,
} from './utils';

export abstract class AbstractNode<
  Schema extends JsonSchemaWithVirtual = JsonSchemaWithVirtual,
  Value extends AllowedValue = any,
> {
  /** [readonly] Node's group, `branch` or `terminal` */
  public readonly group: 'branch' | 'terminal';

  /** [readonly] Node's type, `array`, `number`, `object`, `string`, `boolean`, `virtual`, `null` */
  public abstract readonly type: Exclude<JsonSchemaType, 'integer'>;

  /** [readonly] Schema's type, `array`, `number`, `integer`, `object`, `string`, `boolean`, `virtual`, `null` */
  public readonly schemaType: JsonSchemaType;

  /** [readonly] Node's JSON Schema */
  public readonly jsonSchema: Schema;

  /** [readonly] Whether the node value is required */
  public readonly required: boolean;

  /** [readonly] Whether the node value is nullable */
  public readonly nullable: boolean;

  /** [readonly] Node's scope */
  public readonly scope: string | undefined;

  /** [readonly] Node's variant */
  public readonly variant: number | undefined;

  /** [readonly] Node's depth */
  public readonly depth: number;

  /** [readonly] Whether this is the root node */
  public readonly isRoot: boolean;

  /** [readonly] Root node */
  public readonly rootNode: SchemaNode;

  /** [readonly] Node's parent node */
  public readonly parentNode: SchemaNode | null;

  /** Context node reference for form-wide shared data */
  private __contextNode__: AbstractNode | null;

  /**
   * [readonly] Context node for accessing form-wide shared data
   * @note Root nodes return their own context, child nodes delegate to rootNode.context
   */
  public get context(): Dictionary {
    return this.__contextNode__?.value || {};
  }

  /**
   * List of active child nodes within the current scope.
   * @returns Child nodes that are currently active, or `null` for terminal nodes
   * @note For branch nodes (object/array), returns children matching the active oneOf/anyOf branch.
   *       For terminal nodes, always returns `null`.
   */
  public get children(): ChildNode[] | null {
    return null;
  }

  /**
   * List of all child nodes regardless of scope or active state.
   * @returns All subnodes including inactive oneOf/anyOf branches, or `null` for terminal nodes
   * @note Unlike `children`, this includes nodes from all oneOf/anyOf variants.
   *       Useful for operations that need to traverse the complete node tree.
   */
  public get subnodes(): ChildNode[] | null {
    return this.children;
  }

  /** Node's name */
  private __name__: string;

  /**
   * [readonly] Node's name
   * @note Basically it is readonly, but can be changed with `setName` by the parent node.
   * */
  public get name() {
    return this.__name__;
  }

  /** Node's escaped name, it can be same as `name` */
  private __escapedName__: string;

  /**
   * [readonly] Node's escaped name, it can be same as `name`
   * @note Basically it is readonly, but can be changed with `setName` by the parent node.
   * */
  public get escapedName() {
    return this.__escapedName__;
  }

  /**
   * Sets the node's name. Only the parent can change the name.
   * @param name - The name to set
   * @param actor - The node setting the name
   */
  protected __setName__(this: AbstractNode, name: string, actor: SchemaNode) {
    if (actor !== this.parentNode && actor !== this) return;
    this.__name__ = name;
    this.__escapedName__ = escapeSegment(name);
    this.__updatePath__();
  }

  /** Node's data path */
  private __path__: string;

  /**
   * [readonly] Node's data path.
   * @note Basically it is readonly, but can be changed with `updatePath` by the parent node.
   * */
  public get path() {
    return this.__path__;
  }

  /** Node's schema path */
  private __schemaPath__: string;

  /** [readonly] Node's schema path
   * @note Basically it is readonly, but can be changed with `updatePath` by the parent node.
   */
  public get schemaPath() {
    return this.__schemaPath__;
  }

  /** [readonly] Unique identifier combining schemaPath and data path */
  public get key() {
    return this.__schemaPath__ + UNIT_SEPARATOR + this.__path__;
  }

  /**
   * Updates the node's path. Updates its own path by referencing the parent node's path.
   * @returns Whether the path was changed
   * @returns {boolean} Whether the path was changed
   */
  private __updatePath__(this: AbstractNode) {
    const previous = this.__path__;
    const parent = this.parentNode;
    const escapedName = this.__escapedName__;
    const current = joinSegment(parent?.path, escapedName);
    if (previous === current) return false;
    this.__path__ = current;
    this.__schemaPath__ = this.scope
      ? joinSegment(
          parent?.schemaPath || $.Fragment,
          getScopedSegment(escapedName, this.scope, parent?.type, this.variant),
        )
      : joinSegment(parent?.schemaPath || $.Fragment, escapedName);

    const subnodes = this.subnodes;
    if (subnodes?.length)
      for (const subnode of subnodes) subnode.node.__updatePath__();

    this.publish(NodeEventType.UpdatePath, current, { previous, current });
    return true;
  }

  /**
   * Finds the node corresponding to the given pointer in the node tree.
   * @param pointer - JSON Pointer of the node to find (e.g., '/foo/0/bar'), returns itself if not provided
   * @returns {SchemaNode|null} The found node, null if not found
   */
  public find(this: AbstractNode, pointer?: string): SchemaNode | null {
    if (pointer === undefined) return this as SchemaNode;
    if (pointer === $.Context) return this.__contextNode__ as SchemaNode;
    if (pointer === $.Root) return this.rootNode;
    const absolute = isAbsolutePath(pointer);
    if (absolute && pointer.length === 1) return this.rootNode;
    return findNode(absolute ? this.rootNode : (this as SchemaNode), pointer);
  }

  /**
   * Finds all nodes in the node tree that match the given pointer.
   * @param pointer - JSON Pointer of the nodes to find (e.g., '/foo/0/bar'), returns itself if not provided
   * @returns {SchemaNode[]} The found nodes, empty array if not found
   */
  public findAll(this: AbstractNode, pointer?: string): SchemaNode[] {
    if (pointer === undefined) return [this as SchemaNode];
    if (pointer === $.Context)
      return this.__contextNode__ ? [this.__contextNode__ as SchemaNode] : [];
    if (pointer === $.Root) return [this.rootNode];
    const absolute = isAbsolutePath(pointer);
    if (absolute && pointer.length === 1) return [this.rootNode];
    return findNodes(absolute ? this.rootNode : (this as SchemaNode), pointer);
  }

  /** Node's default value, can be updated by inherited nodes */
  private __defaultValue__: Value | Nullish;

  /** Flag indicating whether the node's default value is defined */
  private __isDefinedDefaultValue__: boolean = false;

  /**
   * Node's default value
   *  - set: `setDefaultValue`, can only be updated by inherited nodes
   *  - get: `defaultValue`, can be read in all situations
   */
  public get defaultValue() {
    return this.__defaultValue__;
  }

  /**
   * Changes the node's default value, can only be performed by inherited nodes
   * For use in `constructor`
   * @param defaultValue input value for updating defaultValue
   */
  protected __setDefaultValue__(
    this: AbstractNode,
    defaultValue: Value | Nullish,
  ) {
    this.__defaultValue__ = defaultValue;
    this.__isDefinedDefaultValue__ = checkDefinedValue(defaultValue);
  }

  /**
   * Gets the node's value
   * @returns The node's value
   */
  public abstract get value(): Value | Nullish;

  /**
   * Sets the node's value
   * @param input - The value to set
   */
  public abstract set value(input: Value | Nullish);

  /**
   * Sets the node's value, can be redefined by inherited nodes
   * @param input The value to set or a function that returns a value
   * @param options Set options
   *   - replace(boolean): Overwrite existing value, (default: false, merge with existing value)
   */
  protected abstract applyValue(
    this: AbstractNode,
    input: Value | Nullish,
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
    input: Value | Nullish | Fn<[prev: Value | Nullish], Value | Nullish>,
    option: UnionSetValueOption = SetValueOption.Overwrite,
  ): void {
    this.applyValue(
      typeof input === 'function' ? input(this.value) : input,
      option,
    );
  }

  /**
   * Compares the node's value with the derived value
   * @param left - The left value
   * @param right - The right value
   * @returns Whether the left value is equal to the right value
   */
  protected __equals__(
    this: AbstractNode,
    left: Value | Nullish,
    right: Value | Nullish,
  ): boolean {
    return left === right;
  }

  /**
   * Function called when the node's value changes
   * @note For RootNode, the onChange function is called only after all microtasks have been completed.
   * @param input - The changed value
   * @param batch - Optional flag indicating whether the change should be batched
   */
  private __handleChange__: HandleChange<Value>;

  /**
   * Function called when the node's value changes.
   * @param input - The changed value
   * @param batch - Optional flag indicating whether the change should be batched
   */
  protected onChange(
    this: AbstractNode,
    input: Value | Nullish,
    batch?: boolean,
  ): void {
    if (this.__computeManager__.active && this.__scoped__)
      this.__handleChange__(input, batch);
    else if (input === undefined) this.__handleChange__(undefined, batch);
  }

  /**
   * Tools for handling computed properties
   *  - `dependencyPaths`: List of paths to dependencies
   *  - `active`: Calculate whether the node is active
   *  - `visible`: Calculate whether the node is visible
   *  - `enabled`: Calculate whether the node is both active and visible
   *  - `readOnly`: Calculate whether the node is read only
   *  - `disabled`: Calculate whether the node is disabled
   *  - `oneOfIndex`: Calculate the index of the oneOf branch
   *  - `derivedValue`: Get derived value from dependencies
   *  - `watchValues`: Calculate the list of values to watch
   */
  private __computeManager__: ComputedPropertiesManager;

  /**
   * Cached values from dependency nodes used for computed property calculations.
   * @note Array indices correspond to `__compute__.dependencyPaths` order.
   *       Updated automatically when dependency node values change.
   */
  private __dependencies__: any[] = [];

  /**
   * Flag indicating whether this node has any computed properties defined.
   * @note Set during initialization based on whether `dependencyPaths` is non-empty.
   */
  protected __computeEnabled__: boolean = false;

  /**
   * Whether this node belongs to the currently active oneOf/anyOf branch of its parent.
   * @note Nodes outside the active branch are excluded from value propagation.
   *       This is separate from `__active__` which is controlled by computed properties.
   */
  private __scoped__: boolean = true;

  /**
   * Whether this node is currently active and can participate in value updates.
   * @returns `true` if both `__active__` (computed) and `__scoped__` (branch) conditions are met
   * @note An inactive node's value is excluded from the parent's value composition.
   */
  public get active() {
    return this.__computeManager__.active && this.__scoped__;
  }

  /**
   * Whether this node should be displayed in the UI.
   * @returns `true` if computed.visible evaluates to true (or is not defined)
   * @note Visibility only affects rendering; invisible nodes still hold values.
   */
  public get visible() {
    return this.__computeManager__.visible;
  }

  /**
   * Whether this node is fully enabled for rendering and interaction.
   * @returns `true` if the node is active, scoped, and visible
   * @note Use this to determine if a form field should be rendered and interactive.
   */
  public get enabled() {
    return (
      this.__scoped__ &&
      this.__computeManager__.active &&
      this.__computeManager__.visible
    );
  }

  /**
   * Whether this node's value cannot be modified by user interaction.
   * @returns `true` if computed.readOnly evaluates to true
   * @note The value can still be changed programmatically via setValue().
   */
  public get readOnly() {
    return this.__computeManager__.readOnly;
  }

  /**
   * Whether this node is disabled for user interaction.
   * @returns `true` if computed.disabled evaluates to true
   * @note Unlike readOnly, disabled typically affects the visual appearance more significantly.
   */
  public get disabled() {
    return this.__computeManager__.disabled;
  }

  /**
   * The index of the currently active oneOf schema branch.
   * @returns Branch index (0-based), or -1 if no branch is active
   * @note Used by child nodes to determine their `__scoped__` state.
   */
  public get oneOfIndex() {
    return this.__computeManager__.oneOfIndex;
  }

  /**
   * The indices of currently active anyOf schema branches.
   * @returns Array of branch indices (0-based), empty if none active
   * @note Multiple branches can be active simultaneously with anyOf.
   */
  public get anyOfIndices() {
    return this.__computeManager__.anyOfIndices;
  }

  /**
   * Computed values from dependencies that can trigger UI updates.
   * @returns Readonly array of values computed from dependency paths
   * @note Useful for React useMemo/useEffect dependencies or similar reactive patterns.
   */
  public get watchValues() {
    return this.__computeManager__.watchValues;
  }

  /** Prepares dependencies for update computation. */
  private __prepareUpdateDependencies__(this: AbstractNode) {
    if (this.__initialized__) return;
    const dependencyPaths = this.__computeManager__.dependencyPaths;
    const computeEnabled = dependencyPaths.length > 0;
    if (computeEnabled) {
      this.__dependencies__ = new Array(dependencyPaths.length);
      for (let i = 0, l = dependencyPaths.length; i < l; i++) {
        const targetNodes = this.findAll(dependencyPaths[i]);
        if (targetNodes.length === 0) continue;
        this.__dependencies__[i] = this.find(dependencyPaths[i])?.value;
        const unsubscribes = map(targetNodes, (node) =>
          node.subscribe(({ type, payload }) => {
            if (type & NodeEventType.UpdateValue) {
              if (
                this.__dependencies__[i] !==
                payload?.[NodeEventType.UpdateValue]
              ) {
                this.__dependencies__[i] = payload?.[NodeEventType.UpdateValue];
                this.__updateComputedProperties__();
              }
            }
          }),
        );
        for (const unsubscribe of unsubscribes)
          this.saveUnsubscribe(unsubscribe);
      }
    }
    if (
      this.__computeManager__.getDerivedValue ||
      this.__computeManager__.getPristine
    )
      this.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateComputedProperties) {
          if (this.__computeManager__.getDerivedValue) {
            const derivedValue = this.__computeManager__.getDerivedValue(
              this.__dependencies__,
            );
            if (this.active && !this.__equals__(this.value, derivedValue))
              this.setValue(derivedValue);
          }
          if (this.__computeManager__.getPristine?.(this.__dependencies__))
            this.setState();
        }
      });
    this.__updateComputedProperties__();
    this.__computeEnabled__ = computeEnabled;
  }

  /**
   * Updates the node's computed properties.
   * @param reset - Whether to reset the node when the active property changes, default is `true`
   */
  protected __updateComputedProperties__(
    this: AbstractNode,
    reset: boolean = true,
  ) {
    const previous = this.__computeManager__.active;
    this.__computeManager__.recalculate(this.__dependencies__);
    if (reset && previous !== this.__computeManager__.active)
      this.__reset__({ preferLatest: true });
    this.publish(NodeEventType.UpdateComputedProperties);
  }

  /**
   * Updates the computed properties of the node and its children recursively.
   * @param includeSelf - Whether to include the current node, default is `false`
   * @param includeInactive - Whether to include the inactive child nodes, default is `true`
   */
  protected __updateComputedPropertiesRecursively__(
    this: AbstractNode,
    includeSelf: boolean = false,
    includeInactive: boolean = true,
  ) {
    if (includeSelf) this.__updateComputedProperties__(false);
    const list = includeInactive ? this.subnodes : this.children;
    if (!list?.length) return;
    for (let i = 0, e = list[0], l = list.length; i < l; i++, e = list[i]) {
      // @ts-expect-error [internal] update computed properties recursively
      e.node.__updateComputedPropertiesRecursively__(true, includeInactive);
    }
  }

  /**
   * Updates the node's scoped property.
   * @returns Whether the scoped property was changed
   */
  private __updateScoped__(this: AbstractNode) {
    if (this.variant === undefined || this.parentNode === null) return;
    if (this.scope === 'oneOf')
      this.__scoped__ = this.parentNode.oneOfIndex === this.variant;
    else if (this.scope === 'anyOf')
      this.__scoped__ =
        this.parentNode.anyOfIndices.indexOf(this.variant) !== -1;
  }

  /**
   * Global state flags aggregated from all nodes in the form tree.
   * @remarks **[Root Node Only]** This field is only meaningful on the root node.
   *          Aggregates truthy state values from all descendant nodes.
   *          Useful for form-wide indicators like "hasErrors" or "isDirty".
   */
  private __globalState__: NodeStateFlags = {};

  /**
   * Local state flags specific to this node.
   * @note Stores custom state like "touched", "dirty", "focused", etc.
   *       Changes are published via UpdateState event and propagated to globalState.
   */
  private __state__: NodeStateFlags = {};

  /**
   * Aggregated state flags from all nodes in the form tree.
   * @returns On root nodes, returns `__globalState__`. On child nodes, delegates to `rootNode.globalState`.
   * @note Use `setGlobalState` method to update. Read-only via this getter.
   */
  public get globalState(): NodeStateFlags {
    return this.isRoot ? this.__globalState__ : this.rootNode.globalState;
  }

  /**
   * [readonly] Node's local state flags
   * @note use `setState` method to set the state
   * */
  public get state() {
    return this.__state__;
  }

  /**
   * Sets the global state flags for the form tree.
   * On root nodes, updates `__globalState__` directly. On child nodes, delegates to `rootNode.setGlobalState()`.
   * Only truthy values are accumulated (falsy values are ignored).
   * @param input - The state to set. If `undefined`, clears all global state flags.
   */
  private __setGlobalState__(this: AbstractNode, input?: NodeStateFlags) {
    if (this.isRoot) {
      let state: NodeStateFlags | null = this.__globalState__;
      let idle = true;
      if (input === undefined) {
        if (isEmptyObject(state)) return;
        state = null;
        idle = false;
      } else {
        for (const key in input) {
          const stateFlag = input[key];
          if (stateFlag && state[key] !== stateFlag) {
            state[key] = stateFlag;
            if (idle) idle = false;
          }
        }
      }
      if (idle) return;
      this.__globalState__ = state !== null ? { ...state } : {};
      this.publish(NodeEventType.UpdateGlobalState, this.__globalState__);
    } else this.rootNode.__setGlobalState__(input);
  }

  /**
   * Sets the node's local state. Maintains existing state unless explicitly passing undefined.
   * @param input - The state to set or a function that computes new state based on previous state
   * @param silent - If true, skip updating globalState (default: false)
   */
  public setState(
    this: AbstractNode,
    input?: ((prev: NodeStateFlags) => NodeStateFlags) | NodeStateFlags,
    silent?: boolean,
  ) {
    let state: NodeStateFlags | null = this.__state__;
    const inputState =
      typeof input === 'function' ? input({ ...state }) : input;
    let idle = true;
    if (inputState === undefined) {
      if (isEmptyObject(state)) return;
      state = null;
      idle = false;
    } else if (isObject(inputState)) {
      const keys = Object.keys(inputState);
      for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
        const value = inputState[k];
        if (value === undefined) {
          if (k in state) {
            delete state[k];
            if (idle) idle = false;
          }
        } else if (state[k] !== value) {
          state[k] = value;
          if (idle) idle = false;
        }
      }
    }
    if (idle) return;
    this.__state__ = state !== null ? { ...state } : {};
    this.publish(NodeEventType.UpdateState, this.__state__);
    if (silent !== true) this.__setGlobalState__(this.__state__);
  }

  /**
   * Sets the state of the subtree.
   * @param this - The node to set the state for.
   * @param state - The state to set
   * @returns void
   */
  public setSubtreeState(this: AbstractNode, state: NodeStateFlags) {
    depthFirstSearch(this, (node) => node.setState(state, true));
    this.__setGlobalState__(state);
  }

  /**
   * Clears the state of the subtree.
   * If the node is the root node, it will also clear the global state.
   * @param this - The node to clear the state for.
   * @returns void
   */
  public clearSubtreeState(this: AbstractNode) {
    depthFirstSearch(this, (node) => node.setState(undefined, true));
    if (this.isRoot) this.__setGlobalState__();
  }

  private __validationManager__: ValidationManager | undefined;

  /** [readonly] Whether validation is enabled for this form */
  protected get __validationEnabled__(): boolean {
    return this.isRoot
      ? this.__validationManager__?.enabled === true
      : (this.rootNode as AbstractNode).__validationEnabled__;
  }

  /**
   * Performs validation based on the current value.
   * @returns {Promise<ValidationError[]>} List of errors that occurred inside the form
   * @note If `ValidationMode.None` is set, an empty array is returned.
   */
  public async validate(this: AbstractNode) {
    if (this.isRoot)
      await this.__validationManager__?.validate(this.__enhancedValue__);
    else await this.rootNode.validate();
    return this.globalErrors;
  }

  /**
   * Additional data for validation that includes virtual/computed field values.
   * @note Only used by root node. Virtual fields don't exist in the actual value
   *       but need to be included for schema validation.
   */
  private __enhancer__: Value | undefined;

  /**
   * Gets the value used for validation, merging actual value with enhancer data.
   * @returns Combined value including virtual field values for complete schema validation
   * @note Only used by root node during validation.
   */
  private get __enhancedValue__(): Value | Nullish {
    const value = this.value;
    if (this.group === 'terminal' || value == null) return value;
    const enhancer = this.__enhancer__;
    if (enhancer === undefined || isEmptyObject(enhancer)) return value;
    return merge(cloneLite(enhancer), value);
  }

  /**
   * Adds or updates a value in the enhancer for validation purposes
   * @param pointer - JSON Pointer path to the value location
   * @param value - Value to set in enhancer (typically from virtual/computed fields)
   * */
  protected __adjustEnhancer__(
    this: AbstractNode,
    pointer: string,
    value: any,
  ) {
    if (this.isRoot) setValue(this.__enhancer__, pointer, value);
    else (this.rootNode as AbstractNode).__adjustEnhancer__(pointer, value);
  }

  /** @internal Error management for this node */
  private __errorManager__ = new ValidationErrorManager();

  /**
   * Returns the merged result of errors that occurred inside the form and externally received errors.
   * @returns All of the errors that occurred inside the form and externally received errors
   */
  public get globalErrors(): ValidationError[] {
    if (this.isRoot) return this.__errorManager__.mergedGlobalErrors;
    else return this.rootNode.__errorManager__.mergedGlobalErrors;
  }

  /**
   * Returns the merged result of own errors and externally received errors.
   * @returns Local errors and externally received errors
   */
  public get errors(): ValidationError[] {
    return this.__errorManager__.mergedLocalErrors;
  }

  /**
   * Merges externally received errors into the global errors.
   * @param errors - List of errors to set
   * @returns {boolean} Whether the merge result changed (true if unchanged)
   */
  protected __setGlobalErrors__(this: AbstractNode, errors: ValidationError[]) {
    if (this.__errorManager__.setGlobalErrors(errors)) return true;
    this.publish(
      NodeEventType.UpdateGlobalError,
      this.__errorManager__.mergedGlobalErrors,
    );
    return false;
  }

  /**
   * Updates own errors and then merges them with externally received errors.
   * @param errors - List of errors to set
   */
  public setErrors(this: AbstractNode, errors: ValidationError[]) {
    if (this.__errorManager__.setLocalErrors(errors)) return;
    this.publish(
      NodeEventType.UpdateError,
      this.__errorManager__.mergedLocalErrors,
    );
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
  public setExternalErrors(this: AbstractNode, errors: ValidationError[] = []) {
    if (this.__errorManager__.setExternalErrors(errors, this.isRoot)) return;
    this.publish(
      NodeEventType.UpdateError,
      this.__errorManager__.mergedLocalErrors,
    );
    if (this.isRoot)
      this.publish(
        NodeEventType.UpdateGlobalError,
        this.__errorManager__.mergedGlobalErrors,
      );
  }

  /**
   * Clears externally received errors.
   * @note Does not clear localErrors / internalErrors.
   */
  public clearExternalErrors(this: AbstractNode) {
    if (this.__errorManager__.externalErrors.length === 0) return;
    if (this.isRoot === false)
      (this.rootNode as AbstractNode).__removeExternalErrors__(
        this.__errorManager__.externalErrors,
      );
    this.setExternalErrors([]);
  }

  /**
   * Finds and removes specific errors from the externally received errors.
   * @param errors - List of errors to remove
   */
  private __removeExternalErrors__(
    this: AbstractNode,
    errors: ValidationError[],
  ) {
    const filteredErrors = this.__errorManager__.filterExternalErrors(errors);
    if (filteredErrors !== null) this.setExternalErrors(filteredErrors);
  }

  /**
   * Manages node event publishing, subscription, and batching.
   * @description Encapsulates all event-related functionality:
   *              - Listener registration/unregistration
   *              - Event batching to prevent recursive triggering
   *              - Dependency subscription management
   * @see EventCascadeManager
   */
  private __eventManager__ = new EventCascadeManager(() => ({
    path: this.path,
    dependencies: this.__computeManager__.dependencyPaths,
  }));

  /**
   * Saves an event unsubscribe function.
   * @param unsubscribe - The unsubscribe function to save
   */
  protected saveUnsubscribe(this: AbstractNode, unsubscribe: Fn) {
    this.__eventManager__.saveUnsubscribe(unsubscribe);
  }

  /**
   * Initializes the node's event listener/subscription list. Initialization must be called by itself or by the parent node.
   * @param actor - The node requesting initialization
   */
  protected __cleanUp__(this: AbstractNode, actor?: SchemaNode) {
    if (actor !== this.parentNode && !this.isRoot) return;
    this.__eventManager__.cleanUp();
  }

  /**
   * Publishes an event to the node's listeners
   * @param type - Event type (see NodeEventType)
   * @param payload - Data for the event (see NodeEventPayload)
   * @param options - Options for the event (see NodeEventOptions)
   * @param immediate - If true, executes listeners synchronously; if false, batches event via EventCascadeManager
   */
  public publish<Type extends NodeEventType>(
    this: AbstractNode,
    type: Type,
    payload?: NodeEventPayload[Type],
    options?: NodeEventOptions[Type],
    immediate?: boolean,
  ) {
    if (immediate) this.__eventManager__.dispatch(type, payload, options);
    else this.__eventManager__.publish(type, payload, options);
  }

  /**
   * Registers a node event listener
   * @param listener Event listener
   * @returns Event listener removal function
   */
  public subscribe(this: AbstractNode, listener: NodeListener): Fn {
    return this.__eventManager__.subscribe(listener);
  }

  /**
   * Manages injection guard state to prevent circular injection loops.
   * @description Only initialized on the root node. Tracks which node paths are currently
   *              being injected and coordinates deferred cleanup across all nodes in the tree.
   * @see InjectionGuardManager
   */
  private __injectionGuardManager__: InjectionGuardManager | undefined;

  /**
   * Provides access to the injection guard manager from any node in the tree.
   * @description Root nodes return their own manager instance, while child nodes
   *              delegate to the root node's manager to ensure centralized tracking.
   * @returns The injection guard manager, or `undefined` if not initialized
   */
  private get __injectionGuard__() {
    if (this.isRoot) return this.__injectionGuardManager__;
    return this.rootNode.__injectionGuardManager__;
  }

  /**
   * Prepares the handler for `injectTo` schema property.
   * @note Sets up a subscription that listens for value updates and propagates
   *       values to other nodes as defined by the `injectTo` function in the schema.
   *       Implements circular injection prevention using injected node flags.
   */
  private __prepareInjectHandler__(this: AbstractNode) {
    if (this.__initialized__) return;
    const injectHandler = this.jsonSchema.injectTo;
    if (typeof injectHandler !== 'function') return;
    this.subscribe(({ type, options }) => {
      if (type & NodeEventType.UpdateValue) {
        if (options?.[NodeEventType.UpdateValue]?.inject)
          this.publish(NodeEventType.RequestInjection);
        return;
      }
      if (type & NodeEventType.RequestInjection) {
        const injectionGuard = this.__injectionGuard__;
        if (injectionGuard == null) return;
        const value = this.value;
        const dataPath = this.path;
        const context = {
          dataPath,
          schemaPath: this.schemaPath,
          jsonSchema: this.jsonSchema,
          parentValue: this.parentNode?.value || null,
          parentJsonSchema: this.parentNode?.jsonSchema || null,
          rootValue: this.rootNode.value,
          rootJsonSchema: this.rootNode.jsonSchema,
          context: this.context,
        } satisfies InjectHandlerContext;
        try {
          injectionGuard.add(dataPath);
          const affect = injectHandler(value, context);
          if (affect == null) return;
          const operations = isArray(affect) ? affect : Object.entries(affect);
          for (let i = 0, l = operations.length; i < l; i++) {
            const path = getAbsolutePath(dataPath, operations[i][0]);
            if (injectionGuard.has(path)) continue;
            injectionGuard.add(path);
            this.find(path)?.setValue(operations[i][1]);
          }
        } catch (error) {
          const errorContext = { ...context, value, error };
          throw new JsonSchemaError(
            'INJECT_TO',
            formatInjectToError(errorContext),
            errorContext,
          );
        } finally {
          injectionGuard.scheduleClearInjectedPaths();
        }
      }
    });
  }

  /**
   * Flag indicating whether the node has completed initialization.
   * @note Set to `true` after `initialize()` completes successfully.
   *       Prevents duplicate initialization.
   */
  private __initialized__: boolean = false;

  /**
   * Whether the node has completed its initialization phase.
   * @returns `true` if `initialize()` has been called successfully
   * @note Initialization sets up dependency subscriptions and injectTo handlers.
   */
  public get initialized() {
    return this.__initialized__;
  }

  /**
   * Initializes the node. Initialization must be called by itself or by the parent node.
   * @param actor - The node requesting initialization
   * @returns {boolean} Whether initialization occurred
   */
  protected __initialize__(this: AbstractNode, actor?: SchemaNode) {
    if (this.__initialized__ || (actor !== this.parentNode && !this.isRoot))
      return false;
    this.__prepareUpdateDependencies__();
    this.__prepareInjectHandler__();
    this.publish(NodeEventType.Initialized);
    this.__initialized__ = true;
    return true;
  }

  /**
   * Resets the current node to its initial value or computed derived value.
   * Value priority: inputValue > derivedValue > fallbackValue/computed default
   * @param options - Reset options
   * @param options.updateScoped - Whether to update the scoped property (for oneOf/anyOf branches)
   * @param options.preferLatest - Whether to prefer the latest value over initial value
   * @param options.preferInitial - Whether to prefer the initial value when preferLatest is true
   * @param options.inputValue - Explicit input value with highest priority
   * @param options.fallbackValue - Fallback value used in default calculation
   */
  protected __reset__(this: AbstractNode, options: ResetOptions<Value> = {}) {
    if (options.updateScoped) this.__updateScoped__();

    let value: Value | Nullish;
    if ('inputValue' in options) value = options.inputValue;
    else if (options.preferLatest) {
      if (options.checkDefaultValueFirst && this.__isDefinedDefaultValue__)
        value = this.__defaultValue__;
      else
        value =
          options.fallbackValue !== undefined
            ? options.fallbackValue
            : this.value !== undefined
              ? this.value
              : this.__defaultValue__;
    } else value = this.__defaultValue__;

    if (
      options.applyDerivedValue &&
      this.__computeManager__.getDerivedValue &&
      this.active
    )
      value =
        this.__computeManager__.getDerivedValue(this.__dependencies__) ?? value;

    this.setValue(
      this.__computeManager__.active ? value : undefined,
      SetValueOption.StableReset,
    );
    this.setState();
  }

  /**
   * Resets the subtree.
   * @param this - The node to reset the subtree for.
   * @returns void
   */
  public resetSubtree(this: AbstractNode) {
    this.clearSubtreeState();
    this.__reset__();
  }

  constructor({
    name,
    scope,
    variant,
    jsonSchema,
    schemaType,
    required,
    nullable,
    defaultValue,
    onChange,
    parentNode,
    validationMode,
    validatorFactory,
    contextNode,
  }: SchemaNodeConstructorProps<Schema, Value>) {
    this.scope = scope;
    this.variant = variant;
    this.jsonSchema = jsonSchema;
    this.schemaType = schemaType;
    this.nullable = nullable;
    this.required = required ?? false;

    this.isRoot = !parentNode;
    this.rootNode = (parentNode?.rootNode || this) as SchemaNode;
    this.parentNode = parentNode || null;
    this.group = getNodeGroup(this.schemaType, this.jsonSchema);
    this.depth = this.parentNode ? this.parentNode.depth + 1 : 0;

    this.__name__ = name || '';
    this.__escapedName__ = escapeSegment(this.__name__);
    this.__path__ = joinSegment(this.parentNode?.path, this.__escapedName__);
    this.__schemaPath__ = this.scope
      ? joinSegment(
          this.parentNode?.schemaPath || $.Fragment,
          getScopedSegment(
            this.__escapedName__,
            this.scope,
            this.parentNode?.type,
            this.variant,
          ),
        )
      : joinSegment(
          this.parentNode?.schemaPath || $.Fragment,
          this.__escapedName__,
        );

    this.__contextNode__ = this.isRoot
      ? contextNode || null
      : this.rootNode.__contextNode__;

    this.__updateScoped__();
    this.__setDefaultValue__(
      defaultValue !== undefined ? defaultValue : getDefaultValue(jsonSchema),
    );

    this.__computeManager__ = new ComputedPropertiesManager(
      this.schemaType,
      this.jsonSchema,
      this.rootNode.jsonSchema,
    );

    if (this.isRoot) {
      this.__injectionGuardManager__ = new InjectionGuardManager();
      this.__validationManager__ = new ValidationManager(
        this,
        validatorFactory,
        validationMode,
      );
      const validateEnabled = this.__validationManager__?.enabled === true;
      const validateOnChange = validationMode
        ? (validationMode & ValidationMode.OnChange) > 0
        : false;
      this.__handleChange__ = afterMicrotask(() => {
        if (validateEnabled && validateOnChange)
          this.__validationManager__?.validate(this.__enhancedValue__);
        onChange(getSafeEmptyValue(this.value, this.schemaType));
      });
      if (validateEnabled)
        this.__enhancer__ = getEmptyValue(this.schemaType) as Value;
    } else this.__handleChange__ = onChange;
  }
}
