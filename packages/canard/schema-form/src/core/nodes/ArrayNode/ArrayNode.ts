import { equals } from '@winglet/common-utils/object';

import type { Nullish } from '@aileron/declare';

import type { ArraySchema, ArrayValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import type {
  BranchNodeConstructorProps,
  HandleChange,
  SchemaNode,
  UnionSetValueOption,
} from '../type';
import {
  type ArrayNodeStrategy,
  BranchStrategy,
  TerminalStrategy,
} from './strategies';
import { omitEmptyArray } from './utils';

/**
 * Node class for handling array schemas.
 * @remarks Manages each element of the array and provides `push`/`pop`/`update`/`remove`/`clear` functionality.
 */
export class ArrayNode extends AbstractNode<ArraySchema, ArrayValue> {
  public override readonly type = 'array';

  /** Active child nodes within the current scope. */
  public override get children() {
    return this.__strategy__.children;
  }

  /** Current length of the array. */
  public get length() {
    return this.__strategy__.length;
  }

  /**
   * @internal Strategy used by the array node.
   * @remarks `BranchStrategy` for branch node with child nodes, `TerminalStrategy` for simple array data, without child nodes.
   */
  private __strategy__: ArrayNodeStrategy;

  /** @internal */
  protected override __equals__(
    this: ArrayNode,
    left: ArrayValue | Nullish,
    right: ArrayValue | Nullish,
  ): boolean {
    return equals(left, right);
  }

  /** @internal */
  protected override onChange: HandleChange<ArrayValue | Nullish>;

  /** Current array value or `undefined`. */
  public override get value() {
    return this.__strategy__.value;
  }

  public override set value(input: ArrayValue | Nullish) {
    this.setValue(input);
  }

  protected override applyValue(
    this: ArrayNode,
    input: ArrayValue | Nullish,
    option: UnionSetValueOption,
  ) {
    this.__strategy__.applyValue(input, option);
  }

  /**
   * Adds a new element to the array.
   * @param data - Value to add (optional, uses default if not provided)
   * @param unlimited - If `true`, ignores `maxItems` constraint
   * @returns The length of the array after the push operation
   */
  public push(this: ArrayNode, data?: ArrayValue[number], unlimited?: boolean) {
    return this.__strategy__.push(data, unlimited);
  }

  /**
   * Removes the last element from the array.
   * @returns The removed value, or `undefined` if array was empty
   */
  public pop(this: ArrayNode) {
    return this.__strategy__.pop();
  }

  /**
   * Updates the value of an element at the specified index.
   * @param index - Index of the element to update
   * @param data - New value
   * @returns The updated value, or `undefined` if index was out of bounds
   */
  public update(this: ArrayNode, index: number, data: ArrayValue[number]) {
    return this.__strategy__.update(index, data);
  }

  /**
   * Removes an element at the specified index.
   * @param index - Index of the element to remove
   * @returns The removed value, or `undefined` if index was out of bounds
   */
  public remove(this: ArrayNode, index: number) {
    return this.__strategy__.remove(index);
  }

  /**
   * Clears all elements from the array.
   * @remarks Respects `minItems` constraint; may not fully clear if `minItems > 0`.
   */
  public clear(this: ArrayNode) {
    return this.__strategy__.clear();
  }

  /** @internal */
  protected override __initialize__(
    this: ArrayNode,
    actor?: SchemaNode,
  ): boolean {
    if (super.__initialize__(actor)) {
      this.__strategy__.initialize?.();
      return true;
    }
    return false;
  }

  constructor(properties: BranchNodeConstructorProps<ArraySchema>) {
    super(properties);
    const hasDefault =
      properties.defaultValue !== undefined ||
      properties.jsonSchema.default !== undefined;
    const handleChange: HandleChange<ArrayValue | Nullish> =
      this.jsonSchema.options?.omitEmpty === false
        ? (value, batch) => super.onChange(value, batch)
        : (value, batch) => super.onChange(omitEmptyArray(value), batch);
    this.onChange = handleChange;
    this.__strategy__ =
      this.group === 'terminal'
        ? new TerminalStrategy(this, hasDefault, handleChange)
        : new BranchStrategy(
            this,
            hasDefault,
            handleChange,
            properties.nodeFactory,
          );
    this.__initialize__();
  }
}
