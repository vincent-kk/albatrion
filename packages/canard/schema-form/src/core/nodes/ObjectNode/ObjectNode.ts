import {
  getObjectKeys,
  isEmptyObject,
  sortObjectKeys,
} from '@winglet/common-utils';

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
  getOneOfChildrenList,
  getOneOfProperties,
  getVirtualReferencesMap,
  removeOneOfProperties,
} from './utils';

const RESET_NODE_OPTION = SetValueOption.Replace | SetValueOption.Propagate;

export class ObjectNode extends AbstractNode<ObjectSchema, ObjectValue> {
  readonly #schemaKeys: string[];
  readonly #oneOfKeySet: Set<string> | undefined;

  #locked: boolean = true;

  #propertyChildren: ChildNode[];

  #oneOfChildrenList: Array<ChildNode[]> | undefined;

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
    const value = sortObjectKeys(input, this.#schemaKeys, true);
    return isEmptyObject(value) ? undefined : value;
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
      for (let i = 0; i < this.#propertyChildren.length; i++)
        (this.#propertyChildren[i].node as AbstractNode).prepare(this);
      if (this.#oneOfChildrenList)
        for (let i = 0; i < this.#oneOfChildrenList.length; i++)
          for (let j = 0; j < this.#oneOfChildrenList[i].length; j++)
            (this.#oneOfChildrenList[i][j].node as AbstractNode).prepare(this);
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
    const propertyKeys = getObjectKeys(properties);

    this.#oneOfKeySet = getOneOfProperties(jsonSchema);
    this.#schemaKeys = this.#oneOfKeySet
      ? [...propertyKeys, ...Array.from(this.#oneOfKeySet)]
      : propertyKeys;

    const { virtualReferencesMap, virtualReferenceFieldsMap } =
      getVirtualReferencesMap(name, propertyKeys, jsonSchema.virtual);

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
      propertyKeys,
      this.defaultValue,
      virtualReferenceFieldsMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.#propertyChildren = getChildren(
      this,
      propertyKeys,
      childNodeMap,
      virtualReferenceFieldsMap,
      virtualReferencesMap,
      nodeFactory,
    );

    this.#oneOfChildrenList = getOneOfChildrenList(
      this,
      jsonSchema,
      this.defaultValue,
      childNodeMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.#children = this.#propertyChildren;

    this.#locked = false;

    this.#publishChildrenChange();

    this.#emitChange(SetValueOption.Normal);
    this.setDefaultValue(this.#value);

    this.#prepareOneOfChildren();
    this.prepare();
  }

  #previousIndex: number | undefined;
  #prepareOneOfChildren(this: ObjectNode) {
    if (!this.#oneOfChildrenList) return;
    this.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateComputedProperties) {
        const index = this.oneOfIndex;
        if (index === undefined || index === this.#previousIndex) return;

        const previousOneOfChildren =
          index > -1 ? this.#oneOfChildrenList?.[index] : undefined;

        if (previousOneOfChildren)
          for (const child of previousOneOfChildren) child.node.resetNode();

        const oneOfChildren =
          index > -1 ? this.#oneOfChildrenList?.[index] : undefined;

        this.#children = oneOfChildren
          ? [...this.#propertyChildren, ...oneOfChildren]
          : this.#propertyChildren;

        this.setValue(
          removeOneOfProperties(this.#value, this.#oneOfKeySet),
          RESET_NODE_OPTION,
        );

        this.#previousIndex = this.oneOfIndex;
        this.#publishChildrenChange();
      }
    });
  }

  #publishChildrenChange(this: ObjectNode) {
    if (this.#locked) return;
    this.publish({
      type: NodeEventType.UpdateChildren,
    });
  }
}
