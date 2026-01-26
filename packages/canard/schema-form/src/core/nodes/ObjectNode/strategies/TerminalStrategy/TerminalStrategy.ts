import { sortWithReference } from '@winglet/common-utils/array';
import { getObjectKeys, sortObjectKeys } from '@winglet/common-utils/object';

import type { Nullish } from '@aileron/declare';

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

  /** Flag indicating whether to ignore additional properties */
  private readonly __ignoreAdditionalProperties__: boolean;

  /** Callback function to handle value changes */
  private readonly __handleChange__: HandleChange<ObjectValue | Nullish>;

  /** Array of property keys defined in the JSON schema, used for ordering object properties */
  private readonly __propertyKeys__: string[];

  /** Current value of the object node, initialized as empty object */
  private __value__: ObjectValue | Nullish;

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
    const host = this.__host__;
    const normalize = (option & SetValueOption.Normalize) > 0;
    const retain = (option & SetValueOption.Replace) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;

    const previous = this.__value__ ? { ...this.__value__ } : this.__value__;
    const current = this.__parseValue__(input, normalize);

    // @ts-expect-error [internal] equals delegation
    if (retain && host.__equals__(previous, current)) return;
    this.__value__ = current;

    if (option & SetValueOption.EmitChange)
      this.__handleChange__(current, (option & SetValueOption.Batch) > 0);
    if (option & SetValueOption.Refresh)
      host.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      host.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        host.initialized,
      );
  }

  /**
   * Parses input value into appropriate object format.
   * @param input - Value to parse
   * @returns {ObjectValue|undefined} Parsed object value or undefined
   * @private
   */
  private __parseValue__(input: ObjectValue | Nullish, normalize?: boolean) {
    if (input === undefined) return undefined;
    if (input === null && this.__host__.nullable) return null;
    return sortObjectKeys(parseObject(input), this.__propertyKeys__, {
      ignoreUndefinedKey: this.__ignoreAdditionalProperties__ || normalize,
      ignoreUndefinedValue: true,
    });
  }

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
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;

    const jsonSchema = host.jsonSchema;

    this.__ignoreAdditionalProperties__ =
      jsonSchema.additionalProperties === false;

    this.__propertyKeys__ = sortWithReference(
      getObjectKeys(jsonSchema.properties),
      jsonSchema.propertyKeys,
    );

    const defaultValue = this.__parseValue__(
      getObjectDefaultValue(jsonSchema, host.defaultValue),
    );

    // @ts-expect-error [internal] setDefaultValue delegation
    host.__setDefaultValue__(defaultValue);
    this.__emitChange__(defaultValue);
  }
}
