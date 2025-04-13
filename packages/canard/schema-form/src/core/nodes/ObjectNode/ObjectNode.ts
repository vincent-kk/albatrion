import { sortObjectKeys } from '@winglet/common-utils';

import { getFallbackValue } from '@/schema-form/helpers/fallbackValue';
import {
  type ObjectSchema,
  type ObjectValue,
  SetStateOption,
} from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  type BranchNodeConstructorProps,
  NodeEventType,
  type NodeFactory,
} from '../type';
import type { ChildNode } from './type';
import {
  getChildren,
  getDataWithSchema,
  getOneOfConditionsMap,
  getVirtualReferencesMap,
  mergeShowConditions,
} from './utils';

export class ObjectNode extends AbstractNode<ObjectSchema, ObjectValue> {
  readonly #propertyKeys: string[] = [];

  #replace: boolean = false;
  #ready: boolean = false;

  #children: ChildNode[] = [];
  get children() {
    return this.#children;
  }

  #value: ObjectValue | undefined = {};
  #draft: ObjectValue | undefined = {};
  get value() {
    return this.#value;
  }
  set value(input: ObjectValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(input: ObjectValue, option: SetStateOption) {
    this.#draft = input;
    this.#replace = !!(option & SetStateOption.Replace);
    this.#emitChange(option);
  }
  public parseValue = (value: ObjectValue | undefined) => value;

  #emitChange(option: SetStateOption) {
    if (!this.#ready) return;

    const previous = this.#value ? { ...this.#value } : undefined;

    if (this.#draft === undefined) this.#value = undefined;
    else if (this.#replace)
      this.#value = getDataWithSchema(
        sortObjectKeys(this.#draft, this.#propertyKeys),
        this.jsonSchema,
      );
    else
      this.#value = getDataWithSchema(
        sortObjectKeys(
          {
            ...this.#value,
            ...this.#draft,
          },
          this.#propertyKeys,
        ),
        this.jsonSchema,
      );

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

    if (option & SetStateOption.Propagate) {
      const target = this.#value || {};
      for (let i = 0; i < this.#children.length; i++) {
        const node = this.#children[i].node;
        if (node.type !== 'virtual') node.setValue(target[node.name], option);
      }
    }

    if (option & SetStateOption.Refresh) this.refresh(this.#value);

    if (this.#replace) this.#replace = false;
    this.#draft = {};
  }

  #nodeFactory: NodeFactory;

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

    this.#nodeFactory = nodeFactory;

    if (this.defaultValue !== undefined) this.#value = this.defaultValue;

    this.#propertyKeys = jsonSchema.properties
      ? Object.keys(jsonSchema.properties)
      : [];

    const oneOfConditionsMap: Map<string, string[]> | null =
      getOneOfConditionsMap(jsonSchema);

    const { virtualReferencesMap, virtualReferenceFieldsMap } =
      getVirtualReferencesMap(name, this.#propertyKeys, jsonSchema.virtual);

    const childNodeMap = new Map<string, ChildNode>();

    for (const [name, schema] of Object.entries(jsonSchema.properties || {})) {
      childNodeMap.set(name, {
        isVirtualized: !!virtualReferenceFieldsMap?.get(name)?.length,
        node: this.#nodeFactory({
          name,
          jsonSchema: mergeShowConditions(
            schema,
            oneOfConditionsMap?.get(name),
          ),
          defaultValue: this.defaultValue?.[name] ?? getFallbackValue(schema),
          onChange: (input) => {
            if (!this.#draft) this.#draft = {};
            const value =
              typeof input === 'function' ? input(this.#draft[name]) : input;
            if (value !== undefined && this.#draft[name] === value) return;
            this.#draft[name] = value;
            this.#emitChange(SetStateOption.None);
          },
          nodeFactory: this.#nodeFactory,
          parentNode: this,
        }),
      });
    }

    this.#children = getChildren(
      this,
      childNodeMap,
      virtualReferenceFieldsMap,
      virtualReferencesMap,
      this.#nodeFactory,
    );

    this.publish({
      type: NodeEventType.UpdateChildren,
    });

    this.#ready = true;
    this.#emitChange(SetStateOption.None);
  }
}
