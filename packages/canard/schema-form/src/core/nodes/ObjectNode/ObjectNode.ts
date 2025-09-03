import type { Nullish } from '@aileron/declare';

import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import type {
  BranchNodeConstructorProps,
  HandleChange,
  SchemaNode,
  SchemaNodeFactory,
  UnionSetValueOption,
} from '../type';
import {
  BranchStrategy,
  type ObjectNodeStrategy,
  TerminalStrategy,
} from './strategies';
import { omitEmptyObject } from './utils';

/**
 * A node class for handling object schemas.
 * Manages object properties and handles complex schemas like oneOf.
 */
export class ObjectNode extends AbstractNode<ObjectSchema, ObjectValue> {
  /**
   * Strategy used by the object node:
   *  - BranchStrategy: Handles complex child nodes with associated processing logic, including oneOf/if-then-else.
   *  - TerminalStrategy: Acts as a terminal node for object-type data with no child nodes and simple processing logic.
   * @internal Internal implementation detail. Do not call directly.
   */
  #strategy: ObjectNodeStrategy;

  /**
   * Gets the child nodes of the object node.
   * @returns List of child nodes
   */
  public override get children() {
    return this.#strategy.children;
  }

  /**
   * Gets the value of the object node.
   * @returns Object value or undefined (if empty) or null (if nullable)
   */
  public override get value() {
    return this.#strategy.value;
  }

  /**
   * Sets the value of the object node.
   * @param input - Object value to set
   */
  public override set value(input: ObjectValue | Nullish) {
    this.setValue(input);
  }

  /**
   * Applies input value to the object node.
   * @param input - Object value to set
   * @param option - Setting options
   */
  protected override applyValue(
    this: ObjectNode,
    input: ObjectValue | Nullish,
    option: UnionSetValueOption,
  ) {
    this.#strategy.applyValue(input, option);
  }

  /**
   * Activates this ObjectNode and propagates activation to all child nodes.
   * @param actor - The node that requested activation
   * @returns {boolean} Whether activation was successful
   * @internal Internal implementation method. Do not call directly.
   */
  public override initialize(this: ObjectNode, actor?: SchemaNode): boolean {
    if (super.initialize(actor)) {
      this.#strategy.initialize?.();
      return true;
    }
    return false;
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    nodeFactory,
    parentNode,
    validationMode,
    validatorFactory,
    required,
  }: BranchNodeConstructorProps<ObjectSchema>) {
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
    const handleChange: HandleChange<ObjectValue | Nullish> =
      this.jsonSchema.options?.omitEmpty === false
        ? (value, batch) => super.onChange(value, batch)
        : (value, batch) => super.onChange(omitEmptyObject(value), batch);
    this.onChange = handleChange;
    this.#strategy = this.#createStrategy(handleChange, nodeFactory);
    this.initialize();
  }

  /**
   * Creates a strategy for the object node.
   * @param nodeFactory - Node factory
   * @returns Created strategy: TerminalStrategy | BranchStrategy
   */
  #createStrategy(
    handleChange: HandleChange<ObjectValue | Nullish>,
    nodeFactory: SchemaNodeFactory,
  ) {
    const handleRefresh = (value: ObjectValue | Nullish) => this.refresh(value);
    const handleSetDefaultValue = (value: ObjectValue | Nullish) =>
      this.setDefaultValue(value);

    if (this.group === 'terminal') {
      return new TerminalStrategy(
        this,
        handleChange,
        handleRefresh,
        handleSetDefaultValue,
      );
    } else {
      const handleUpdateComputedProperties = () =>
        this.updateComputedProperties();
      return new BranchStrategy(
        this,
        handleChange,
        handleRefresh,
        handleSetDefaultValue,
        handleUpdateComputedProperties,
        nodeFactory,
      );
    }
  }
}
