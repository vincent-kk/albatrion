// import parseString from './parseString';
import type { VirtualNodeValue, VirtualSchema } from '@lumy/schema-form/types';

import { BaseNode } from '../BaseNode';
import { type ConstructorProps, MethodType, type SchemaNode } from '../type';

export class VirtualNode extends BaseNode {
  readonly defaultValue: VirtualNodeValue;
  readonly type = 'virtual';

  public children = () => this._children;
  public getValue = () => this._value;
  public setValue = (value: VirtualNodeValue) => this._emitChange(value);
  public parseValue = (value: VirtualNodeValue) => value;

  private _children: { node: SchemaNode }[] = [];
  private _emitChange: (value: VirtualNodeValue) => void;
  private _value: VirtualNodeValue | undefined;
  private _refNodes: SchemaNode<'base'>[];

  constructor({
    key,
    name,
    schema,
    defaultValue,
    onChange,
    parentNode,
    refNodes,
    ajv,
  }: ConstructorProps<VirtualNodeValue, VirtualSchema>) {
    super({ key, name, schema, defaultValue, onChange, parentNode, ajv });
    this.defaultValue = defaultValue || [];
    this._value = this.defaultValue;
    this._refNodes = refNodes || [];

    this._refNodes.forEach((node, i) => {
      node.subscribe((type, payload) => {
        if (
          type === MethodType.Change &&
          this._value &&
          this._value[i] !== payload
        ) {
          this._value = [
            ...this._value.slice(0, i),
            payload,
            ...this._value.slice(i + 1),
          ];
          this.publish(MethodType.Change, this._value);
        }
      });
    });

    this._children = refNodes?.map((node) => ({ node })) || [];

    this._emitChange = (values) => {
      if (values.length === this._refNodes.length) {
        values.forEach((value, i) => {
          const node = this._refNodes[i];
          if (
            node.getValue() !== value &&
            typeof node.setValue === 'function'
          ) {
            node.setValue(value);
          }
        });
      }
    };
  }
}
