import { map } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';

import { SchemaNodeError } from '@/schema-form/errors';
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
  #value: VirtualNodeValue = [];

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
    scope,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    refNodes,
    validationMode,
    validatorFactory,
    required,
  }: VirtualNodeConstructorProps<VirtualSchema>) {
    super({
      key,
      name,
      scope,
      jsonSchema,
      defaultValue,
      onChange,
      parentNode,
      validationMode,
      validatorFactory,
      required,
    });

    this.#refNodes = refNodes || [];

    if (this.defaultValue != null) this.#value = this.defaultValue;

    for (let i = 0, l = this.#refNodes.length; i < l; i++) {
      const node = this.#refNodes[i];
      const unsubscribe = node.subscribe(({ type, payload }) => {
        if (type & NodeEventType.UpdateValue) {
          const value = payload?.[NodeEventType.UpdateValue];
          if (this.#value[i] === value) return;
          const previous = this.#value;
          this.#value = [...this.#value];
          this.#value[i] = value;
          this.publish(NodeEventType.UpdateValue, this.#value, {
            previous,
            current: this.#value,
          });
        }
      });
      this.saveUnsubscribe(unsubscribe);
    }

    this.#children = map(this.#refNodes, (node) => ({ node }));

    this.publish(NodeEventType.UpdateChildren);
    this.initialize();
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
    const refNodesLength = this.#refNodes.length;
    if (values !== undefined && values?.length !== refNodesLength)
      throw new SchemaNodeError(
        'INVALID_VIRTUAL_NODE_VALUES',
        `Expected ${refNodesLength}-element array for virtual node, but received ${
          isArray(values)
            ? `${values.length}-element array`
            : (values === null && 'null') || typeof values
        }`,
        {
          expectedValuesLength: refNodesLength,
          actualValuesLength: values?.length,
          providedValues: values,
        },
      );

    const refNodes = this.#refNodes;
    const previous = this.#value;
    this.#value = [...this.#value];
    if (values === undefined) {
      for (let i = 0; i < refNodesLength; i++) {
        refNodes[i].setValue(undefined, option);
        this.#value[i] = undefined;
      }
    } else {
      for (let i = 0; i < refNodesLength; i++) {
        const node = refNodes[i];
        const value = values[i];
        if (node.value === value) continue;
        node.setValue(value, option);
        this.#value[i] = node.value;
      }
    }
    if (option & SetValueOption.Refresh) this.refresh(values);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish(NodeEventType.UpdateValue, this.#value, {
        previous,
        current: this.#value,
      });
  }
}
