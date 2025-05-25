import { equals, getObjectKeys, sortObjectKeys } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import {
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
  private __host__: ObjectNode;

  /** Callback function to handle value changes */
  private __handleChange__: Fn<[ObjectValue | undefined]>;

  /** Callback function to handle refresh operations */
  private __handleRefresh__: Fn<[ObjectValue | undefined]>;

  /** Array of property keys defined in the JSON schema, used for ordering object properties */
  private readonly __propertyKeys__: string[];

  /** Current value of the object node, initialized as empty object */
  private __value__: ObjectValue | undefined = {};

  /**
   * Gets the current value of the object.
   * @returns Current value of the object node or undefined
   */
  public get value() {
    return this.__value__;
  }

  /**
   * Applies input value to the object node.
   * @param input - Object value to set
   * @param option - Setting options
   */
  public applyValue(
    input: ObjectValue | undefined,
    option: UnionSetValueOption,
  ) {
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
   * Initializes the TerminalStrategy object.
   * @param host - Host ObjectNode object
   * @param handleChange - Value change handler
   * @param handleRefresh - Refresh handler
   * @param handleSetDefaultValue - Default value setting handler
   */
  constructor(
    host: ObjectNode,
    handleChange: Fn<[ObjectValue | undefined]>,
    handleRefresh: Fn<[ObjectValue | undefined]>,
    handleSetDefaultValue: Fn<[ObjectValue | undefined]>,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__handleRefresh__ = handleRefresh;

    this.__propertyKeys__ = getObjectKeys(host.jsonSchema.properties);

    const defaultValue = this.__parseValue__(
      getObjectDefaultValue(host.jsonSchema, host.defaultValue),
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
    input: ObjectValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.__value__;
    const current = this.__parseValue__(input);

    if (equals(previous, current)) return;

    this.__value__ = current;
    if (option & SetValueOption.EmitChange) this.__handleChange__(current);
    if (option & SetValueOption.Refresh) this.__handleRefresh__(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.__host__.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: current },
        options: {
          [NodeEventType.UpdateValue]: {
            previous,
            current,
          },
        },
      });
  }

  /**
   * Parses input value into appropriate object format.
   * @param input - Value to parse
   * @returns Parsed object value or undefined
   * @private
   */
  private __parseValue__(input: ObjectValue | undefined) {
    if (input === undefined) return undefined;
    return sortObjectKeys(parseObject(input), this.__propertyKeys__, true);
  }
}
