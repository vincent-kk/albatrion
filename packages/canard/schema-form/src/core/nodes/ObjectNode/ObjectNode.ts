import { equals } from '@winglet/common-utils/object';

import type { Nullish } from '@aileron/declare';

import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import type {
  BranchNodeConstructorProps,
  HandleChange,
  SchemaNode,
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
   * Strategy used by the object node:
   *  - BranchStrategy: Handles complex child nodes with associated processing logic, including oneOf/if-then-else.
   *  - TerminalStrategy: Acts as a terminal node for object-type data with no child nodes and simple processing logic.
   */
  private __strategy__: ObjectNodeStrategy;

  protected override __equals__(
    this: ObjectNode,
    left: ObjectValue | Nullish,
    right: ObjectValue | Nullish,
  ): boolean {
    return equals(left, right);
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
   * Activates this ObjectNode and propagates activation to all child nodes.
   * @param actor - The node that requested activation
   * @returns {boolean} Whether activation was successful
   */
  protected override __initialize__(
    this: ObjectNode,
    actor?: SchemaNode,
  ): boolean {
    if (super.__initialize__(actor)) {
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
    this.__strategy__ =
      this.group === 'terminal'
        ? new TerminalStrategy(this, handleChange)
        : new BranchStrategy(this, handleChange, properties.nodeFactory);
    this.__initialize__();
  }
}
