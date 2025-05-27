import { isArray } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { AbstractNode } from '@/schema-form/core/nodes/AbstractNode';
import type { ArrayNode } from '@/schema-form/core/nodes/ArrayNode';
import {
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

type IndexId = `[${number}]`;

export class BranchStrategy implements ArrayNodeStrategy {
  /** Host ArrayNode instance that this strategy belongs to */
  private __host__: ArrayNode;

  /** Callback function to handle value changes */
  private __handleChange__: Fn<[ArrayValue | undefined]>;

  /** Callback function to handle refresh operations */
  private __handleRefresh__: Fn<[ArrayValue | undefined]>;

  /** Factory function for creating new schema nodes */
  private __nodeFactory__: SchemaNodeFactory;

  /** Flag indicating whether the strategy is locked to prevent recursive updates */
  private __locked__: boolean = true;

  /** Flag indicating whether the array has pending changes that need to be emitted */
  private __dirty__: boolean = true;

  /** Flag indicating whether the array value should be treated as undefined */
  private __undefined__: boolean = false;

  /** Setter for dirty flag that also resets undefined state when changes occur */
  private set __changed__(input: boolean) {
    this.__dirty__ = input;
    if (this.__undefined__) this.__undefined__ = false;
  }

  /** Sequence counter for generating unique IDs for array elements */
  private __seq__: number = 0;

  /** Array of unique IDs for each element in the array, maintaining order */
  private __ids__: IndexId[] = [];

  /** Map storing actual data and corresponding schema nodes for each array element */
  private __sourceMap__: Map<
    IndexId,
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
      this.__publishRequestEmitChange__(option);
    } else if (isArray(input)) {
      this.__locked__ = true;
      this.clear();
      for (const value of input) this.push(value);
      this.__locked__ = false;
      this.__publishRequestEmitChange__(option);
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
    return this.__ids__.length;
  }

  /**
   * Propagates activation to all child nodes.
   * @internal Internal implementation method. Do not call directly.
   */
  public activate() {
    for (const id of this.__ids__)
      (this.__sourceMap__.get(id)?.node as AbstractNode).activate(
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
    handleChange: Fn<[ArrayValue | undefined]>,
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
      if (type & NodeEventType.RequestEmitChange)
        this.__emitChange__(payload?.[NodeEventType.RequestEmitChange]);
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

    const id = ('[' + this.__seq__++ + ']') as IndexId;
    const name = this.__ids__.length.toString();
    this.__ids__.push(id);

    const defaultValue =
      data !== undefined
        ? data
        : getDefaultValue(this.__host__.jsonSchema.items);
    const childNode = this.__nodeFactory__({
      key: id,
      name,
      jsonSchema: this.__host__.jsonSchema.items,
      parentNode: this.__host__,
      defaultValue,
      onChange: this.__handleChangeFactory__(id),
      nodeFactory: this.__nodeFactory__,
    });
    this.__sourceMap__.set(id, {
      node: childNode,
      data: childNode.value,
    });

    if (this.__host__.activated)
      (childNode as AbstractNode).activate(this.__host__);

    this.__changed__ = true;
    this.__publishRequestEmitChange__();
    this.__publishUpdateChildren__();

    return promiseAfterMicrotask(this.length);
  }

  /**
   * Updates the value of a specific element.
   * @param id - ID or index of the element to update
   * @param data - New value
   * @returns Returns itself (this) for method chaining
   */
  public update(id: IndexId | number, data: ArrayValue[number]) {
    const targetId = typeof id === 'number' ? this.__ids__[id] : id;
    const node = this.__sourceMap__.get(targetId)?.node;
    if (!node) return promiseAfterMicrotask(undefined);
    node.setValue(data);
    return promiseAfterMicrotask(node.value);
  }

  /**
   * Removes a specific element.
   * @param id - ID or index of the element to remove
   * @returns Returns itself (this) for method chaining
   */
  public remove(id: IndexId | number) {
    const targetId = typeof id === 'number' ? this.__ids__[id] : id;

    const removed = this.__sourceMap__.get(targetId);
    if (!removed) return promiseAfterMicrotask(undefined);

    this.__ids__ = this.__ids__.filter((id) => id !== targetId);
    this.__sourceMap__.delete(targetId);
    this.__updateChildName__();

    this.__changed__ = true;
    this.__publishRequestEmitChange__();
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
    for (let i = 0; i < this.__ids__.length; i++)
      this.__sourceMap__.get(this.__ids__[i])?.node.cleanUp(this.__host__);

    this.__ids__ = [];
    this.__sourceMap__.clear();

    this.__changed__ = true;
    this.__publishRequestEmitChange__();
    this.__publishUpdateChildren__();

    return promiseAfterMicrotask(void 0);
  }

  /**
   * Emits a value change event.
   * @param option - Option settings (default: SetValueOption.Default)
   * @private
   */
  private __emitChange__(option: UnionSetValueOption = SetValueOption.Default) {
    if (this.__locked__ || !this.__dirty__) return;
    const value = this.value;
    if (option & SetValueOption.EmitChange) this.__handleChange__(value);
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
   * @returns Array containing ID and node information
   * @private
   */
  private get __edges__() {
    const edges = new Array<{ id: IndexId; node: SchemaNode }>(
      this.__ids__.length,
    );
    for (let i = 0; i < this.__ids__.length; i++) {
      const id = this.__ids__[i];
      edges[i] = {
        id,
        node: this.__sourceMap__.get(id)!.node,
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
    const values = new Array<AllowedValue>(this.__ids__.length);
    for (let i = 0; i < this.__ids__.length; i++) {
      const edge = this.__sourceMap__.get(this.__ids__[i]);
      if (edge) values[i] = edge.data;
    }
    return values;
  }

  /**
   * Creates a function to handle value changes for a specific element.
   * @param id - Element ID
   * @returns Value change function
   * @private
   */
  private __handleChangeFactory__(id: IndexId) {
    return (data: unknown) => {
      if (!this.__sourceMap__.has(id)) return;
      this.__sourceMap__.get(id)!.data = data;
      this.__changed__ = true;
      this.__publishRequestEmitChange__();
    };
  }

  /**
   * Updates the names of array elements.
   * @private
   */
  private __updateChildName__() {
    for (let index = 0; index < this.__ids__.length; index++) {
      const id = this.__ids__[index];
      if (this.__sourceMap__.has(id)) {
        const node = this.__sourceMap__.get(id)!.node;
        const name = index.toString();
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

  /**
   * Publishes a value change request event.
   * @param option - Change options (optional)
   * @private
   */
  private __publishRequestEmitChange__(option?: UnionSetValueOption) {
    if (this.__locked__) return;
    this.__host__.publish({
      type: NodeEventType.RequestEmitChange,
      payload: { [NodeEventType.RequestEmitChange]: option },
    });
  }
}
