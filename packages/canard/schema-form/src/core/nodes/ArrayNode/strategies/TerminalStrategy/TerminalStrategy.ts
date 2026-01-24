import { map } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';
import { isObjectSchema } from '@winglet/json-schema/filter';

import type { Nullish } from '@aileron/declare';

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

import { resolveArrayLimits } from '../../utils';
import type { ArrayNodeStrategy } from '../type';

const FIRST_EMIT_CHANGE_OPTION =
  SetValueOption.Replace | SetValueOption.Default;

export class TerminalStrategy implements ArrayNodeStrategy {
  /** Host ArrayNode instance that this strategy belongs to */
  private readonly __host__: ArrayNode;

  /** Callback function to handle value changes */
  private readonly __handleChange__: HandleChange<ArrayValue | Nullish>;

  /** Minimum number of items required in the array (from JSON Schema minItems) */
  private readonly __minItems__: number;

  /** Maximum number of items allowed in the array (from JSON Schema maxItems) */
  private readonly __maxItems__: number;

  /** Default value to use when creating new array items */
  private readonly __defaultItemValue__: AllowedValue;

  /** Default value to use when creating new array prefixItems */
  private readonly __defaultPrefixItemValues__: Array<AllowedValue> | undefined;

  /**
   * Gets the default value for a new array item based on its position.
   *
   * Returns the appropriate default value considering `prefixItems`:
   * - If `prefixItems` is defined and the current length is within its range,
   *   returns the default value from the corresponding prefixItems schema
   * - Otherwise, returns the default value from the `items` schema
   *
   * @returns The default value to use when adding a new item at the current position
   */
  private get __defaultValue__() {
    const index = this.length;
    if (
      this.__defaultPrefixItemValues__ !== undefined &&
      this.__defaultPrefixItemValues__.length > index
    )
      return this.__defaultPrefixItemValues__[index];
    return this.__defaultItemValue__;
  }

  /** Flag indicating whether the strategy is locked to prevent recursive updates */
  private __locked__: boolean = true;

  /** Current value of the array node, initialized as empty array */
  private __value__: ArrayValue | Nullish = [];

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
    hasDefault: boolean,
    handleChange: HandleChange<ArrayValue | Nullish>,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;

    const jsonSchema = host.jsonSchema;
    const limit = resolveArrayLimits(jsonSchema);
    this.__minItems__ = limit.min;
    this.__maxItems__ = limit.max;

    if (jsonSchema.items)
      this.__defaultItemValue__ = isObjectSchema(jsonSchema.items)
        ? getObjectDefaultValue(jsonSchema.items)
        : jsonSchema.items.default;

    if (isArray(jsonSchema.prefixItems))
      this.__defaultPrefixItemValues__ = map(
        jsonSchema.prefixItems,
        (schema) =>
          isObjectSchema(schema)
            ? getObjectDefaultValue(schema)
            : schema.default,
      );

    if (hasDefault) {
      const defaultValue = host.defaultValue;
      if (defaultValue != null && defaultValue.length > 0)
        for (const value of defaultValue) this.push(value, true);
    } else while (this.length < this.__minItems__) this.push(void 0, true);

    this.__locked__ = false;

    this.__emitChange__(this.__value__, FIRST_EMIT_CHANGE_OPTION);
    // @ts-expect-error [internal] setDefaultValue delegation
    host.__setDefaultValue__(this.__value__);
  }

  /**
   * Adds a new element to the array.
   * @param input - Value to add (optional)
   */
  public push(input?: ArrayValue[number], unlimited?: boolean) {
    if (unlimited !== true && this.__maxItems__ <= this.length)
      return Promise.resolve(this.length);
    const data = input ?? this.__defaultValue__;
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
    const host = this.__host__;
    const retain = (option & SetValueOption.Replace) === 0;

    const previous = this.__value__ ? [...this.__value__] : this.__value__;
    const current = this.__parseValue__(input);

    if (retain && host.equals(previous, current)) return;
    this.__value__ = current;

    if (this.__locked__) return;
    if (option & SetValueOption.EmitChange)
      this.__handleChange__(current, (option & SetValueOption.Batch) > 0);
    // @ts-expect-error [internal] refresh delegation
    if (option & SetValueOption.Refresh) host.__refresh__(current);
    if (option & SetValueOption.PublishUpdateEvent)
      host.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current },
        host.initialized,
      );
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
