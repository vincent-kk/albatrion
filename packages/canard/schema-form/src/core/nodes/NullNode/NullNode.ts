import type { NullSchema, NullValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';

/**
 * Node class for handling null schemas.
 * Manages null values.
 */
export class NullNode extends AbstractNode<NullSchema, NullValue> {
  public override readonly type = 'null';

  /** Current value of the null node */
  private __value__: NullValue | undefined;

  /**
   * Gets the value of the null node.
   * @returns null or undefined
   */
  public override get value() {
    return this.__value__;
  }

  /**
   * Sets the value of the null node.
   * @param input - The value to set
   */
  public override set value(input: NullValue | undefined) {
    this.setValue(input);
  }

  /**
   * Applies the input value to the null node.
   * @param input - The value to set
   * @param option - Set value options
   */
  protected override applyValue(
    this: NullNode,
    input: NullValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.__emitChange__(input, option);
  }

  constructor(properties: SchemaNodeConstructorProps<NullSchema>) {
    super(properties);
    if (this.defaultValue !== undefined)
      this.__emitChange__(this.defaultValue);
    this.initialize();
  }

  /**
   * Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  private __emitChange__(
    this: NullNode,
    input: NullValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const retain = (option & SetValueOption.Replace) === 0;

    const previous = this.__value__;
    const current = this.__parseValue__(input);

    if (retain && this.equals(previous, current)) return;
    this.__value__ = current;

    if (option & SetValueOption.EmitChange)
      this.onChange(current, (option & SetValueOption.Batch) > 0);
    if (option & SetValueOption.Refresh) this.refresh(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current },
        this.initialized,
      );
  }

  /**
   * Parses the input value.
   * @param input - The value to parse
   * @returns {NullValue|undefined} Returns the input as-is
   */
  private __parseValue__(this: NullNode, input: NullValue | undefined) {
    if (input === undefined) return undefined;
    return input;
  }
}
