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
  #value: BooleanValue | undefined = undefined;

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
  public override set value(input: BooleanValue | undefined) {
    this.setValue(input);
  }

  /**
   * Applies the input value to the boolean node.
   * @param input - The boolean value to set
   * @param option - Set value options
   */
  protected override applyValue(
    this: BooleanNode,
    input: BooleanValue | undefined,
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
    required,
    ajv,
  }: SchemaNodeConstructorProps<BooleanSchema>) {
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
    if (this.defaultValue !== undefined) this.#emitChange(this.defaultValue);
    this.activate();
  }

  /**
   * Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  #emitChange(
    this: BooleanNode,
    input: BooleanValue | undefined,
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
   * Parses the input value as a boolean.
   * @param input - The value to parse
   * @returns {BooleanValue|undefined} Parsed boolean value
   */
  #parseValue(this: BooleanNode, input: BooleanValue | undefined) {
    if (input === undefined) return undefined;
    return parseBoolean(input);
  }
}
