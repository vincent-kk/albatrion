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
  /** Current value of the boolean node */
  #value: BooleanValue | Nullish = undefined;

  /**
   * Gets the value of the boolean node.
   * @returns Boolean value or undefined
   */
  public override get value() {
    return this.#value;
  }

  /**
   * Sets the value of the boolean node.
   * @param input - The boolean value to set
   */
  public override set value(input: BooleanValue | Nullish) {
    this.setValue(input);
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
    this.#emitChange(input, option);
  }

  constructor({
    key,
    name,
    scope,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    validationMode,
    validatorFactory,
    required,
  }: SchemaNodeConstructorProps<BooleanSchema>) {
    super({
      key,
      name,
      scope,
      jsonSchema,
      defaultValue,
      onChange,
      parentNode,
      validationMode,
      validatorFactory,
      required,
    });
    if (this.defaultValue !== undefined) this.#emitChange(this.defaultValue);
    this.initialize();
  }

  /**
   * Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  #emitChange(
    this: BooleanNode,
    input: BooleanValue | Nullish,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const replace = option & SetValueOption.Replace;
    const previous = this.#value;
    const current = this.#parseValue(input);

    if (!replace && previous === current) return;
    this.#value = current;

    if (option & SetValueOption.EmitChange)
      this.onChange(current, !!(option & SetValueOption.Batch));
    if (option & SetValueOption.Refresh) this.refresh(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish(NodeEventType.UpdateValue, current, { previous, current });
  }

  /**
   * Parses the input value as a boolean.
   * @param input - The value to parse
   * @returns {BooleanValue|null|undefined} Parsed boolean value
   */
  #parseValue(this: BooleanNode, input: BooleanValue | Nullish) {
    if (input === undefined) return undefined;
    if (input === null && this.nullable) return null;
    return parseBoolean(input);
  }
}
