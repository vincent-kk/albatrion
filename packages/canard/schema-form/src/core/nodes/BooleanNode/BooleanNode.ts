import type { Nullish } from '@aileron/declare';

import type { BooleanSchema, BooleanValue } from '@/schema-form/types';

import { parseBoolean } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';

/**
 * Node class for handling boolean schemas.
 * Manages and parses boolean values.
 */
export class BooleanNode extends AbstractNode<BooleanSchema, BooleanValue> {
  public override readonly type = 'boolean';

  /** Current value of the boolean node */
  private __value__: BooleanValue | Nullish = undefined;

  /**
   * Parses the input value as a boolean.
   * @param input - The value to parse
   * @returns {BooleanValue|null|undefined} Parsed boolean value
   */
  private __parseValue__(this: BooleanNode, input: BooleanValue | Nullish) {
    if (input === undefined) return undefined;
    if (input === null && this.nullable) return null;
    return parseBoolean(input);
  }

  /**
   * Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  private __emitChange__(
    this: BooleanNode,
    input: BooleanValue | Nullish,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const retain = (option & SetValueOption.Replace) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;

    const previous = this.__value__;
    const current = this.__parseValue__(input);

    if (retain && this.__equals__(previous, current)) return;
    this.__value__ = current;

    if (option & SetValueOption.EmitChange)
      this.onChange(current, (option & SetValueOption.Batch) > 0);
    if (option & SetValueOption.Refresh)
      this.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        this.initialized,
      );
  }

  /**
   * Applies the input value to the boolean node.
   * @param input - The boolean value to set
   * @param option - Set value options
   */
  protected override applyValue(
    this: BooleanNode,
    input: BooleanValue | Nullish,
    option: UnionSetValueOption,
  ) {
    this.__emitChange__(input, option);
  }

  /**
   * Gets the value of the boolean node.
   * @returns Boolean value or undefined
   */
  public override get value() {
    return this.__value__;
  }

  /**
   * Sets the value of the boolean node.
   * @param input - The boolean value to set
   */
  public override set value(input: BooleanValue | Nullish) {
    this.setValue(input);
  }

  constructor(properties: SchemaNodeConstructorProps<BooleanSchema>) {
    super(properties);
    if (this.defaultValue !== undefined) this.__emitChange__(this.defaultValue);
    this.__initialize__();
  }
}
