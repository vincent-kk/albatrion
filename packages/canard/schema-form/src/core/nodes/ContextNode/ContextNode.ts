import type { ObjectSchema } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import { NodeEventType, type SchemaNodeConstructorProps } from '../type';

/**
 * Node class for providing context data to descendant nodes.
 *
 * ContextNode serves as a context provider in the schema form tree,
 * allowing descendant nodes to access shared context values through
 * computed properties and expressions.
 */
export class ContextNode extends AbstractNode<ObjectSchema> {
  public override readonly type = 'object';

  /** Current context value */
  private __value__: unknown;

  /**
   * Gets the current context value.
   * @returns The context value object
   */
  public override get value() {
    return this.__value__;
  }

  /**
   * Sets the context value.
   * @param input - The context value to set
   */
  public override set value(input: unknown) {
    this.setValue(input);
  }

  /**
   * Applies the input value to the context node.
   * @param input - The context value to apply
   */
  protected override applyValue(this: ContextNode, input: unknown) {
    this.__emitChange__(input);
  }

  /**
   * Creates a new ContextNode instance.
   * @param properties - The constructor properties for the context node
   */
  constructor(properties: SchemaNodeConstructorProps<ObjectSchema>) {
    super(properties);
    if (this.defaultValue !== undefined) this.__emitChange__(this.defaultValue);
    this.__initialize__();
  }

  /**
   * Reflects context value changes and publishes related events.
   * @param current - The new context value
   */
  private __emitChange__(this: ContextNode, current: unknown) {
    const previous = this.__value__;
    this.__value__ = current;
    this.publish(
      NodeEventType.UpdateValue,
      current,
      { previous, current },
      this.initialized,
    );
  }
}
