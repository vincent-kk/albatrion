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
  /** Current value of the null node */
  #value: NullValue | undefined;

  /**
   * Gets the value of the null node.
   * @returns null or undefined
   */
  public override get value() {
    return this.#value;
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
    this.#emitChange(input, option);
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    validationMode,
    validatorFactory,
    required,
  }: SchemaNodeConstructorProps<NullSchema>) {
    super({
      key,
      name,
      jsonSchema,
      defaultValue,
      onChange,
      parentNode,
      validationMode,
      validatorFactory,
      required,
    });
    if (this.defaultValue !== undefined) this.#emitChange(this.defaultValue);
    this.activate();
  }

  /**
   * Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  #emitChange(
    this: NullNode,
    input: NullValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.#value;
    const current = this.#parseValue(input);
    const replace = option & SetValueOption.Replace;

    if (!replace && previous === current) return;
    this.#value = current;

    if (option & SetValueOption.EmitChange)
      this.onChange(current, !!(option & SetValueOption.Batch));
    if (option & SetValueOption.Refresh) this.refresh(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: current },
        options: {
          [NodeEventType.UpdateValue]: { previous, current },
        },
      });
  }

  /**
   * Parses the input value.
   * @param input - The value to parse
   * @returns {NullValue|undefined} Returns the input as-is
   */
  #parseValue(this: NullNode, input: NullValue | undefined) {
    if (input === undefined) return undefined;
    return input;
  }
}
