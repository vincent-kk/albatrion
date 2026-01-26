import { map } from '@winglet/common-utils/array';

import { JsonSchemaError } from '@/schema-form/errors';
import { formatInvalidVirtualNodeValuesError } from '@/schema-form/helpers/error';
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
 * @remarks Holds references to multiple nodes and works by integrating them.
 *          Useful for creating composite form fields that control multiple values.
 */
export class VirtualNode extends AbstractNode<VirtualSchema, VirtualNodeValue> {
  public override readonly type = 'virtual';

  /** @internal Current value of the virtual node. */
  private __value__: VirtualNodeValue = [];

  /** @internal List of reference nodes. */
  private __refNodes__: SchemaNode[] = [];

  /** @internal List of child nodes. */
  private __children__: ChildNode[];

  /**
   * @internal Propagates value changes to reference nodes and publishes related events.
   * @param values - The values to set
   * @param option - Set value options
   */
  private __emitChange__(
    this: VirtualNode,
    values: VirtualNodeValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const refNodesLength = this.__refNodes__.length;
    if (values !== undefined && values?.length !== refNodesLength)
      throw new JsonSchemaError(
        'INVALID_VIRTUAL_NODE_VALUES',
        formatInvalidVirtualNodeValuesError(
          refNodesLength,
          values?.length,
          values,
        ),
        {
          expectedValuesLength: refNodesLength,
          actualValuesLength: values?.length,
          providedValues: values,
        },
      );

    const inject = (option & SetValueOption.PreventInjection) === 0;

    const refNodes = this.__refNodes__;
    const previous = this.__value__;
    const current = [...previous];
    if (values === undefined)
      for (let i = 0; i < refNodesLength; i++) {
        refNodes[i].setValue(undefined, option);
        current[i] = undefined;
      }
    else
      for (let i = 0; i < refNodesLength; i++) {
        const node = refNodes[i];
        const value = values[i];
        if (node.value === value) continue;
        node.setValue(value, option);
        current[i] = node.value;
      }
    this.__value__ = current;
    if (option & SetValueOption.Refresh)
      this.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        this.initialized,
      );
  }

  protected override applyValue(
    this: VirtualNode,
    input: VirtualNodeValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.__emitChange__(input, option);
  }

  /** Array of values from all referenced nodes. */
  public override get value() {
    return this.__value__;
  }

  public override set value(input: VirtualNodeValue | undefined) {
    this.setValue(input);
  }

  /** Child nodes representing the referenced nodes. */
  public override get children() {
    return this.__children__;
  }

  constructor(properties: VirtualNodeConstructorProps<VirtualSchema>) {
    super(properties);
    this.__refNodes__ = properties.refNodes || [];
    if (this.defaultValue != null) this.__value__ = this.defaultValue;
    for (let i = 0, l = this.__refNodes__.length; i < l; i++) {
      const node = this.__refNodes__[i];
      const unsubscribe = node.subscribe(({ type, payload }) => {
        if (type & NodeEventType.UpdateValue) {
          const value = payload?.[NodeEventType.UpdateValue];
          const previous = this.__value__;
          if (previous[i] === value) return;
          const current = [...previous];
          current[i] = value;
          this.__value__ = current;
          this.publish(
            NodeEventType.UpdateValue,
            current,
            { previous, current, inject: true },
            true,
          );
        }
      });
      this.saveUnsubscribe(unsubscribe);
    }
    this.__children__ = map(this.__refNodes__, (node) => ({ node }));
    this.publish(NodeEventType.UpdateChildren);
    this.__initialize__();
  }
}
