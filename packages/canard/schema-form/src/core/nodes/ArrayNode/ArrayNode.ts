import type { Nullish } from '@aileron/declare';

import type { ArraySchema, ArrayValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import type {
  BranchNodeConstructorProps,
  HandleChange,
  SchemaNode,
  SchemaNodeFactory,
  UnionSetValueOption,
} from '../type';
import {
  type ArrayNodeStrategy,
  BranchStrategy,
  TerminalStrategy,
} from './strategies';
import { omitEmptyArray } from './utils';

/**
 * A node class for handling array schemas.
 * Manages each element of the array and provides push/pop/update/remove/clear functionality.
 */
export class ArrayNode extends AbstractNode<ArraySchema, ArrayValue> {
  public override readonly type = 'array';

  /**
   * Strategy used by the array node:
   *  - BranchStrategy: Handles complex child nodes with associated processing logic.
   *  - TerminalStrategy: Acts as a terminal node for array-type data with no child nodes and simple processing logic.
   * @internal Internal implementation detail. Do not call directly.
   */
  #strategy: ArrayNodeStrategy;

  /**
   * Gets the value of the array node.
   * @returns Array value or undefined (if empty) or null (if nullable)
   */
  public override get value() {
    return this.#strategy.value;
  }

  /**
   * Sets the value of the array node.
   * @param input - Array value to set
   */
  public override set value(input: ArrayValue | Nullish) {
    this.setValue(input);
  }

  /**
   * Applies input value to the array node.
   * @param input - Array value to set
   * @param option - Setting options
   */
  protected override applyValue(
    this: ArrayNode,
    input: ArrayValue | Nullish,
    option: UnionSetValueOption,
  ) {
    this.#strategy.applyValue(input, option);
  }

  /** Child nodes of ArrayNode */
  /**
   * Gets the child nodes of the array node.
   * @returns List of child nodes
   */
  public override get children() {
    return this.#strategy.children;
  }

  /**
   * Gets the current length of the array.
   * @returns Length of the array
   */
  public get length() {
    return this.#strategy.length;
  }

  /**
   * Activates this ArrayNode and propagates activation to all child nodes.
   * @param actor - The node that requested activation
   * @returns {boolean} Whether activation was successful
   * @internal Internal implementation method. Do not call directly.
   */
  public override initialize(this: ArrayNode, actor?: SchemaNode): boolean {
    if (super.initialize(actor)) {
      this.#strategy.initialize?.();
      return true;
    }
    return false;
  }

  protected override onChange: HandleChange<ArrayValue | Nullish>;

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
    this.#strategy = this.#createStrategy(
      hasDefault,
      handleChange,
      properties.nodeFactory,
    );
    this.initialize();
  }

  /**
   * Adds a new element to the array.
   * @param data - Value to add (optional)
   * @returns {Promise<number> } the length of the array after the push operation
   */
  public push(this: ArrayNode, data?: ArrayValue[number], unlimited?: boolean) {
    return this.#strategy.push(data, unlimited);
  }

  /**
   * Removes the last element from the array.
   * @returns {Promise<ArrayValue[number]|undefined>} the value of the removed value
   */
  public pop(this: ArrayNode) {
    return this.#strategy.pop();
  }

  /**
   * Updates the value of a specific element.
   * @param index - Index of the element to update
   * @param data - New value
   * @returns {Promise<ArrayValue[number]|undefined>} the value of the updated value
   */
  public update(this: ArrayNode, index: number, data: ArrayValue[number]) {
    return this.#strategy.update(index, data);
  }

  /**
   * Removes a specific element.
   * @param index - Index of the element to remove
   * @returns {Promise<ArrayValue[number]|undefined>} value of the removed value
   */
  public remove(this: ArrayNode, index: number) {
    return this.#strategy.remove(index);
  }

  /**
   * Clears all elements to initialize the array.
   * @returns {Promise<void>}
   */
  public clear(this: ArrayNode) {
    return this.#strategy.clear();
  }

  /**
   * Creates a strategy for the array node.
   * @param nodeFactory - Node factory
   * @returns {ArrayNodeStrategy} Created strategy: TerminalStrategy | BranchStrategy
   */
  #createStrategy(
    this: ArrayNode,
    hasDefault: boolean,
    handleChange: HandleChange<ArrayValue | Nullish>,
    nodeFactory: SchemaNodeFactory,
  ) {
    const handleRefresh = (value: ArrayValue | Nullish) => this.refresh(value);
    const handleSetDefaultValue = (value: ArrayValue | Nullish) =>
      this.setDefaultValue(value);

    if (this.group === 'terminal') {
      return new TerminalStrategy(
        this,
        hasDefault,
        handleChange,
        handleRefresh,
        handleSetDefaultValue,
      );
    } else {
      return new BranchStrategy(
        this,
        hasDefault,
        handleChange,
        handleRefresh,
        handleSetDefaultValue,
        nodeFactory,
      );
    }
  }
}
