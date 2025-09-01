import { equals } from '@winglet/common-utils/object';

import type { Fn, Nullish } from '@aileron/declare';

import type { ArrayNode } from '@/schema-form/core/nodes/ArrayNode';
import {
  type HandleChange,
  NodeEventType,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { parseArray } from '@/schema-form/core/parsers';
import { getObjectDefaultValue } from '@/schema-form/helpers/defaultValue';
import type { AllowedValue, ArrayValue } from '@/schema-form/types';

import type { ArrayNodeStrategy } from '../type';

const FIRST_EMIT_CHANGE_OPTION =
  SetValueOption.Replace | SetValueOption.Default;

export class TerminalStrategy implements ArrayNodeStrategy {
  /** Host ArrayNode instance that this strategy belongs to */
  private readonly __host__: ArrayNode;

  /** Callback function to handle value changes */
  private readonly __handleChange__: HandleChange<ArrayValue | Nullish>;

  /** Callback function to handle refresh operations */
  private readonly __handleRefresh__: Fn<[ArrayValue | Nullish]>;

  /** Default value to use when creating new array items */
  private readonly __defaultItemValue__: AllowedValue;

  /** Flag indicating whether the strategy is locked to prevent recursive updates */
  private __locked__: boolean = true;

  /** Current value of the array node, initialized as empty array */
  private __value__: ArrayValue | Nullish = undefined;

  /**
   * Gets the current value of the array.
   * @returns Current value of the array node or undefined or null
   */
  public get value() {
    return this.__value__;
  }

  /**
   * Applies input value to the array node.
   * @param input - Array value to set
   * @param option - Setting options
   */
  public applyValue(input: ArrayValue | Nullish, option: UnionSetValueOption) {
    this.__emitChange__(input, option);
  }

  /**
   * Gets the list of child nodes.
   * @returns Empty array (Terminal strategy does not manage child nodes)
   */
  public get children() {
    return null;
  }

  /**
   * Gets the current length of the array.
   * @returns Length of the array (0 if value is undefined or null)
   */
  public get length() {
    return this.__value__?.length ?? 0;
  }

  /**
   * Initializes the TerminalStrategy object.
   * @param host - Host ArrayNode object
   * @param handleChange - Value change handler
   * @param handleRefresh - Refresh handler
   * @param handleSetDefaultValue - Default value setting handler
   */
  constructor(
    host: ArrayNode,
    handleChange: HandleChange<ArrayValue | Nullish>,
    handleRefresh: Fn<[ArrayValue | Nullish]>,
    handleSetDefaultValue: Fn<[ArrayValue | Nullish]>,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__handleRefresh__ = handleRefresh;

    const jsonSchema = host.jsonSchema;

    this.__defaultItemValue__ =
      jsonSchema.items.type === 'object'
        ? getObjectDefaultValue(jsonSchema.items)
        : jsonSchema.items.default;

    if (host.defaultValue?.length)
      for (const value of host.defaultValue) this.push(value);
    while (this.length < (jsonSchema.minItems || 0)) this.push();

    this.__locked__ = false;

    this.__emitChange__(this.__value__, FIRST_EMIT_CHANGE_OPTION);
    handleSetDefaultValue(this.__value__);
  }

  /**
   * Adds a new element to the array.
   * @param input - Value to add (optional)
   */
  public push(input?: ArrayValue[number]) {
    if (
      this.__host__.jsonSchema.maxItems &&
      this.__host__.jsonSchema.maxItems <= this.length
    )
      return Promise.resolve(this.length);
    const data = input ?? this.__defaultItemValue__;
    const value = this.__value__ == null ? [data] : [...this.__value__, data];
    this.__emitChange__(value);
    return Promise.resolve(this.length);
  }

  /**
   * Updates the value of a specific element.
   * @param index - Index of the element to update
   * @param data - New value
   */
  public update(index: number, data: ArrayValue[number]) {
    if (this.__value__ == null) return Promise.resolve(void 0);
    if (index < 0 || index >= this.__value__.length)
      return Promise.resolve(void 0);
    const value = [...this.__value__];
    value[index] = data;
    this.__emitChange__(value);
    return Promise.resolve(value[index]);
  }

  /**
   * Removes a specific element.
   * @param index - Index of the element to remove
   */
  public remove(index: number) {
    if (this.__value__ == null) return Promise.resolve(void 0);
    if (index < 0 || index >= this.__value__.length)
      return Promise.resolve(void 0);
    const removed = this.__value__[index];
    const value = this.__value__.filter((_, i) => i !== index);
    this.__emitChange__(value);
    return Promise.resolve(removed);
  }

  /** Removes the last element from the array. */
  public pop() {
    if (this.__value__ == null || this.length === 0)
      return Promise.resolve(void 0);
    return this.remove(this.length - 1);
  }

  /** Clears all elements to initialize the array. */
  public clear() {
    this.__emitChange__([]);
    return Promise.resolve(void 0);
  }

  /**
   * Emits a value change event.
   * @param input - New array value
   * @param option - Option settings (default: SetValueOption.Default)
   * @private
   */
  private __emitChange__(
    input: ArrayValue | Nullish,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.__value__ ? [...this.__value__] : this.__value__;
    const current = this.__parseValue__(input);
    const replace = option & SetValueOption.Replace;
    if (!replace && equals(previous, current)) return;
    this.__value__ = current;

    if (this.__locked__) return;
    if (option & SetValueOption.EmitChange)
      this.__handleChange__(current, !!(option & SetValueOption.Batch));
    if (option & SetValueOption.Refresh) this.__handleRefresh__(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.__host__.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: current },
        options: {
          [NodeEventType.UpdateValue]: { previous, current },
        },
      });
  }

  /**
   * Parses input value into appropriate array format.
   * @param input - Value to parse
   * @returns {ArrayValue|null|undefined} Parsed array value or undefined or null
   * @private
   */
  private __parseValue__(input: ArrayValue | Nullish) {
    if (input === undefined) return undefined;
    if (input === null && this.__host__.nullable) return null;
    return parseArray(input);
  }
}
