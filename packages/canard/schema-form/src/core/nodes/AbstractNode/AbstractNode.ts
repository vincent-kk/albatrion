import { map } from '@winglet/common-utils/array';
import { isArray, isEmptyObject, isObject } from '@winglet/common-utils/filter';
import { cloneLite, equals, merge } from '@winglet/common-utils/object';
import { scheduleMacrotaskSafe } from '@winglet/common-utils/scheduler';
import { escapeSegment, setValue } from '@winglet/json/pointer';

import type { Dictionary, Fn, Nullish } from '@aileron/declare';

import { UNIT_SEPARATOR } from '@/schema-form/app/constants';
import { PluginManager } from '@/schema-form/app/plugin';
import { JsonSchemaError } from '@/schema-form/errors';
import {
  getDefaultValue,
  getEmptyValue,
} from '@/schema-form/helpers/defaultValue';
import {
  formatCircularReferenceError,
  formatInjectToError,
  transformErrors,
} from '@/schema-form/helpers/error';
import {
  JSONPointer as $,
  getAbsolutePath,
  isAbsolutePath,
  joinSegment,
} from '@/schema-form/helpers/jsonPointer';
import { stripSchemaExtensions } from '@/schema-form/helpers/jsonSchema';
import type {
  AllowedValue,
  InjectHandlerContext,
  JsonSchemaType,
  JsonSchemaWithVirtual,
  ValidateFunction,
  JsonSchemaError as ValidationError,
  ValidatorFactory,
} from '@/schema-form/types';

import {
  type ChildNode,
  type HandleChange,
  type NodeEventCollection,
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
  EventCascade,
  afterMicrotask,
  checkDefinedValue,
  computeFactory,
  depthFirstSearch,
  findNode,
  findNodes,
  getEventCollection,
  getFallbackValidator,
  getNodeGroup,
  getSafeEmptyValue,
  getScopedSegment,
  matchesSchemaPath,
} from './utils';

