import { getObjectKeys, sortObjectKeys } from '@winglet/common-utils';

import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  type BranchNodeConstructorProps,
  NodeEventType,
  type SchemaNode,
  SetValueOption,
} from '../type';
import type { ChildNode } from './type';
import {
  getChildNodeMap,
  getChildren,
  getObjectValueWithSchema,
  getOneOfConditionsMap,
  getVirtualReferencesMap,
} from './utils';

export class ObjectNode extends AbstractNode<ObjectSchema, ObjectValue> {
  readonly #propertyKeys: string[];
  #locked: boolean = true;

  #children: ChildNode[];
  get children() {
    return this.#children;
  }

  #value: ObjectValue | undefined;
  #draft: ObjectValue | undefined;

  get value() {
    return this.#value;
  }
  set value(input: ObjectValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(
    this: ObjectNode,
    input: ObjectValue,
    option: SetValueOption,
  ) {
    this.#draft = input;
    this.#emitChange(option);
  }

  #parseValue(this: ObjectNode, input: ObjectValue) {
    return getObjectValueWithSchema(
      sortObjectKeys(input, this.#propertyKeys, true),
      this.jsonSchema,
    );
  }
  #propagate(this: ObjectNode, replace: boolean, option: SetValueOption) {
    this.#locked = true;
    const target = this.#value || {};
    const draft = this.#draft || {};
    for (let i = 0; i < this.#children.length; i++) {
      const node = this.#children[i].node;
      if (node.type === 'virtual') continue;
      const key = node.name;
      if (replace || (key in draft && key in target))
        node.setValue(target[key], option);
    }
    this.#locked = false;
  }

  #emitChange(this: ObjectNode, option: SetValueOption) {
    if (this.#locked) return;

    const replace = !!(option & SetValueOption.Replace);
    const previous = this.#value ? { ...this.#value } : undefined;

    if (this.#draft === undefined) {
      this.#value = undefined;
    } else if (replace || this.#value === undefined) {
      this.#value = this.#parseValue(this.#draft);
    } else {
      this.#value = this.#parseValue({
        ...this.#value,
        ...this.#draft,
      });
    }

    this.onChange(this.#value);
    this.publish({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: this.#value,
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous,
          current: this.#value,
        },
      },
    });

    if (option & SetValueOption.Propagate) this.#propagate(replace, option);
    if (option & SetValueOption.Refresh) this.refresh(this.#value);

    this.#draft = {};
  }

  prepare(this: ObjectNode, actor?: SchemaNode): boolean {
    if (super.prepare(actor)) {
      for (let i = 0; i < this.#children.length; i++)
        (this.#children[i].node as AbstractNode).prepare(this);
      return true;
    }
    return false;
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    nodeFactory,
    parentNode,
    validationMode,
    ajv,
  }: BranchNodeConstructorProps<ObjectSchema>) {
    super({
      key,
      name,
      jsonSchema,
      defaultValue,
      onChange,
      parentNode,
      validationMode,
      ajv,
    });

    this.#value = this.defaultValue;
    this.#draft = {};

    const properties = jsonSchema.properties;
    this.#propertyKeys = getObjectKeys(properties);

    const oneOfConditionsMap: Map<string, string[]> | null =
      getOneOfConditionsMap(jsonSchema);

    const { virtualReferencesMap, virtualReferenceFieldsMap } =
      getVirtualReferencesMap(name, this.#propertyKeys, jsonSchema.virtual);

    const handelChangeFactory = (name: string) => (input: any) => {
      if (!this.#draft) this.#draft = {};
      const value =
        typeof input === 'function' ? input(this.#draft[name]) : input;
      if (value !== undefined && this.#draft[name] === value) return;
      this.#draft[name] = value;
      this.#emitChange(SetValueOption.Normal);
    };

    const childNodeMap = getChildNodeMap(
      this,
      jsonSchema,
      this.#propertyKeys,
      this.defaultValue,
      virtualReferenceFieldsMap,
      oneOfConditionsMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.#children = getChildren(
      this,
      this.#propertyKeys,
      childNodeMap,
      virtualReferenceFieldsMap,
      virtualReferencesMap,
      nodeFactory,
    );

    this.#locked = false;

    this.#emitChange(SetValueOption.Normal);
    this.setDefaultValue(this.#value);

    this.publish({
      type: NodeEventType.UpdateChildren,
    });

    this.prepare();
  }
}
