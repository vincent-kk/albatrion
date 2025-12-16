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
export class ContextNode extends AbstractNode<ObjectSchema, any> {
  public override readonly type = 'object';

  /** Current context value */
  #value: any;

  /**
   * Gets the current context value.
   * @returns The context value object
   */
  public override get value() {
    return this.#value;
  }

  /**
   * Sets the context value.
   * @param input - The context value to set
   */
  public override set value(input: any) {
    this.setValue(input);
  }

  /**
   * Applies the input value to the context node.
   * @param input - The context value to apply
   */
  protected override applyValue(this: ContextNode, input: any) {
    this.#emitChange(input);
  }

  /**
   * Creates a new ContextNode instance.
   * @param properties - The constructor properties for the context node
   */
  constructor(properties: SchemaNodeConstructorProps<ObjectSchema>) {
    super(properties);
    if (this.defaultValue !== undefined) this.#emitChange(this.defaultValue);
    this.initialize();
  }

  /**
   * Reflects context value changes and publishes related events.
   * @param current - The new context value
   */
  #emitChange(this: ContextNode, current: any) {
    const previous = this.#value;
    this.#value = current;
    this.publish(
      NodeEventType.UpdateValue,
      current,
      { previous, current },
      this.initialized,
    );
  }
}
