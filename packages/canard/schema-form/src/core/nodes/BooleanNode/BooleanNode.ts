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
 * @remarks Manages and parses boolean values.
 */
export class BooleanNode extends AbstractNode<BooleanSchema, BooleanValue> {
  public override readonly type = 'boolean';

  /** @internal Current value of the boolean node. */
  private __value__: BooleanValue | Nullish = undefined;

  /**
   * @internal Parses the input value as a boolean.
   * @param input - The value to parse
   */
  private __parseValue__(this: BooleanNode, input: BooleanValue | Nullish) {
    if (input === undefined) return undefined;
    if (input === null && this.nullable) return null;
    return parseBoolean(input);
  }

  /**
   * @internal Reflects value changes and publishes related events.
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

  protected override applyValue(
    this: BooleanNode,
    input: BooleanValue | Nullish,
    option: UnionSetValueOption,
  ) {
    this.__emitChange__(input, option);
  }

  /** Current boolean value or `undefined`. */
  public override get value() {
    return this.__value__;
  }

  public override set value(input: BooleanValue | Nullish) {
    this.setValue(input);
  }

  constructor(properties: SchemaNodeConstructorProps<BooleanSchema>) {
    super(properties);
    if (this.defaultValue !== undefined) this.__emitChange__(this.defaultValue);
    this.__initialize__();
  }
}
