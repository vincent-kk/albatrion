import { isClose } from '@winglet/common-utils/math';

import type { Nullish } from '@aileron/declare';

import type { NumberSchema, NumberValue } from '@/schema-form/types';

import { parseNumber } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import {
  type HandleChange,
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';

/**
 * Node class for handling number schemas.
 * @remarks Manages and parses numeric values (integers or floating-point numbers).
 */
export class NumberNode extends AbstractNode<NumberSchema, NumberValue> {
  public override readonly type = 'number';

  /** @internal Current value of the number node. */
  private __value__: NumberValue | Nullish = undefined;

  /** @internal */
  protected override __equals__(
    this: NumberNode,
    left: NumberValue | Nullish,
    right: NumberValue | Nullish,
    fullPrecision?: boolean,
  ): boolean {
    if (fullPrecision) return left === right;
    if (left == null || right == null) return left === right;
    return isClose(left, right);
  }

  protected override applyValue(
    this: NumberNode,
    input: NumberValue | Nullish,
    option: UnionSetValueOption,
  ) {
    this.__emitChange__(input, option);
  }

  /** @internal */
  protected override onChange: HandleChange<NumberValue | Nullish>;

  /** Current number value or `undefined`. */
  public override get value() {
    return this.__value__;
  }

  public override set value(input: NumberValue | Nullish) {
    this.setValue(input);
  }

  /**
   * @internal Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  private __emitChange__(
    this: NumberNode,
    input: NumberValue | Nullish,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const retain = (option & SetValueOption.Replace) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;

    const previous = this.__value__;
    const current = this.__parseValue__(input);

    if (retain && this.__equals__(previous, current, true)) return;
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
   * @internal Parses the input value as a number.
   * @param input - The value to parse
   */
  private __parseValue__(this: NumberNode, input: NumberValue | Nullish) {
    if (input === undefined) return undefined;
    if (input === null && this.nullable) return null;
    return parseNumber(input, this.schemaType === 'integer');
  }

  /**
   * @internal Reflects value changes excluding empty values.
   * @param input - The value to set
   * @param batch - Whether the change should be batched
   */
  private __onChangeWithOmitEmpty__(
    this: NumberNode,
    input: NumberValue | Nullish,
    batch?: boolean,
  ) {
    if (input === null) super.onChange(null, batch);
    else if (input === undefined || isNaN(input))
      super.onChange(undefined, batch);
    else super.onChange(input, batch);
  }

  constructor(properties: SchemaNodeConstructorProps<NumberSchema>) {
    super(properties);
    this.onChange =
      this.jsonSchema.options?.omitEmpty !== false
        ? this.__onChangeWithOmitEmpty__
        : super.onChange;
    if (this.defaultValue !== undefined) this.__emitChange__(this.defaultValue);
    this.__initialize__();
  }
}
