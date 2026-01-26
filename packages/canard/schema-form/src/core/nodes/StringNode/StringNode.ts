import type { Nullish } from '@aileron/declare';

import type { StringSchema, StringValue } from '@/schema-form/types';

import { parseString } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import {
  type HandleChange,
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';

/**
 * Node class for handling string schemas.
 * @remarks Manages and parses string values.
 */
export class StringNode extends AbstractNode<StringSchema, StringValue> {
  public override readonly type = 'string';

  /** @internal Current value of the string node. */
  private __value__: StringValue | Nullish = undefined;

  /**
   * @internal Parses the input value as a string.
   * @param input - The value to parse
   */
  private __parseValue__(this: StringNode, input: StringValue | Nullish) {
    if (input === undefined) return undefined;
    if (input === null && this.nullable) return null;
    return parseString(input);
  }

  /**
   * @internal Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  private __emitChange__(
    this: StringNode,
    input: StringValue | Nullish,
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
   * @internal Reflects value changes excluding empty values.
   * @param input - The value to set
   * @param batch - Whether the change should be batched
   */
  private __onChangeWithOmitEmpty__(
    this: StringNode,
    input: StringValue | Nullish,
    batch?: boolean,
  ) {
    if (input === null) super.onChange(null, batch);
    else if (input === undefined || input.length === 0)
      super.onChange(undefined, batch);
    else super.onChange(input, batch);
  }

  protected override applyValue(
    this: StringNode,
    input: StringValue | Nullish,
    option: UnionSetValueOption,
  ) {
    this.__emitChange__(input, option);
  }

  /** @internal */
  protected override onChange: HandleChange<StringValue | Nullish>;

  /** Current string value or `undefined`. */
  public override get value() {
    return this.__value__;
  }

  public override set value(input: StringValue | Nullish) {
    this.setValue(input);
  }

  constructor(properties: SchemaNodeConstructorProps<StringSchema>) {
    super(properties);
    this.onChange =
      this.jsonSchema.options?.omitEmpty !== false
        ? this.__onChangeWithOmitEmpty__
        : super.onChange;
    if (this.defaultValue !== undefined) this.__emitChange__(this.defaultValue);
    if (this.jsonSchema.options?.trim === true)
      this.subscribe(({ type }) => {
        if (type & NodeEventType.Blurred)
          this.__value__ != null && this.__emitChange__(this.__value__.trim());
      });
    this.__initialize__();
  }
}
