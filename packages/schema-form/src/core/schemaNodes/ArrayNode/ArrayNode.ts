import type { ArrayValue } from '@lumy/schema-form/types';

import { BaseNode } from '../BaseNode';
import {
  type ConstructorPropsWithNodeFactory,
  MethodType,
  type SchemaNode,
} from '../type';
import parseArray from './parseArray';

type IndexId = `[${number}]`;

export class ArrayNode extends BaseNode {
  readonly type = 'array';

  public children = () => this._edges().map(({ source }) => source);
  public getValue = () => this.toArray();
  public setValue = (value: ArrayValue) => {
    if (Array.isArray(value)) {
      this._ready = false;
      this.clear();
      value.forEach((e: any) => {
        this.push(e);
      });
      this._ready = true;
      this._emitChange();
    }
  };
  public parseValue = (value: ArrayValue) => parseArray(value);

  private _seq = 0;
  private _ids: IndexId[] = [];
  private _sourceMap: Record<
    IndexId,
    {
      data: any;
      node: SchemaNode;
    }
  > = {};

  private _emitChange: VoidFunction;
  private _ready: boolean = false;
  private _nodeFactory: ConstructorPropsWithNodeFactory['nodeFactory'];

  hasChanged: boolean = false;

  mount: boolean = false;

  onChange: Function;

  constructor({
    key,
    name,
    schema,
    defaultValue,
    onChange,
    parentNode,
    ajv,
    nodeFactory,
  }: ConstructorPropsWithNodeFactory<ArrayValue>) {
    super({ key, name, schema, defaultValue, onChange, parentNode, ajv });

    this._nodeFactory = nodeFactory;

    this._emitChange = () => {
      if (this._ready) {
        const value = this.toArray();
        onChange(value);
        this.publish(MethodType.Change, value);
      }
      return;
    };

    if (Array.isArray(defaultValue)) {
      defaultValue.forEach((e: any) => {
        this.push(e);
      });
    }

    while (this.length() < (this.schema.minItems || 0)) {
      this.push();
    }

    this.mount = true;

    this.onChange = onChange;
    this._ready = true;
    this._emitChange();
  }

  public push = (data?: ArrayValue[number]) => {
    if (this.schema.maxItems && this.schema.maxItems <= this.length()) {
      return;
    }

    const id: IndexId = `[${this._seq++}]`;

    const name = `${this._ids.length}`;

    this._ids.push(id);

    const handleChange = (value: ArrayValue) => {
      this.update(id, value);

      if (this.mount) {
        this.onChange(this.toArray());
      }
    };

    const defaultValue =
      data ??
      this.schema.items?.default ??
      (this.schema.items?.type === 'object' ? {} : undefined);

    this._sourceMap[id] = {
      node: this._nodeFactory({
        key: id,
        name,
        schema: this.schema.items,
        defaultValue,
        parentNode: this,
        onChange: handleChange,
      }),
      data: defaultValue,
    };

    this.hasChanged = true;
    this._emitChange();
    return this;
  };

  public update = (id: IndexId, data: ArrayValue[number]) => {
    if (id in this._sourceMap) {
      this._sourceMap[id].data = data;
    }

    this.hasChanged = true;
    return this;
  };

  private updateChildName = () => {
    this._ids.forEach((id, i) => {
      if (this._sourceMap[id]?.node) {
        const node = this._sourceMap[id].node!;
        const newName = i.toString();
        if (node.getName() !== newName) {
          node.setName(newName, this);
        }
      }
    });
  };

  public remove = (idOrIndex: IndexId | number) => {
    let id = typeof idOrIndex === 'number' ? this._ids[idOrIndex] : idOrIndex;
    this._ids = this._ids.filter((nodeId) => nodeId !== id);
    delete this._sourceMap[id];
    this.hasChanged = true;
    this.updateChildName();
    this._emitChange();
    return this;
  };

  public clear = () => {
    this._ids = [];
    this._sourceMap = {};
    this.hasChanged = true;
    this._emitChange();
    return this;
  };

  private _edges = () =>
    this._ids.map((id) => ({ id, source: this._sourceMap[id] }));

  public toArray = () => this._edges().map(({ source }) => source?.data);

  public length = () => this._ids.length;
}
