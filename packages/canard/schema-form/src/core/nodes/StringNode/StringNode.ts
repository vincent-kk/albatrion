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
  /** Current value of the string node */
  #value: StringValue | undefined = undefined;

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
  public override set value(input: StringValue | undefined) {
    this.setValue(input);
  }

  /**
   * Applies the input value to the string node.
   * @param input - The string value to set
   * @param option - Set value options
   */
  protected override applyValue(
    this: StringNode,
    input: StringValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  protected override onChange: HandleChange<StringValue | undefined>;

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
  }: SchemaNodeConstructorProps<StringSchema>) {
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

    this.onChange =
      this.jsonSchema.options?.omitEmpty !== false
        ? this.onChangeWithOmitEmpty
        : super.onChange;

    if (this.defaultValue !== undefined) this.#emitChange(this.defaultValue);
    if (this.jsonSchema.options?.trim)
      this.subscribe(({ type }) => {
        if (type === NodeEventType.Blurred)
          this.#emitChange(this.#value?.trim());
      });
    this.activate();
  }

  /**
   * Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  #emitChange(
    this: StringNode,
    input: StringValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.#value;
    const current = this.#parseValue(input);
    if (previous === current) return;
    this.#value = current;

    if (option & SetValueOption.EmitChange)
      this.onChange(current, !!(option & SetValueOption.Batch));
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
   * Parses the input value as a string.
   * @param input - The value to parse
   * @returns {StringValue|undefined} Parsed string value
   */
  #parseValue(this: StringNode, input: StringValue | undefined) {
    if (input === undefined) return undefined;
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
    input: StringValue | undefined,
    batch?: boolean,
  ) {
    if (input === undefined || input.length === 0)
      super.onChange(undefined, batch);
    else super.onChange(input, batch);
  }
}
