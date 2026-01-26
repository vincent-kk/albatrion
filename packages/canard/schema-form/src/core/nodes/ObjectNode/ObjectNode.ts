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
 * Node class for handling object schemas.
 * @remarks Manages object properties and handles complex schemas like `oneOf`/`anyOf`/`if-then-else`.
 */
export class ObjectNode extends AbstractNode<ObjectSchema, ObjectValue> {
  public override readonly type = 'object';

  /** Active child nodes within the current scope. */
  public override get children() {
    return this.__strategy__.children;
  }

  /** All child nodes regardless of scope or active state. */
  public override get subnodes() {
    return this.__strategy__.subnodes;
  }

  /**
   * @internal Strategy used by the object node.
   * @remarks `BranchStrategy` for branch node with child nodes,
   *          `TerminalStrategy` for simple object data, without child nodes.
   */
  private __strategy__: ObjectNodeStrategy;

  /** @internal */
  protected override __equals__(
    this: ObjectNode,
    left: ObjectValue | Nullish,
    right: ObjectValue | Nullish,
  ): boolean {
    return equals(left, right);
  }

  protected override applyValue(
    this: ObjectNode,
    input: ObjectValue | Nullish,
    option: UnionSetValueOption,
  ) {
    this.__strategy__.applyValue(input, option);
  }

  /** Current object value or `undefined`. */
  public override get value() {
    return this.__strategy__.value;
  }

  public override set value(input: ObjectValue | Nullish) {
    this.setValue(input);
  }

  /** @internal */
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
