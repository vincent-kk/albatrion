import { map } from '@winglet/common-utils';

import type { VirtualNodeValue, VirtualSchema } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  type ChildNode,
  NodeEventType,
  type SchemaNode,
  SetValueOption,
  type UnionSetValueOption,
  type VirtualNodeConstructorProps,
} from '../type';

/**
 * Node class for handling virtual schemas.
 * Holds references to multiple nodes and works by integrating them.
 */
export class VirtualNode extends AbstractNode<VirtualSchema, VirtualNodeValue> {
  /** Current value of the virtual node */
  #value: VirtualNodeValue | undefined = [];

  /**
   * Gets the value of the virtual node.
   * @returns Array of values from all referenced nodes or undefined
   */
  public override get value() {
    return this.#value;
  }

  /**
   * Sets the value of the virtual node.
   * @param input - The value to set
   */
  public override set value(input: VirtualNodeValue | undefined) {
    this.setValue(input);
  }

  /**
   * Applies the input value to the virtual node.
   * @param input - The value to set
   * @param option - Set value options
   */
  protected override applyValue(
    this: VirtualNode,
    input: VirtualNodeValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  /** List of reference nodes */
  #refNodes: SchemaNode[] = [];

  /** List of child nodes */
  #children: ChildNode[];

  /**
   * Gets the child nodes of the virtual node.
   * @returns List of child nodes
   */
  public override get children() {
    return this.#children;
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    refNodes,
    validationMode,
    required,
    ajv,
  }: VirtualNodeConstructorProps<VirtualSchema>) {
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

    this.#refNodes = refNodes || [];

    if (this.defaultValue !== undefined) this.#value = this.defaultValue;

    for (let index = 0; index < this.#refNodes.length; index++) {
      const node = this.#refNodes[index];
      const unsubscribe = node.subscribe(({ type, payload }) => {
        if (type & NodeEventType.UpdateValue) {
          const onChangePayload = payload?.[NodeEventType.UpdateValue];
          if (this.#value && this.#value[index] !== onChangePayload) {
            const previous = this.#value;
            this.#value = [...this.#value];
            this.#value[index] = onChangePayload;
            this.publish({
              type: NodeEventType.UpdateValue,
              payload: { [NodeEventType.UpdateValue]: this.#value },
              options: {
                [NodeEventType.UpdateValue]: {
                  previous,
                  current: this.#value,
                },
              },
            });
          }
        }
      });
      this.saveUnsubscribe(unsubscribe);
    }

    this.#children = map(this.#refNodes, (node) => ({ node }));

    this.publish({ type: NodeEventType.UpdateChildren });
    this.activate();
  }

  /**
   * Propagates value changes to reference nodes and publishes related events.
   * @param values - The values to set
   * @param option - Set value options
   */
  #emitChange(
    this: VirtualNode,
    values: VirtualNodeValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    if (!values || values.length !== this.#refNodes.length) return;
    const refNodes = this.#refNodes;
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const node = refNodes[i];
      if (node.value !== value) node.setValue(value, option);
    }
    if (option & SetValueOption.Refresh) this.refresh(values);
  }
}
