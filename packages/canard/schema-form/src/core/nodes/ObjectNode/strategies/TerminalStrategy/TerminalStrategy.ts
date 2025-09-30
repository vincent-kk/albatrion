import { sortWithReference } from '@winglet/common-utils/array';
import {
  equals,
  getObjectKeys,
  sortObjectKeys,
} from '@winglet/common-utils/object';

import type { Fn, Nullish } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import {
  type HandleChange,
  NodeEventType,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { parseObject } from '@/schema-form/core/parsers';
import { getObjectDefaultValue } from '@/schema-form/helpers/defaultValue';
import type { ObjectValue } from '@/schema-form/types';

import type { ObjectNodeStrategy } from '../type';

/**
 * Strategy class for managing ObjectNode values as terminal.
 * Implementation for handling simple object types.
 */
export class TerminalStrategy implements ObjectNodeStrategy {
  /** Host ObjectNode instance that this strategy belongs to */
  private readonly __host__: ObjectNode;

  /** Callback function to handle value changes */
  private readonly __handleChange__: HandleChange<ObjectValue | Nullish>;

  /** Callback function to handle refresh operations */
  private readonly __handleRefresh__: Fn<[ObjectValue | Nullish]>;

  /** Array of property keys defined in the JSON schema, used for ordering object properties */
  private readonly __propertyKeys__: string[];

  /** Current value of the object node, initialized as empty object */
  private __value__: ObjectValue | Nullish;

  /**
   * Gets the current value of the object.
   * @returns Current value of the object node or undefined (if empty) or null (if nullable)
   */
  public get value() {
    return this.__value__;
  }

  /**
   * Applies input value to the object node.
   * @param input - Object value to set
   * @param option - Setting options
   */
  public applyValue(input: ObjectValue | Nullish, option: UnionSetValueOption) {
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
   * Gets the list of subnodes.
   * @returns Empty array (Terminal strategy does not manage subnodes)
   */
  public get subnodes() {
    return null;
  }

  /**
   * Initializes the TerminalStrategy object.
   * @param host - Host ObjectNode object
   * @param handleChange - Value change handler
   * @param handleRefresh - Refresh handler
   * @param handleSetDefaultValue - Default value setting handler
   */
  constructor(
    host: ObjectNode,
    handleChange: HandleChange<ObjectValue | Nullish>,
    handleRefresh: Fn<[ObjectValue | Nullish]>,
    handleSetDefaultValue: Fn<[ObjectValue | Nullish]>,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__handleRefresh__ = handleRefresh;

    const jsonSchema = host.jsonSchema;

    this.__propertyKeys__ = sortWithReference(
      getObjectKeys(jsonSchema.properties),
      jsonSchema.propertyKeys,
    );

    const defaultValue = this.__parseValue__(
      getObjectDefaultValue(jsonSchema, host.defaultValue),
    );

    handleSetDefaultValue(defaultValue);
    this.__emitChange__(defaultValue);
  }

  /**
   * Emits a value change event.
   * @param input - New object value
   * @param option - Option settings (default: SetValueOption.Default)
   * @private
   */
  private __emitChange__(
    input: ObjectValue | Nullish,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const replace = option & SetValueOption.Replace;
    const previous = this.__value__ ? { ...this.__value__ } : this.__value__;
    const current = this.__parseValue__(input);

    if (!replace && equals(previous, current)) return;
    this.__value__ = current;

    if (option & SetValueOption.EmitChange)
      this.__handleChange__(current, (option & SetValueOption.Batch) > 0);
    if (option & SetValueOption.Refresh) this.__handleRefresh__(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.__host__.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current },
        true,
      );
  }

  /**
   * Parses input value into appropriate object format.
   * @param input - Value to parse
   * @returns {ObjectValue|undefined} Parsed object value or undefined
   * @private
   */
  private __parseValue__(input: ObjectValue | Nullish) {
    if (input === undefined) return undefined;
    if (input === null && this.__host__.nullable) return null;
    return sortObjectKeys(parseObject(input), this.__propertyKeys__, true);
  }
}
