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
 * @remarks Manages null values.
 */
export class NullNode extends AbstractNode<NullSchema, NullValue> {
  public override readonly type = 'null';

  /** @internal Current value of the null node. */
  private __value__: NullValue | undefined;

  /**
   * @internal Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  private __emitChange__(
    this: NullNode,
    input: NullValue | undefined,
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
   * @internal Parses the input value.
   * @param input - The value to parse
   */
  private __parseValue__(this: NullNode, input: NullValue | undefined) {
    if (input === undefined) return undefined;
    return input;
  }

  protected override applyValue(
    this: NullNode,
    input: NullValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.__emitChange__(input, option);
  }

  /** Current value (`null` or `undefined`). */
  public override get value() {
    return this.__value__;
  }

  public override set value(input: NullValue | undefined) {
    this.setValue(input);
  }

  constructor(properties: SchemaNodeConstructorProps<NullSchema>) {
    super(properties);
    if (this.defaultValue !== undefined) this.__emitChange__(this.defaultValue);
    this.__initialize__();
  }
}
