import { isArray } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

import type { AbstractNode } from '@/schema-form/core/nodes/AbstractNode';
import type { ArrayNode } from '@/schema-form/core/nodes/ArrayNode';
import {
  type ChildNode,
  type HandleChange,
  NodeEventType,
  type SchemaNode,
  type SchemaNodeFactory,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
import type { AllowedValue, ArrayValue } from '@/schema-form/types';

import type { ArrayNodeStrategy } from '../type';
import { promiseAfterMicrotask } from './utils';

type ChildSegmentKey = `${number}#${number}`;

export class BranchStrategy implements ArrayNodeStrategy {
  /** Host ArrayNode instance that this strategy belongs to */
  private readonly __host__: ArrayNode;

  /** Callback function to handle value changes */
  private readonly __handleChange__: HandleChange<ArrayValue | undefined>;

  /** Callback function to handle refresh operations */
  private readonly __handleRefresh__: Fn<[ArrayValue | undefined]>;

  /** Factory function for creating new schema nodes */
  private readonly __nodeFactory__: SchemaNodeFactory;

  /** Flag indicating whether the strategy is locked to prevent recursive updates */
  private __locked__: boolean = true;

  /**
   * Flag indicating whether the strategy is in batch mode.
   *
   * Batch mode behavior:
   * - true: Changes are queued via RequestEmitChange event for batch processing
   * - false: Changes are emitted immediately for synchronous updates
   *
   * Batch mode is automatically enabled for:
   * - Programmatic API calls (push, pop, update, remove, clear, setValue on nodes)
   * - Child node onChange requests for batch updates
   * - Form initialization and bulk updates
   *
   * Batch mode is disabled after:
   * - RequestEmitChange event is processed (one batch cycle complete)
   * - User input through UI components (requires immediate feedback)
   */
  private __batched__: boolean = true;

  /** Flag indicating whether the array has pending changes that need to be emitted */
  private __dirty__: boolean = true;

  /** Flag indicating whether the array value should be treated as undefined */
  private __undefined__: boolean = false;

  /** Setter for dirty flag that also resets undefined state when changes occur */
  private set __changed__(input: boolean) {
    this.__dirty__ = input;
    if (this.__undefined__) this.__undefined__ = false;
  }

  /** Revision counter for generating unique keys for array elements */
  private __revision__: number = 0;

  /** Array of unique keys for each element in the array, maintaining order */
  private __keys__: ChildSegmentKey[] = [];

  /** Map storing actual data and corresponding schema nodes for each array element */
  private __sourceMap__: Map<
    ChildSegmentKey,
    {
      data: any;
      node: SchemaNode;
    }
  > = new Map();

  /**
   * Gets the current value of the array.
   * @returns Current value of the array node or undefined (if empty)
   */
  public get value() {
    if (this.__undefined__) return undefined;
    return this.__toArray__();
  }

  /**
   * Applies input value to the array node.
   * @param input - Array value to set
   * @param option - Setting options
   */
  public applyValue(input: ArrayValue, option: UnionSetValueOption) {
    if (input === undefined) {
      this.clear();
      this.__undefined__ = true;
      this.__emitChange__(option);
    } else if (isArray(input)) {
      this.__locked__ = true;
      this.clear();
      for (const value of input) this.push(value);
      this.__locked__ = false;
      this.__emitChange__(option);
    }
  }

  /**
   * Gets the child nodes of the array node.
   * @returns List of child nodes
   */
  public get children() {
    return this.__edges__;
  }

  /**
   * Gets the current length of the array.
   * @returns Length of the array
   */
  public get length() {
    return this.__keys__.length;
  }

  /**
   * Propagates activation to all child nodes.
   * @internal Internal implementation method. Do not call directly.
   */
  public activate() {
    for (const key of this.__keys__)
      (this.__sourceMap__.get(key)?.node as AbstractNode)?.activate(
        this.__host__,
      );
  }

  /**
   * Initializes the BranchStrategy object.
   * @param host - Host ArrayNode object
   * @param handleChange - Value change handler
   * @param handleRefresh - Refresh handler
   * @param handleSetDefaultValue - Default value setting handler
   * @param nodeFactory - Node creation factory
   */
  constructor(
    host: ArrayNode,
    handleChange: HandleChange<ArrayValue | undefined>,
    handleRefresh: Fn<[ArrayValue | undefined]>,
    handleSetDefaultValue: Fn<[ArrayValue | undefined]>,
    nodeFactory: SchemaNodeFactory,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__handleRefresh__ = handleRefresh;
    this.__nodeFactory__ = nodeFactory;

    // NOTE: If defaultValue is an array and its length is greater than 0, push each value to the array.
    if (host.defaultValue?.length)
      for (const value of host.defaultValue) this.push(value);

    while (this.length < (host.jsonSchema.minItems || 0)) this.push();

    host.subscribe(({ type, payload }) => {
      if (type & NodeEventType.RequestEmitChange) {
        this.__handleEmitChange__(payload?.[NodeEventType.RequestEmitChange]);
        this.__batched__ = false;
      }
    });

    this.__locked__ = false;

    this.__emitChange__();
    handleSetDefaultValue(this.value);
    this.__publishUpdateChildren__();
  }

  /**
   * Adds a new element to the array.
   * @param data - Value to add (optional)
   * @returns Returns itself (this) for method chaining
   */
  public push(data?: ArrayValue[number]) {
    if (
      this.__host__.jsonSchema.maxItems &&
      this.__host__.jsonSchema.maxItems <= this.length
    )
      return promiseAfterMicrotask(this.length);

    this.__batched__ = true;
    const index = '' + this.__keys__.length;
    const key = (index + '#' + this.__revision__++) as ChildSegmentKey;
    this.__keys__.push(key);

    const defaultValue =
      data !== undefined
        ? data
        : getDefaultValue(this.__host__.jsonSchema.items);
    const childNode = this.__nodeFactory__({
      key: key,
      name: index,
      jsonSchema: this.__host__.jsonSchema.items,
      parentNode: this.__host__,
      defaultValue,
      onChange: this.__handleChangeFactory__(key),
      nodeFactory: this.__nodeFactory__,
    });
    this.__sourceMap__.set(key, {
      node: childNode,
      data: childNode.value,
    });

    if (this.__host__.activated)
      (childNode as AbstractNode).activate(this.__host__);

    this.__changed__ = true;
    this.__handleEmitChange__();
    this.__publishUpdateChildren__();

    return promiseAfterMicrotask(this.length);
  }

  /**
   * Updates the value of a specific element.
   * @param index - Index of the element to update
   * @param data - New value
   * @returns Returns itself (this) for method chaining
   */
  public update(index: number, data: ArrayValue[number]) {
    const node = this.__sourceMap__.get(this.__keys__[index])?.node;
    if (!node) return promiseAfterMicrotask(undefined);

    this.__batched__ = true;
    node.setValue(data);
    return promiseAfterMicrotask(node.value);
  }

  /**
   * Removes a specific element.
   * @param index - Index of the element to remove
   * @returns Returns itself (this) for method chaining
   */
  public remove(index: number) {
    const targetId = this.__keys__[index];
    const removed = this.__sourceMap__.get(targetId);
    if (!removed) return promiseAfterMicrotask(undefined);

    this.__batched__ = true;
    this.__keys__ = this.__keys__.filter((key) => key !== targetId);
    this.__sourceMap__.delete(targetId);
    this.__updateChildName__();

    this.__changed__ = true;
    this.__emitChange__();
    this.__publishUpdateChildren__();

    return promiseAfterMicrotask(removed.data);
  }

  /** Removes the last element from the array. */
  public pop() {
    if (this.length === 0) return promiseAfterMicrotask(undefined);
    return this.remove(this.length - 1);
  }

  /** Clears all elements to initialize the array. */
  public clear() {
    this.__batched__ = true;
    for (let i = 0, l = this.__keys__.length; i < l; i++)
      this.__sourceMap__.get(this.__keys__[i])?.node.cleanUp(this.__host__);
    this.__keys__ = [];
    this.__sourceMap__.clear();
    this.__changed__ = true;
    this.__emitChange__();
    this.__publishUpdateChildren__();

    return promiseAfterMicrotask(void 0);
  }

  /**
   * Determines whether to queue or immediately process value changes.
   *
   * In batch mode: Publishes RequestEmitChange event for deferred processing
   * In sync mode: Immediately calls handleEmitChange for instant updates
   *
   * @param option - Change options (optional)
   * @private
   */
  private __emitChange__(option?: UnionSetValueOption) {
    if (this.__batched__)
      this.__host__.publish({
        type: NodeEventType.RequestEmitChange,
        payload: { [NodeEventType.RequestEmitChange]: option },
      });
    else this.__handleEmitChange__(option);
  }

  /**
   * Emits a value change event.
   * @param option - Option settings (default: SetValueOption.Default)
   * @private
   */
  private __handleEmitChange__(
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    if (this.__locked__ || !this.__dirty__) return;
    const value = this.value;

    if (option & SetValueOption.EmitChange)
      this.__handleChange__(value, !!(option & SetValueOption.Batch));
    if (option & SetValueOption.Propagate) this.__publishUpdateChildren__();
    if (option & SetValueOption.Refresh) this.__handleRefresh__(value);
    if (option & SetValueOption.PublishUpdateEvent)
      this.__host__.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: value },
        options: {
          [NodeEventType.UpdateValue]: {
            previous: undefined,
            current: value,
          },
        },
      });
    this.__dirty__ = false;
  }

  /**
   * Gets information about child nodes.
   * @returns Array containing key and node information
   * @private
   */
  private get __edges__() {
    const edges = new Array<ChildNode>(this.__keys__.length);
    for (let i = 0, l = this.__keys__.length; i < l; i++) {
      const key = this.__keys__[i];
      edges[i] = {
        key: key,
        node: this.__sourceMap__.get(key)!.node,
      };
    }
    return edges;
  }
  /**
   * Converts internal array state to an object array.
   * @returns Array containing the values of the array
   * @private
   */
  private __toArray__() {
    const values = new Array<AllowedValue>(this.__keys__.length);
    for (let i = 0, l = this.__keys__.length; i < l; i++) {
      const edge = this.__sourceMap__.get(this.__keys__[i]);
      if (edge) values[i] = edge.data;
    }
    return values;
  }

  /**
   * Creates a function to handle value changes for a specific element.
   * @param key - Child node Key
   * @returns {HandleChange} Value change handler
   * @private
   */
  private __handleChangeFactory__(key: ChildSegmentKey): HandleChange {
    return (input, batch) => {
      if (!this.__sourceMap__.has(key)) return;
      this.__sourceMap__.get(key)!.data = input;
      this.__changed__ = true;
      if (this.__locked__) return;
      if (batch) this.__batched__ = true;
      this.__emitChange__();
    };
  }

  /**
   * Updates the names of array elements.
   * @private
   */
  private __updateChildName__() {
    for (let i = 0, l = this.__keys__.length; i < l; i++) {
      const key = this.__keys__[i];
      if (this.__sourceMap__.has(key)) {
        const node = this.__sourceMap__.get(key)!.node;
        const name = i.toString();
        if (node.name !== name) node.setName(name, this.__host__);
      }
    }
  }

  /**
   * Publishes a child node update event.
   * @private
   */
  private __publishUpdateChildren__() {
    if (this.__locked__) return;
    this.__host__.publish({ type: NodeEventType.UpdateChildren });
  }
}
