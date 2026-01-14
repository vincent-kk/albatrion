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
 * Manages and parses string values.
 */
export class StringNode extends AbstractNode<StringSchema, StringValue> {
  public override readonly type = 'string';

  /** Current value of the string node */
  #value: StringValue | Nullish = undefined;

  /**
   * Gets the value of the string node.
   * @returns String value or undefined
   */
  public override get value() {
    return this.#value;
  }

  /**
   * Sets the value of the string node.
   * @param input - The string value to set
   */
  public override set value(input: StringValue | Nullish) {
    this.setValue(input);
  }

  /**
   * Applies the input value to the string node.
   * @param input - The string value to set
   * @param option - Set value options
   */
  protected override applyValue(
    this: StringNode,
    input: StringValue | Nullish,
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  protected override onChange: HandleChange<StringValue | Nullish>;

  constructor(properties: SchemaNodeConstructorProps<StringSchema>) {
    super(properties);
    this.onChange =
      this.jsonSchema.options?.omitEmpty !== false
        ? this.onChangeWithOmitEmpty
        : super.onChange;
    if (this.defaultValue !== undefined) this.#emitChange(this.defaultValue);
    if (this.jsonSchema.options?.trim === true)
      this.subscribe(({ type }) => {
        if (type & NodeEventType.Blurred)
          this.#value != null && this.#emitChange(this.#value.trim());
      });
    this.initialize();
  }

  /**
   * Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  #emitChange(
    this: StringNode,
    input: StringValue | Nullish,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const retain = (option & SetValueOption.Replace) === 0;

    const previous = this.#value;
    const current = this.#parseValue(input);

    if (retain && this.equals(previous, current)) return;
    this.#value = current;

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
   * Parses the input value as a string.
   * @param input - The value to parse
   * @returns {StringValue|null|undefined} Parsed string value
   */
  #parseValue(this: StringNode, input: StringValue | Nullish) {
    if (input === undefined) return undefined;
    if (input === null && this.nullable) return null;
    return parseString(input);
  }

  /**
   * Reflects value changes excluding empty values.
   * @param input - The value to set
   * @param batch - Optional flag indicating whether the change should be batched
   * @internal Internal implementation method. Do not call directly.
   */
  private onChangeWithOmitEmpty(
    this: StringNode,
    input: StringValue | Nullish,
    batch?: boolean,
  ) {
    if (input === null) super.onChange(null, batch);
    else if (input === undefined || input.length === 0)
      super.onChange(undefined, batch);
    else super.onChange(input, batch);
  }
}
