import { equals } from '@winglet/common-utils/object';

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
  public override readonly type = 'object';

  public override equals(
    this: ObjectNode,
    left: ObjectValue | Nullish,
    right: ObjectValue | Nullish,
  ): boolean {
    return equals(left, right);
  }

  /**
   * Strategy used by the object node:
   *  - BranchStrategy: Handles complex child nodes with associated processing logic, including oneOf/if-then-else.
   *  - TerminalStrategy: Acts as a terminal node for object-type data with no child nodes and simple processing logic.
   * @internal Internal implementation detail. Do not call directly.
   */
  private __strategy__: ObjectNodeStrategy;

  /**
   * Gets the value of the object node.
   * @returns Object value or undefined (if empty) or null (if nullable)
   */
  public override get value() {
    return this.__strategy__.value;
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
    this.__strategy__.applyValue(input, option);
  }

  /**
   * Gets the child nodes of the object node.
   * @returns List of child nodes
   */
  public override get children() {
    return this.__strategy__.children;
  }

  /**
   * Gets the list of subnodes of the object node.
   * @returns List of subnodes
   */
  public override get subnodes() {
    return this.__strategy__.subnodes;
  }

  /**
   * Activates this ObjectNode and propagates activation to all child nodes.
   * @param actor - The node that requested activation
   * @returns {boolean} Whether activation was successful
   * @internal Internal implementation method. Do not call directly.
   */
  public override initialize(this: ObjectNode, actor?: SchemaNode): boolean {
    if (super.initialize(actor)) {
      this.__strategy__.initialize?.();
      return true;
    }
    return false;
  }

  constructor(properties: BranchNodeConstructorProps<ObjectSchema>) {
    super(properties);
    const handleChange: HandleChange<ObjectValue | Nullish> =
      this.jsonSchema.options?.omitEmpty === false
        ? (value, batch) => super.onChange(value, batch)
        : (value, batch) => super.onChange(omitEmptyObject(value), batch);
    this.onChange = handleChange;
    this.__strategy__ = this.__createStrategy__(
      handleChange,
      properties.nodeFactory,
    );
    this.initialize();
  }

  /**
   * Creates a strategy for the object node.
   * @param nodeFactory - Node factory
   * @returns Created strategy: TerminalStrategy | BranchStrategy
   */
  private __createStrategy__(
    handleChange: HandleChange<ObjectValue | Nullish>,
    nodeFactory: SchemaNodeFactory,
  ) {
    const handleRefresh = (value: ObjectValue | Nullish) => this.refresh(value);
    const handleSetDefaultValue = (value: ObjectValue | Nullish) =>
      this.setDefaultValue(value);
    return this.group === 'terminal'
      ? new TerminalStrategy(
          this,
          handleChange,
          handleRefresh,
          handleSetDefaultValue,
        )
      : new BranchStrategy(
          this,
          handleChange,
          handleRefresh,
          handleSetDefaultValue,
          nodeFactory,
        );
  }
}
