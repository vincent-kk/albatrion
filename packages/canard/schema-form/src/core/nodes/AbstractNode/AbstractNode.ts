import { map } from '@winglet/common-utils/array';
import { isArray, isEmptyObject } from '@winglet/common-utils/filter';
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
  NodeEventType as EventType,
  type HandleChange,
  type NodeEventOptions,
  type NodeEventPayload,
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
  shallowPatch,
} from './utils';

export abstract class AbstractNode<
  Schema extends JsonSchemaWithVirtual = JsonSchemaWithVirtual,
  Value extends AllowedValue = any,
> {
  /**
   * Node's group classification.
   * @remarks `branch` nodes (object/array) can have children, `terminal` nodes cannot.
   */
  public readonly group: 'branch' | 'terminal';

  /**
   * Node's type derived from JSON Schema.
   * @remarks Excludes `integer` as it is normalized to `number` internally.
   */
  public abstract readonly type: Exclude<JsonSchemaType, 'integer'>;

  /**
   * Original schema type as defined in JSON Schema.
   * @remarks Preserves `integer` distinction unlike `type` property.
   */
  public readonly schemaType: JsonSchemaType;

  /** Node's JSON Schema definition. */
  public readonly jsonSchema: Schema;

  /** Whether the node value is required by the parent schema. */
  public readonly required: boolean;

  /** Whether the node value can be `null`. */
  public readonly nullable: boolean;

  /**
   * Node's scope within conditional schemas.
   * @remarks Used for `oneOf` or `anyOf` branch identification.
   */
  public readonly scope: string | undefined;

  /**
   * Node's variant index within its scope.
   * @remarks Indicates which branch (0-indexed) this node belongs to in `oneOf`/`anyOf`.
   */
  public readonly variant: number | undefined;

  /** Node's depth in the tree (root = 0). */
  public readonly depth: number;

  /** Whether this is the root node of the form tree. */
  public readonly isRoot: boolean;

  /** Reference to the root node of the form tree. */
  public readonly rootNode: SchemaNode;

  /** Reference to the parent node, or `null` for root nodes. */
  public readonly parentNode: SchemaNode | null;

  /** @internal Context node reference for form-wide shared data. */
  private __contextNode__: AbstractNode | null;

  /**
   * Context object for accessing form-wide shared data.
   * @remarks Root nodes return their own context value, child nodes delegate to `rootNode.context`.
   */
  public get context(): Dictionary {
    return this.__contextNode__?.value || {};
  }

  /**
   * Active child nodes within the current scope.
   * @remarks For branch nodes (object/array), returns children matching the active `oneOf`/`anyOf` branch.
   *          For terminal nodes, always returns `null`.
   */
  public get children(): ChildNode[] | null {
    return null;
  }

  /**
   * All child nodes regardless of scope or active state.
   * @remarks Unlike `children`, this includes nodes from all `oneOf`/`anyOf` variants.
   *          Useful for operations that need to traverse the complete node tree.
   */
  public get subnodes(): ChildNode[] | null {
    return this.children;
  }

  /** @internal Storage for node's name. */
  private __name__: string;

  /**
   * Node's name (property key or array index).
   * @remarks Readonly externally, but can be changed via `__setName__` by the parent node.
   */
  public get name() {
    return this.__name__;
  }

  /** @internal Storage for node's escaped name. */
  private __escapedName__: string;

  /**
   * Node's escaped name for use in JSON Pointer paths.
   * @remarks Escapes special characters (`~` → `~0`, `/` → `~1`) per RFC 6901.
   *          May be identical to `name` if no escaping is needed.
   */
  public get escapedName() {
    return this.__escapedName__;
  }

  /**
   * Sets the node's name.
   * @param name - The new name to set
   * @param actor - The node requesting the change (must be parent or self)
   * @internal Only the parent node or self can change the name.
   */
  protected __setName__(this: AbstractNode, name: string, actor: SchemaNode) {
    if (actor !== this.parentNode && actor !== this) return;
    this.__name__ = name;
    this.__escapedName__ = escapeSegment(name);
    this.__updatePath__();
  }

  /** @internal Storage for node's data path. */
  private __path__: string;

  /**
   * Node's JSON Pointer path to its data location.
   * @remarks Readonly externally, updated automatically when parent path changes.
   * @example '/users/0/name'
   */
  public get path() {
    return this.__path__;
  }

  /** @internal Storage for node's schema path. */
  private __schemaPath__: string;

  /**
   * Node's path within the JSON Schema structure.
   * @remarks Includes scope segments for `oneOf`/`anyOf` branches.
   *          Readonly externally, updated automatically when parent path changes.
   */
  public get schemaPath() {
    return this.__schemaPath__;
  }

  /**
   * Unique identifier combining schema path and data path.
   * @remarks Used for React keys and node identification across the tree.
   */
  public get key() {
    return this.__schemaPath__ + UNIT_SEPARATOR + this.__path__;
  }

  /**
   * Updates the node's path based on parent node's path.
   * @returns `true` if the path was changed, `false` otherwise
   * @internal Recursively updates all subnode paths when changed.
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

    this.publish(EventType.UpdatePath, current, { previous, current });
    return true;
  }

  /**
   * Finds a node in the tree by JSON Pointer path.
   * @param pointer - JSON Pointer path (e.g., `/foo/0/bar`), or `undefined` to return self
   * @returns The found node, or `null` if not found
   * @example
   * ```ts
   * node.find('/users/0/name');  // Absolute path from root
   * node.find('./child');        // Relative path from current node
   * node.find();                 // Returns self
   * ```
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
   * Finds all nodes in the tree matching the given JSON Pointer path.
   * @param pointer - JSON Pointer path, or `undefined` to return self in array
   * @returns Array of matching nodes, or empty array if none found
   * @remarks Useful when path may match multiple nodes (e.g., with wildcards).
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

  /** @internal Storage for the node's default value. */
  private __defaultValue__: Value | Nullish;

  /** @internal Flag indicating whether the default value is explicitly defined. */
  private __isDefinedDefaultValue__: boolean = false;

  /**
   * Node's default value from schema or initialization.
   * @remarks Used as fallback during reset operations.
   */
  public get defaultValue() {
    return this.__defaultValue__;
  }

  /**
   * Sets the node's default value.
   * @param defaultValue - The default value to set
   * @internal For use during construction or by inherited nodes.
   */
  protected __setDefaultValue__(
    this: AbstractNode,
    defaultValue: Value | Nullish,
  ) {
    this.__defaultValue__ = defaultValue;
    this.__isDefinedDefaultValue__ = checkDefinedValue(defaultValue);
  }

  /**
   * Current value of the node.
   * @remarks Implementation varies by node type (terminal vs branch).
   */
  public abstract get value(): Value | Nullish;

  /**
   * Sets the node's value directly.
   * @param input - The value to set
   * @remarks Prefer using `setValue()` for more control over update behavior.
   */
  public abstract set value(input: Value | Nullish);

  /**
   * Applies a value to the node with the specified options.
   * @param input - The value to apply
   * @param option - Bitwise options controlling update behavior
   * @internal Implemented by concrete node classes.
   */
  protected abstract applyValue(
    this: AbstractNode,
    input: Value | Nullish,
    option: UnionSetValueOption,
  ): void;

  /**
   * Sets the node's value with configurable update behavior.
   * @param input - The value to set, or a function receiving the previous value
   * @param option - Bitwise options (default: `Overwrite`)
   *   - `Overwrite`: `Replace | Propagate | Refresh` (default)
   *   - `Merge`: `Propagate | Refresh` (merge with existing value)
   *   - `Replace`: Replace the current value entirely
   *   - `Propagate`: Propagate the update to child nodes
   *   - `Refresh`: Trigger UI refresh for uncontrolled components
   *   - `Normal`: Only update the value without side effects
   * @example
   * ```ts
   * node.setValue('new value');
   * node.setValue(prev => prev + ' updated');
   * node.setValue({ key: 'value' }, SetValueOption.Merge);
   * ```
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
   * Compares two values for equality.
   * @param left - First value to compare
   * @param right - Second value to compare
   * @returns `true` if values are considered equal
   * @internal Can be overridden by subclasses for deep comparison.
   */
  protected __equals__(
    this: AbstractNode,
    left: Value | Nullish,
    right: Value | Nullish,
  ): boolean {
    return left === right;
  }

  /**
   * @internal Handler function called when the node's value changes.
   * @remarks For root nodes, batched via microtask. For child nodes, propagates to parent.
   */
  private __handleChange__: HandleChange<Value>;

  /**
   * Notifies the parent of a value change.
   * @param input - The new value
   * @param batch - Whether to batch the change notification
   * @internal Only propagates if node is active and scoped.
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

  /** @internal Manager for computed property evaluation and caching. */
  private __computeManager__: ComputedPropertiesManager;

  /**
   * @internal Whether this node belongs to the active `oneOf`/`anyOf` branch.
   * @remarks Separate from `active` which is controlled by computed properties.
   *          Nodes outside the active branch are excluded from value propagation.
   */
  private __scoped__: boolean = true;

  /**
   * Whether this node is active and participates in value updates.
   * @remarks `true` if both computed `active` property and branch scope conditions are met.
   *          Inactive node values are excluded from parent value composition.
   */
  public get active() {
    return this.__computeManager__.active && this.__scoped__;
  }

  /**
   * Whether this node should be displayed in the UI.
   * @remarks Based on computed `visible` property. Defaults to `true` if not defined.
   *          Invisible nodes still hold values; only rendering is affected.
   */
  public get visible() {
    return this.__computeManager__.visible;
  }

  /**
   * Whether this node is fully enabled for rendering and interaction.
   * @remarks `true` if the node is active, scoped, and visible.
   *          Use this to determine if a form field should be rendered.
   */
  public get enabled() {
    return (
      this.__scoped__ &&
      this.__computeManager__.active &&
      this.__computeManager__.visible
    );
  }

  /**
   * Whether this node's value is read-only for user interaction.
   * @remarks Based on computed `readOnly` property.
   *          Value can still be changed programmatically via `setValue()`.
   */
  public get readOnly() {
    return this.__computeManager__.readOnly;
  }

  /**
   * Whether this node is disabled for user interaction.
   * @remarks Based on computed `disabled` property.
   *          Unlike `readOnly`, typically affects visual appearance more significantly.
   */
  public get disabled() {
    return this.__computeManager__.disabled;
  }

  /**
   * Index of the currently active `oneOf` schema branch.
   * @remarks 0-based index, or `-1` if no branch is active.
   *          Used by child nodes to determine their scoped state.
   */
  public get oneOfIndex() {
    return this.__computeManager__.oneOfIndex;
  }

  /**
   * Indices of currently active `anyOf` schema branches.
   * @remarks Array of 0-based indices. Multiple branches can be active simultaneously.
   *          Empty array if none are active.
   */
  public get anyOfIndices() {
    return this.__computeManager__.anyOfIndices;
  }

  /**
   * Computed values from dependencies for reactive UI updates.
   * @remarks Useful for React `useMemo`/`useEffect` dependencies.
   *          Values correspond to paths defined in `computed.watch`.
   */
  public get watchValues() {
    return this.__computeManager__.watchValues;
  }

  /**
   * Initializes dependency subscriptions for computed properties.
   * @internal Called during node initialization.
   */
  private __prepareUpdateDependencies__(this: AbstractNode) {
    if (this.__initialized__) return;
    const manager = this.__computeManager__;
    const dependencyPaths = manager.dependencyPaths;
    if (manager.isEnabled) {
      for (let i = 0, l = dependencyPaths.length; i < l; i++) {
        const targetNodes = this.findAll(dependencyPaths[i]);
        if (targetNodes.length === 0) continue;
        manager.dependencies[i] = this.find(dependencyPaths[i])?.value;
        const unsubscribes = map(targetNodes, (node) =>
          node.subscribe(({ type, payload }) => {
            if (type & EventType.UpdateValue) {
              if (
                manager.dependencies[i] !== payload?.[EventType.UpdateValue]
              ) {
                manager.dependencies[i] = payload?.[EventType.UpdateValue];
                this.__updateComputedProperties__();
              }
            }
          }),
        );
        for (const unsubscribe of unsubscribes)
          this.saveUnsubscribe(unsubscribe);
      }
    }
    if (manager.hasPostProcessor)
      this.subscribe(({ type }) => {
        if (type & EventType.UpdateComputedProperties) {
          if (manager.isDerivedDefined) {
            const derivedValue = manager.getDerivedValue();
            if (this.active && !this.__equals__(this.value, derivedValue))
              this.setValue(derivedValue);
          }
          if (manager.isPristineDefined && manager.getPristine())
            this.setState();
        }
      });
    this.__updateComputedProperties__();
  }

  /**
   * Recalculates computed properties based on current dependencies.
   * @param reset - Whether to reset the node when `active` state changes (default: `true`)
   * @internal Publishes `UpdateComputedProperties` event after recalculation.
   */
  protected __updateComputedProperties__(
    this: AbstractNode,
    reset: boolean = true,
  ) {
    const manager = this.__computeManager__;
    const previous = manager.active;
    manager.recalculate();
    if (reset && previous !== manager.active)
      this.__reset__({ preferLatest: true });
    this.publish(EventType.UpdateComputedProperties);
  }

  /**
   * Recursively updates computed properties for this node and all descendants.
   * @param includeSelf - Whether to include the current node (default: `false`)
   * @param includeInactive - Whether to include inactive child nodes (default: `true`)
   * @internal Used for bulk computed property recalculation.
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
   * Updates the node's scoped state based on parent's `oneOf`/`anyOf` index.
   * @internal Called when parent's active branch changes.
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
   * @internal Global state flags aggregated from all nodes in the form tree.
   * @remarks Only meaningful on root nodes. Aggregates truthy state values from descendants.
   *          Useful for form-wide indicators like `hasErrors` or `isDirty`.
   */
  private __globalState__: NodeStateFlags = {};

  /**
   * @internal Local state flags specific to this node.
   * @remarks Stores custom state like `touched`, `dirty`, `focused`, etc.
   *          Changes are published via `UpdateState` event and propagated to `globalState`.
   */
  private __state__: NodeStateFlags = {};

  /**
   * Aggregated state flags from all nodes in the form tree.
   * @remarks On root nodes, returns own `__globalState__`.
   *          On child nodes, delegates to `rootNode.globalState`.
   */
  public get globalState(): NodeStateFlags {
    return this.isRoot ? this.__globalState__ : this.rootNode.globalState;
  }

  /**
   * Node's local state flags.
   * @remarks Use `setState()` method to modify.
   */
  public get state() {
    return this.__state__;
  }

  /**
   * Sets the global state flags for the form tree.
   * @param input - State to set, or `undefined` to clear all flags
   * @internal On root nodes, updates directly. On child nodes, delegates to root.
   *           Only truthy values are accumulated (falsy values are ignored).
   */
  private __setGlobalState__(this: AbstractNode, input?: NodeStateFlags) {
    if (this.isRoot) {
      const state = shallowPatch(this.__globalState__, input, true);
      if (state === void 0) return;
      this.__globalState__ = state;
      this.publish(EventType.UpdateGlobalState, state);
    } else this.rootNode.__setGlobalState__(input);
  }

  /**
   * Sets the node's local state flags.
   * @param input - State object to merge, or function receiving previous state.
   *                Pass `undefined` to clear all state.
   * @param silent - If `true`, skip propagating to `globalState` (default: `false`)
   * @example
   * ```ts
   * node.setState({ touched: true });
   * node.setState(prev => ({ ...prev, dirty: true }));
   * node.setState(); // Clear all state
   * ```
   */
  public setState(
    this: AbstractNode,
    input?: ((prev: NodeStateFlags) => NodeStateFlags) | NodeStateFlags,
    silent?: boolean,
  ) {
    const state = shallowPatch(this.__state__, input);
    if (state === void 0) return;
    this.__state__ = state;
    this.publish(EventType.UpdateState, state);
    if (silent !== true) this.__setGlobalState__(state);
  }

  /**
   * Sets state flags for all nodes in the subtree.
   * @param state - State flags to apply to all descendant nodes
   * @remarks Traverses all descendants using depth-first search.
   *          Updates `globalState` after all nodes are updated.
   */
  public setSubtreeState(this: AbstractNode, state: NodeStateFlags) {
    depthFirstSearch(this, (node) => node.setState(state, true));
    this.__setGlobalState__(state);
  }

  /**
   * Clears state flags for all nodes in the subtree.
   * @remarks If called on root node, also clears `globalState`.
   */
  public clearSubtreeState(this: AbstractNode) {
    depthFirstSearch(this, (node) => node.setState(undefined, true));
    if (this.isRoot) this.__setGlobalState__();
  }

  /** @internal Validation manager instance (root node only). */
  private __validationManager__: ValidationManager | undefined;

  /**
   * @internal Whether validation is enabled for this form.
   * @remarks Delegates to root node for child nodes.
   */
  protected get __validationEnabled__(): boolean {
    if (this.isRoot) return this.__validationManager__?.enabled === true;
    else return this.rootNode.__validationManager__?.enabled === true;
  }

  /**
   * Validates the node's current value against the JSON Schema.
   * @returns Promise resolving to array of validation errors
   * @remarks For child nodes, delegates to `rootNode.validate()`.
   *          Returns empty array if `ValidationMode.None` is configured.
   */
  public async validate(this: AbstractNode) {
    if (this.isRoot)
      await this.__validationManager__?.validate(this.__enhancedValue__);
    else await this.rootNode.validate();
    return this.globalErrors;
  }

  /**
   * @internal Additional data for validation including virtual/computed fields.
   * @remarks Virtual fields don't exist in actual value but need validation.
   *          Only used by root node.
   */
  private __enhancer__: Value | undefined;

  /**
   * @internal Value used for validation, merging actual value with enhancer.
   * @remarks Includes virtual field values for complete schema validation.
   */
  private get __enhancedValue__(): Value | Nullish {
    const value = this.value;
    if (this.group === 'terminal' || value == null) return value;
    const enhancer = this.__enhancer__;
    if (enhancer === undefined || isEmptyObject(enhancer)) return value;
    return merge(cloneLite(enhancer), value);
  }

  /**
   * Adds or updates a value in the enhancer for validation.
   * @param pointer - JSON Pointer path to the value location
   * @param value - Value to set (typically from virtual/computed fields)
   * @internal Delegates to root node for child nodes.
   */
  protected __adjustEnhancer__(
    this: AbstractNode,
    pointer: string,
    value: any,
  ) {
    if (this.isRoot) setValue(this.__enhancer__, pointer, value);
    else (this.rootNode as AbstractNode).__adjustEnhancer__(pointer, value);
  }

  /** @internal Error manager for this node. */
  private __errorManager__ = new ValidationErrorManager();

  /**
   * All validation errors from the entire form tree.
   * @remarks Merges internal validation errors with externally set errors.
   *          Delegates to root node for child nodes.
   */
  public get globalErrors(): ValidationError[] {
    if (this.isRoot) return this.__errorManager__.mergedGlobalErrors;
    else return this.rootNode.__errorManager__.mergedGlobalErrors;
  }

  /**
   * Validation errors specific to this node.
   * @remarks Merges local errors with externally set errors for this node.
   */
  public get errors(): ValidationError[] {
    return this.__errorManager__.mergedLocalErrors;
  }

  /**
   * Sets global errors from validation results.
   * @param errors - Array of validation errors
   * @returns `true` if unchanged (no publish needed), `false` if changed
   * @internal Publishes `UpdateGlobalError` event when errors change.
   */
  protected __setGlobalErrors__(this: AbstractNode, errors: ValidationError[]) {
    if (this.__errorManager__.setGlobalErrors(errors)) return true;
    this.publish(
      EventType.UpdateGlobalError,
      this.__errorManager__.mergedGlobalErrors,
    );
    return false;
  }

  /**
   * Sets validation errors for this node.
   * @param errors - Array of validation errors to set
   * @remarks Publishes `UpdateError` event when errors change.
   */
  public setErrors(this: AbstractNode, errors: ValidationError[]) {
    if (this.__errorManager__.setLocalErrors(errors)) return;
    this.publish(
      EventType.UpdateError,
      this.__errorManager__.mergedLocalErrors,
    );
  }

  /**
   * Clears validation errors for this node.
   * @remarks Does not clear externally set errors. Use `clearExternalErrors()` for those.
   */
  public clearErrors(this: AbstractNode) {
    this.setErrors([]);
  }

  /**
   * Sets external validation errors (e.g., from server-side validation).
   * @param errors - Array of external errors to set (default: empty array)
   * @remarks For root nodes, also updates `globalErrors`.
   *          Publishes `UpdateError` and optionally `UpdateGlobalError` events.
   */
  public setExternalErrors(this: AbstractNode, errors: ValidationError[] = []) {
    if (this.__errorManager__.setExternalErrors(errors, this.isRoot)) return;
    this.publish(
      EventType.UpdateError,
      this.__errorManager__.mergedLocalErrors,
    );
    if (this.isRoot)
      this.publish(
        EventType.UpdateGlobalError,
        this.__errorManager__.mergedGlobalErrors,
      );
  }

  /**
   * Clears external validation errors for this node.
   * @remarks Does not clear local or internal validation errors.
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
   * Removes specific errors from external errors.
   * @param errors - Errors to filter out
   * @internal Used when child nodes clear their external errors.
   */
  private __removeExternalErrors__(
    this: AbstractNode,
    errors: ValidationError[],
  ) {
    const filteredErrors = this.__errorManager__.filterExternalErrors(errors);
    if (filteredErrors !== null) this.setExternalErrors(filteredErrors);
  }

  /**
   * @internal Event manager handling publishing, subscription, and batching.
   * @remarks Encapsulates listener registration, event batching to prevent recursion,
   *          and dependency subscription cleanup.
   */
  private __eventManager__ = new EventCascadeManager(() => ({
    path: this.path,
    dependencies: this.__computeManager__.dependencyPaths,
  }));

  /**
   * Saves an unsubscribe function for cleanup during node destruction.
   * @param unsubscribe - Function to call when cleaning up subscriptions
   * @internal Used by computed property dependency subscriptions.
   */
  protected saveUnsubscribe(this: AbstractNode, unsubscribe: Fn) {
    this.__eventManager__.saveUnsubscribe(unsubscribe);
  }

  /**
   * Cleans up event subscriptions and listeners.
   * @param actor - The node requesting cleanup (must be parent or self if root)
   * @internal Called during node destruction or reinitialization.
   */
  protected __cleanUp__(this: AbstractNode, actor?: SchemaNode) {
    if (actor !== this.parentNode && !this.isRoot) return;
    this.__eventManager__.cleanUp();
  }

  /**
   * Publishes an event to all subscribed listeners.
   * @param type - Event type from `NodeEventType` enum
   * @param payload - Event-specific data
   * @param options - Event-specific options
   * @param immediate - If `true`, dispatch synchronously; otherwise batch via microtask
   */
  public publish<Type extends EventType>(
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
   * Subscribes to node events.
   * @param listener - Callback function receiving event data
   * @returns Unsubscribe function to remove the listener
   * @example
   * ```ts
   * const unsubscribe = node.subscribe(({ type, payload }) => {
   *   if (type & NodeEventType.UpdateValue) {
   *     console.log('Value changed:', payload);
   *   }
   * });
   * // Later: unsubscribe();
   * ```
   */
  public subscribe(this: AbstractNode, listener: NodeListener): Fn {
    return this.__eventManager__.subscribe(listener);
  }

  /**
   * @internal Injection guard manager to prevent circular injection loops.
   * @remarks Only initialized on root node. Tracks paths currently being injected
   *          and coordinates deferred cleanup across all nodes.
   */
  private __injectionGuardManager__: InjectionGuardManager | undefined;

  /**
   * @internal Accessor for injection guard manager from any node.
   * @remarks Root nodes return their own instance; child nodes delegate to root.
   */
  private get __injectionGuard__() {
    if (this.isRoot) return this.__injectionGuardManager__;
    return this.rootNode.__injectionGuardManager__;
  }

  /**
   * Sets up the `injectTo` schema property handler.
   * @internal Subscribes to value updates and propagates values to target nodes.
   *           Implements circular injection prevention using guard flags.
   */
  private __prepareInjectHandler__(this: AbstractNode) {
    if (this.__initialized__) return;
    const injectHandler = this.jsonSchema.injectTo;
    if (typeof injectHandler !== 'function') return;
    this.subscribe(({ type, options }) => {
      if (type & EventType.UpdateValue) {
        if (options?.[EventType.UpdateValue]?.inject)
          this.publish(EventType.RequestInjection);
        return;
      }
      if (type & EventType.RequestInjection) {
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

  /** @internal Flag indicating initialization completion. */
  private __initialized__: boolean = false;

  /**
   * Whether the node has completed initialization.
   * @remarks Initialization sets up dependency subscriptions and `injectTo` handlers.
   */
  public get initialized() {
    return this.__initialized__;
  }

  /**
   * Initializes the node's reactive features.
   * @param actor - Node requesting initialization (must be parent or self if root)
   * @returns `true` if initialization occurred, `false` if skipped
   * @internal Sets up dependency subscriptions, `injectTo` handlers, and publishes `Initialized` event.
   */
  protected __initialize__(this: AbstractNode, actor?: SchemaNode) {
    if (this.__initialized__ || (actor !== this.parentNode && !this.isRoot))
      return false;
    this.__prepareUpdateDependencies__();
    this.__prepareInjectHandler__();
    this.publish(EventType.Initialized);
    this.__initialized__ = true;
    return true;
  }

  /**
   * Resets the node to its initial or derived value.
   * @param options - Reset configuration
   * @param options.updateScoped - Update scoped state for `oneOf`/`anyOf` branches
   * @param options.preferLatest - Prefer current value over default
   * @param options.checkDefaultValueFirst - Check default value before current value
   * @param options.inputValue - Explicit value with highest priority
   * @param options.fallbackValue - Fallback when no other value available
   * @param options.applyDerivedValue - Apply computed derived value if available
   * @internal Value priority: `inputValue` > `derivedValue` > `fallbackValue`/`defaultValue`
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
      this.active &&
      this.__computeManager__.isDerivedDefined
    )
      value = this.__computeManager__.getDerivedValue() ?? value;

    this.setValue(
      this.__computeManager__.active ? value : undefined,
      SetValueOption.StableReset,
    );
    this.setState();
  }

  /**
   * Resets this node and all descendants to their initial values.
   * @remarks Clears all state flags in the subtree before resetting values.
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