const RECURSIVE_ERROR_OMITTED_KEYS = new Set(['key']);

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

  /** [readonly] Node's depth */
  public readonly depth: number;

  /** [readonly] Whether this is the root node */
  public readonly isRoot: boolean;

  /** [readonly] Root node */
  public readonly rootNode: SchemaNode;

  /** [readonly] Node's parent node */
  public readonly parentNode: SchemaNode | null;

  /** [readonly] Node's JSON Schema */
  public readonly jsonSchema: Schema;

  /** [readonly] Node's scope */
  public readonly scope: string | undefined;

  /** [readonly] Node's variant */
  public readonly variant: number | undefined;

  /** [readonly] Whether the node value is required */
  public readonly required: boolean;

  /** [readonly] Whether the node value is nullable */
  public readonly nullable: boolean;

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

  /** Context node reference for form-wide shared data */
  private __contextNode__: AbstractNode | null;

  /**
   * [readonly] Context node for accessing form-wide shared data
   * @note Root nodes return their own context, child nodes delegate to rootNode.context
   */
  public get context(): Dictionary {
    return this.__contextNode__?.value || {};
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
    if (this.__active__ && this.__scoped__) this.__handleChange__(input, batch);
    else if (input === undefined) this.__handleChange__(undefined, batch);
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
    this.__compute__ = computeFactory(
      this.schemaType,
      this.jsonSchema,
      this.rootNode.jsonSchema,
    );

    this.__setDefaultValue__(
      defaultValue !== undefined ? defaultValue : getDefaultValue(jsonSchema),
    );
    this.__updateScoped__();

    if (this.isRoot) {
      const validateOnChange = validationMode
        ? (validationMode & ValidationMode.OnChange) > 0
        : false;
      this.__handleChange__ = afterMicrotask(() => {
        if (validateOnChange) this.__handleValidation__();
        onChange(getSafeEmptyValue(this.value, this.schemaType));
      });
      this.__prepareValidator__(jsonSchema, validatorFactory, validationMode);
      this.__injectedPaths__ = new Set();
    } else this.__handleChange__ = onChange;
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

  /**
   * Set of registered event listeners for this node.
   * @note Listeners receive batched events via EventCascade for performance optimization.
   */
  private __listeners__: Set<NodeListener> = new Set();

  /**
   * Event batching system that collects multiple events and publishes them together.
   * @note Improves performance by reducing the number of listener invocations
   *       when multiple events occur in rapid succession.
   */
  private __eventCascade__ = new EventCascade(
    (eventCollection: NodeEventCollection) => {
      for (const listener of this.__listeners__) listener(eventCollection);
    },
    () => ({ path: this.path, dependencies: this.__compute__.dependencyPaths }),
  );

  /**
   * Array of cleanup functions for subscriptions to other nodes.
   * @note Stores unsubscribe functions from dependency subscriptions.
   *       Called during cleanUp() to prevent memory leaks.
   */
  private __unsubscribes__: Array<Fn> = [];

  /**
   * Saves an event unsubscribe function.
   * @param unsubscribe - The unsubscribe function to save
   */
  protected saveUnsubscribe(this: AbstractNode, unsubscribe: Fn) {
    this.__unsubscribes__.push(unsubscribe);
  }

  /* Cancels all saved event subscriptions. */
  private __clearUnsubscribes__(this: AbstractNode) {
    for (let i = 0, l = this.__unsubscribes__.length; i < l; i++)
      this.__unsubscribes__[i]();
    this.__unsubscribes__ = [];
  }

  /**
   * Initializes the node's event listener/subscription list. Initialization must be called by itself or by the parent node.
   * @param actor - The node requesting initialization
   */
  protected __cleanUp__(this: AbstractNode, actor?: SchemaNode) {
    if (actor !== this.parentNode && !this.isRoot) return;
    this.__clearUnsubscribes__();
    this.__listeners__.clear();
  }

  /**
   * Publishes an event to the node's listeners
   * @param type - Event type (see NodeEventType)
   * @param payload - Data for the event (see NodeEventPayload)
   * @param options - Options for the event (see NodeEventOptions)
   * @param immediate - If true, executes listeners synchronously; if false, batches event via EventCascade
   */
  public publish<Type extends NodeEventType>(
    this: AbstractNode,
    type: Type,
    payload?: NodeEventPayload[Type],
    options?: NodeEventOptions[Type],
    immediate?: boolean,
  ) {
    if (immediate) {
      const eventCollection = getEventCollection(type, payload, options);
      for (const listener of this.__listeners__) listener(eventCollection);
    } else this.__eventCascade__.schedule([type, payload, options]);
  }

  /**
   * Registers a node event listener
   * @param listener Event listener
   * @returns Event listener removal function
   */
  public subscribe(this: AbstractNode, listener: NodeListener): Fn {
    this.__listeners__.add(listener);
    return () => {
      this.__listeners__.delete(listener);
    };
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
  private __compute__: ReturnType<typeof computeFactory>;

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
   * Whether the node is active based on computed.active evaluation.
   * @note Inactive nodes don't propagate values to parent but retain their internal state.
   */
  private __active__: boolean = true;

  /**
   * Whether this node is currently active and can participate in value updates.
   * @returns `true` if both `__active__` (computed) and `__scoped__` (branch) conditions are met
   * @note An inactive node's value is excluded from the parent's value composition.
   */
  public get active() {
    return this.__active__ && this.__scoped__;
  }

  /**
   * Whether the node should be rendered in the UI based on computed.visible evaluation.
   * @note Invisible nodes still participate in validation and value composition.
   */
  private __visible__: boolean = true;

  /**
   * Whether this node should be displayed in the UI.
   * @returns `true` if computed.visible evaluates to true (or is not defined)
   * @note Visibility only affects rendering; invisible nodes still hold values.
   */
  public get visible() {
    return this.__visible__;
  }

  /**
   * Whether this node is fully enabled for rendering and interaction.
   * @returns `true` if the node is active, scoped, and visible
   * @note Use this to determine if a form field should be rendered and interactive.
   */
  public get enabled() {
    return this.__active__ && this.__scoped__ && this.__visible__;
  }

  /**
   * Whether the node's value is read-only based on computed.readOnly evaluation.
   * @note Read-only nodes display values but prevent user modification.
   */
  private __readOnly__: boolean = false;

  /**
   * Whether this node's value cannot be modified by user interaction.
   * @returns `true` if computed.readOnly evaluates to true
   * @note The value can still be changed programmatically via setValue().
   */
  public get readOnly() {
    return this.__readOnly__;
  }

  /**
   * Whether the node is disabled based on computed.disabled evaluation.
   * @note Disabled nodes are typically grayed out and non-interactive.
   */
  private __disabled__: boolean = false;

  /**
   * Whether this node is disabled for user interaction.
   * @returns `true` if computed.disabled evaluates to true
   * @note Unlike readOnly, disabled typically affects the visual appearance more significantly.
   */
  public get disabled() {
    return this.__disabled__;
  }

  /**
   * Index of the currently active oneOf branch.
   * @note -1 indicates no oneOf branch is active or oneOf is not defined.
   */
  private __oneOfIndex__: number = -1;

  /**
   * The index of the currently active oneOf schema branch.
   * @returns Branch index (0-based), or -1 if no branch is active
   * @note Used by child nodes to determine their `__scoped__` state.
   */
  public get oneOfIndex() {
    return this.__oneOfIndex__;
  }

  /**
   * Indices of currently active anyOf branches.
   * @note Empty array indicates no anyOf branches are active or anyOf is not defined.
   */
  private __anyOfIndices__: number[] = [];

  /**
   * The indices of currently active anyOf schema branches.
   * @returns Array of branch indices (0-based), empty if none active
   * @note Multiple branches can be active simultaneously with anyOf.
   */
  public get anyOfIndices() {
    return this.__anyOfIndices__;
  }

  /**
   * Array of computed values derived from dependencies for watch functionality.
   * @note Used by UI frameworks to trigger re-renders when specific computed values change.
   */
  private __watchValues__: ReadonlyArray<any> = [];

  /**
   * Computed values from dependencies that can trigger UI updates.
   * @returns Readonly array of values computed from dependency paths
   * @note Useful for React useMemo/useEffect dependencies or similar reactive patterns.
   */
  public get watchValues() {
    return this.__watchValues__;
  }

  /** Prepares dependencies for update computation. */
  private __prepareUpdateDependencies__(this: AbstractNode) {
    if (this.__initialized__) return;
    const dependencyPaths = this.__compute__.dependencyPaths;
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
    if (this.__compute__.derivedValue || this.__compute__.pristine)
      this.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateComputedProperties) {
          if (this.__compute__.derivedValue) {
            const derivedValue = this.__compute__.derivedValue(
              this.__dependencies__,
            );
            if (this.active && !this.__equals__(this.value, derivedValue))
              this.setValue(derivedValue);
          }
          if (this.__compute__.pristine?.(this.__dependencies__))
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
    const previous = this.__active__;
    this.__active__ = this.__compute__.active?.(this.__dependencies__) ?? true;
    this.__visible__ =
      this.__compute__.visible?.(this.__dependencies__) ?? true;
    this.__readOnly__ =
      this.__compute__.readOnly?.(this.__dependencies__) ?? false;
    this.__disabled__ =
      this.__compute__.disabled?.(this.__dependencies__) ?? false;
    this.__oneOfIndex__ =
      this.__compute__.oneOfIndex?.(this.__dependencies__) ?? -1;
    this.__anyOfIndices__ =
      this.__compute__.anyOfIndices?.(this.__dependencies__) || [];
    this.__watchValues__ =
      this.__compute__.watchValues?.(this.__dependencies__) || [];

    if (reset && previous !== this.__active__)
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

    let value;
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
      this.__compute__.derivedValue &&
      this.active
    )
      value = this.__compute__.derivedValue(this.__dependencies__) ?? value;

    this.setValue(
      this.__active__ ? value : undefined,
      SetValueOption.StableReset,
    );
    this.setState();
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

  /**
   * Resets the subtree.
   * @param this - The node to reset the subtree for.
   * @returns void
   */
  public resetSubtree(this: AbstractNode) {
    this.clearSubtreeState();
    this.__reset__();
  }

  /**
   * Set of data paths currently being injected.
   * @remarks **[Root Node Only]** Only initialized and used by the root node.
   *          Tracks which nodes are currently being injected to prevent circular injection loops.
   *          Child nodes delegate injection tracking to `rootNode`.
   */
  private __injectedPaths__: Set<SchemaNode['path']> | undefined;

  /**
   * Scheduled macrotask ID for clearing injected node flags.
   * @remarks **[Root Node Only]** Used to batch clear injected flags after all
   *          synchronous injection operations complete. The ID prevents duplicate scheduling.
   */
  private __scheduledClearInjectedPathsId__: number | undefined;

  /**
   * Checks if a node at the given path is currently being injected.
   * @param path - The data path of the node to check
   * @returns {boolean} Whether the node is currently being injected
   * @note Root nodes check their own flag set, child nodes delegate to rootNode.
   */
  protected __isInjectedPath__(
    this: AbstractNode,
    path: SchemaNode['path'],
  ): boolean {
    if (this.isRoot) return this.__injectedPaths__?.has(path) ?? false;
    else return (this.rootNode as AbstractNode).__isInjectedPath__(path);
  }

  /**
   * Sets the injected flag for a node at the given path.
   * @param path - The data path of the node to mark as injected
   * @note Used to prevent circular injection when `injectTo` affects multiple nodes.
   */
  protected __setInjectedPath__(this: AbstractNode, path: SchemaNode['path']) {
    if (this.isRoot) this.__injectedPaths__?.add(path);
    else (this.rootNode as AbstractNode).__setInjectedPath__(path);
  }

  /**
   * Removes the injected flag for a node at the given path.
   * @param path - The data path of the node to unmark
   */
  protected __unsetInjectedPath__(
    this: AbstractNode,
    path: SchemaNode['path'],
  ) {
    if (this.isRoot) this.__injectedPaths__?.delete(path);
    else (this.rootNode as AbstractNode).__unsetInjectedPath__(path);
  }

  /**
   * Clears all injected node flags immediately.
   * @note Typically used for cleanup or reset operations.
   */
  protected __clearInjectedPaths__(this: AbstractNode) {
    if (this.isRoot) this.__injectedPaths__?.clear();
    else (this.rootNode as AbstractNode).__clearInjectedPaths__();
  }

  /**
   * Schedules clearing of all injected node flags in a macrotask.
   * @note Uses macrotask scheduling to ensure all synchronous injection operations
   *       complete before clearing flags. Prevents duplicate scheduling if already scheduled.
   *       This allows multiple `injectTo` operations to complete within the same
   *       synchronous execution context before the flags are cleared.
   */
  protected __scheduleClearInjectedPaths__(this: AbstractNode) {
    if (this.isRoot) {
      if (this.__scheduledClearInjectedPathsId__ !== undefined) return;
      this.__scheduledClearInjectedPathsId__ = scheduleMacrotaskSafe(() => {
        this.__scheduledClearInjectedPathsId__ = undefined;
        this.__injectedPaths__?.clear();
      });
    } else (this.rootNode as AbstractNode).__scheduleClearInjectedPaths__();
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
          this.__setInjectedPath__(dataPath);
          const affect = injectHandler(value, context);
          if (affect == null) return;
          const operations = isArray(affect) ? affect : Object.entries(affect);
          for (let i = 0, l = operations.length; i < l; i++) {
            const path = getAbsolutePath(dataPath, operations[i][0]);
            if (this.__isInjectedPath__(path)) continue;
            this.__setInjectedPath__(path);
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
          this.__scheduleClearInjectedPaths__();
        }
      }
    });
  }

  /**
   * List of data paths that had validation errors in the last validation run.
   * @remarks **[Root Node Only]** Used to clear errors from nodes that no longer have errors
   *          after a subsequent validation run.
   */
  private __errorDataPaths__: string[] | undefined;

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
  private __mergedGlobalErrors__: ValidationError[] = [];

  /**
   * Combined array of local validation errors and external errors for this node.
   * @note This is the primary error array exposed via the `errors` getter.
   */
  private __mergedLocalErrors__: ValidationError[] = [];

  /**
   * Errors provided externally (e.g., from server-side validation).
   * @note External errors are merged with local errors but tracked separately
   *       for independent clearing via clearExternalErrors().
   */
  private __externalErrors__: ValidationError[] = [];

  /**
   * Returns the merged result of errors that occurred inside the form and externally received errors.
   * @returns All of the errors that occurred inside the form and externally received errors
   */
  public get globalErrors(): ValidationError[] {
    return this.isRoot
      ? this.__mergedGlobalErrors__
      : this.rootNode.globalErrors;
  }

  /**
   * Returns the merged result of own errors and externally received errors.
   * @returns Local errors and externally received errors
   */
  public get errors(): ValidationError[] {
    return this.__mergedLocalErrors__;
  }

  /**
   * Merges externally received errors into the global errors.
   * @param errors - List of errors to set
   * @returns {boolean} Whether the merge result changed
   */
  private __setGlobalErrors__(this: AbstractNode, errors: ValidationError[]) {
    if (equals(this.__globalErrors__, errors)) return false;
    this.__globalErrors__ = errors;
    this.__mergedGlobalErrors__ = [
      ...this.__externalErrors__,
      ...this.__globalErrors__,
    ];
    this.publish(NodeEventType.UpdateGlobalError, this.__mergedGlobalErrors__);
    return true;
  }

  /**
   * Updates own errors and then merges them with externally received errors.
   * @param errors - List of errors to set
   */
  public setErrors(this: AbstractNode, errors: ValidationError[]) {
    if (equals(this.__localErrors__, errors)) return;
    this.__localErrors__ = errors;
    this.__mergedLocalErrors__ = [
      ...this.__externalErrors__,
      ...this.__localErrors__,
    ];
    this.publish(NodeEventType.UpdateError, this.__mergedLocalErrors__);
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
    if (equals(this.__externalErrors__, errors, RECURSIVE_ERROR_OMITTED_KEYS))
      return;

    this.__externalErrors__ = new Array<ValidationError>(errors.length);
    for (let i = 0, l = errors.length; i < l; i++)
      this.__externalErrors__[i] = { ...errors[i], key: i };

    this.__mergedLocalErrors__ = this.__localErrors__
      ? [...this.__externalErrors__, ...this.__localErrors__]
      : this.__externalErrors__;
    this.publish(NodeEventType.UpdateError, this.__mergedLocalErrors__);

    if (this.isRoot) {
      this.__mergedGlobalErrors__ = this.__globalErrors__
        ? [...this.__externalErrors__, ...this.__globalErrors__]
        : this.__externalErrors__;
      this.publish(
        NodeEventType.UpdateGlobalError,
        this.__mergedGlobalErrors__,
      );
    }
  }

  /**
   * Clears externally received errors.
   * @note Does not clear localErrors / internalErrors.
   */
  public clearExternalErrors(this: AbstractNode) {
    if (this.__externalErrors__.length === 0) return;
    if (!this.isRoot)
      (this.rootNode as AbstractNode).__removeExternalErrors__(
        this.__externalErrors__,
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
    const deleteKeys: Array<number> = [];
    for (const error of errors)
      if (typeof error.key === 'number') deleteKeys.push(error.key);
    const nextErrors: ValidationError[] = [];
    for (const error of this.__externalErrors__)
      if (!error.key || !deleteKeys.includes(error.key)) nextErrors.push(error);
    if (this.__externalErrors__.length !== nextErrors.length)
      this.setExternalErrors(nextErrors);
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

  /**
   * Compiled validator function for schema validation.
   * @note Only initialized for root node when validationMode is set.
   *       Created from validatorFactory or PluginManager.validator.
   */
  private __validator__: ValidateFunction | undefined;

  /**
   * Performs validation using the node's JsonSchema
   * @note Only available for rootNode
   * */
  private async __validate__(
    this: AbstractNode,
    value: Value | Nullish,
  ): Promise<ValidationError[]> {
    if (this.__validator__ === undefined) return [];
    const errors = await this.__validator__(value);
    if (errors === null) return [];
    else return transformErrors(errors);
  }

  /**
   * Performs validation when own value changes
   * @note Only works for rootNode
   */
  private async __handleValidation__(this: AbstractNode) {
    if (this.isRoot === false || this.__validator__ === undefined) return;

    const internalErrors = await this.__validate__(this.__enhancedValue__);

    if (this.__setGlobalErrors__(internalErrors) === false) return;

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
        this.find(dataPath)?.clearErrors();
      }

    for (const [dataPath, errors] of errorsByDataPath) {
      const childNode = this.find(dataPath);
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

  /**
   * Performs validation based on the current value.
   * @returns {Promise<ValidationError[]>} List of errors that occurred inside the form
   * @note If `ValidationMode.None` is set, an empty array is returned.
   */
  public async validate(this: AbstractNode) {
    if (this.isRoot) await this.__handleValidation__();
    else await this.rootNode.validate();
    return this.globalErrors;
  }

  /** [readonly] Whether validation is enabled for this form */
  protected get __validationEnabled__(): boolean {
    return this.isRoot
      ? this.__validator__ !== undefined
      : (this.rootNode as AbstractNode).__validationEnabled__;
  }

  /**
   * Prepares validator, only available for rootNode
   * @param validator ValidatorFactory, creates new one if not provided
   */
  private __prepareValidator__(
    this: AbstractNode,
    jsonSchema: JsonSchemaWithVirtual,
    validatorFactory?: ValidatorFactory,
    validationMode?: ValidationMode,
  ) {
    if (!validationMode) return;
    const schema = stripSchemaExtensions(jsonSchema);
    try {
      this.__validator__ =
        validatorFactory?.(schema) || PluginManager.validator?.compile(schema);
      if (this.__validator__ !== undefined)
        this.__enhancer__ = getEmptyValue(this.schemaType);
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
}
