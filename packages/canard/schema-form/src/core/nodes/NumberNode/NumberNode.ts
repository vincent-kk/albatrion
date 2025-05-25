import type { Fn } from '@aileron/declare';

import type { NumberSchema, NumberValue } from '@/schema-form/types';

import { parseNumber } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';

/**
 * Node class for handling number schemas.
 * Manages and parses numeric values (integers or floating-point numbers).
 */
export class NumberNode extends AbstractNode<NumberSchema, NumberValue> {
  /** Current value of the number node */
  #value: NumberValue | undefined = undefined;

  /**
   * Gets the value of the number node.
   * @returns Number value or undefined
   */
  public override get value() {
    return this.#value;
  }

  /**
   * Sets the value of the number node.
   * @param input - The number value to set
   */
  public override set value(input: NumberValue | undefined) {
    this.setValue(input);
  }

  /**
   * Applies the input value to the number node.
   * @param input - The number value to set
   * @param option - Set value options
   */
  protected override applyValue(
    this: NumberNode,
    input: NumberValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  protected override onChange: Fn<[input: NumberValue | undefined]>;

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    validationMode,
    required,
    ajv,
  }: SchemaNodeConstructorProps<NumberSchema>) {
    super({
      key,
      name,
      jsonSchema,
      defaultValue,
      onChange,
      parentNode,
      validationMode,
      required,
      ajv,
    });

    this.onChange =
      this.jsonSchema.options?.omitEmpty !== false
        ? this.onChangeWithOmitEmpty
        : super.onChange;

    if (this.defaultValue !== undefined) this.#emitChange(this.defaultValue);
    this.activate();
  }

  /**
   * Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  #emitChange(
    this: NumberNode,
    input: NumberValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.#value;
    const current = this.#parseValue(input);
    if (previous === current) return;
    this.#value = current;

    if (option & SetValueOption.EmitChange) this.onChange(current);
    if (option & SetValueOption.Refresh) this.refresh(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish({
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
   * Parses the input value as a number.
   * @param input - The value to parse
   * @returns Parsed number value
   */
  #parseValue(this: NumberNode, input: NumberValue | undefined) {
    return parseNumber(input, this.jsonSchema.type === 'integer');
  }

  /**
   * Reflects value changes excluding empty values.
   * @param input - The value to set
   * @internal Internal implementation method. Do not call directly.
   */
  private onChangeWithOmitEmpty(
    this: NumberNode,
    input: NumberValue | undefined,
  ) {
    if (input === undefined || isNaN(input)) super.onChange(undefined);
    else super.onChange(input);
  }
}
