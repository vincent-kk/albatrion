import type { Fn } from '@aileron/declare';

import type { ArraySchema, ArrayValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import type {
  BranchNodeConstructorProps,
  SchemaNode,
  SchemaNodeFactory,
  UnionSetValueOption,
} from '../type';
import {
  type ArrayNodeStrategy,
  BranchStrategy,
  type IndexId,
  TerminalStrategy,
} from './strategies';
import { omitEmptyArray } from './utils';

/**
 * A node class for handling array schemas.
 * Manages each element of the array and provides push/pop/update/remove/clear functionality.
 */
export class ArrayNode extends AbstractNode<ArraySchema, ArrayValue> {
  /**
   * Strategy used by the array node:
   *  - BranchStrategy: Handles complex child nodes with associated processing logic.
   *  - TerminalStrategy: Acts as a terminal node for array-type data with no child nodes and simple processing logic.
   * @internal Internal implementation detail. Do not call directly.
   */
  #strategy: ArrayNodeStrategy;

  /**
   * Gets the value of the array node.
   * @returns Array value or undefined
   */
  public override get value() {
    return this.#strategy.value;
  }

  /**
   * Sets the value of the array node.
   * @param input - Array value to set
   */
  public override set value(input: ArrayValue | undefined) {
    this.setValue(input);
  }

  /**
   * Applies input value to the array node.
   * @param input - Array value to set
   * @param option - Setting options
   */
  protected override applyValue(
    this: ArrayNode,
    input: ArrayValue,
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
   * @returns Whether activation was successful
   * @internal Internal implementation method. Do not call directly.
   */
  public override activate(this: ArrayNode, actor?: SchemaNode): boolean {
    if (super.activate(actor)) {
      this.#strategy.activate?.();
      return true;
    }
    return false;
  }

  protected override onChange: Fn<[input: ArrayValue | undefined]>;

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    nodeFactory,
    parentNode,
    validationMode,
    required,
    ajv,
  }: BranchNodeConstructorProps<ArraySchema>) {
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
    const handleChange =
      this.jsonSchema.options?.omitEmpty === false
        ? (value?: ArrayValue) => super.onChange(value)
        : (value?: ArrayValue) => super.onChange(omitEmptyArray(value));
    this.onChange = handleChange;
    this.#strategy = this.#createStrategy(handleChange, nodeFactory);
    this.activate();
  }

  /**
   * Adds a new element to the array.
   * @param data - Value to add (optional)
   * @returns Returns itself (this) for method chaining
   */
  public push(this: ArrayNode, data?: ArrayValue[number]) {
    this.#strategy.push(data);
    return this;
  }

  /**
   * Updates the value of a specific element.
   * @param id - ID or index of the element to update
   * @param data - New value
   * @returns Returns itself (this) for method chaining
   */
  public update(
    this: ArrayNode,
    id: IndexId | number,
    data: ArrayValue[number],
  ) {
    this.#strategy.update(id, data);
    return this;
  }

  /**
   * Removes a specific element.
   * @param id - ID or index of the element to remove
   * @returns Returns itself (this) for method chaining
   */
  public remove(this: ArrayNode, id: IndexId | number) {
    this.#strategy.remove(id);
    return this;
  }

  /**
   * Clears all elements to initialize the array.
   * @returns Returns itself (this) for method chaining
   */
  public clear(this: ArrayNode) {
    this.#strategy.clear();
    return this;
  }

  /**
   * Creates a strategy for the array node.
   * @param nodeFactory - Node factory
   * @returns Created strategy: TerminalStrategy | BranchStrategy
   */
  #createStrategy(
    handleChange: Fn<[input: ArrayValue | undefined]>,
    nodeFactory: SchemaNodeFactory,
  ) {
    const handleRefresh = (value?: ArrayValue) => this.refresh(value);
    const handleSetDefaultValue = (value?: ArrayValue) =>
      this.setDefaultValue(value);

    if (this.group === 'terminal') {
      return new TerminalStrategy(
        this,
        handleChange,
        handleRefresh,
        handleSetDefaultValue,
      );
    } else {
      return new BranchStrategy(
        this,
        handleChange,
        handleRefresh,
        handleSetDefaultValue,
        nodeFactory,
      );
    }
  }
}
