import { isPlainObject } from 'es-toolkit';

import type { ObjectSchema, ObjectValue } from '@lumy/schema-form/types';

import { BaseNode } from '../BaseNode';
import { getFallbackValue } from '../BaseNode/utils';
import { schemaNodeFactory } from '../schemaNodeFactory';
import { MethodType, type SchemaNodeConstructorProps } from '../type';
import type { ChildNode } from './type';
import {
  getChildren,
  getInvertedAnyOfMap,
  getVirtualReferencesMap,
  mergeShowConditions,
  sortObjectKeys,
} from './utils';

export class ObjectNode extends BaseNode<ObjectSchema, ObjectValue> {
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
  protected applyValue(input: ObjectValue) {
    this.#draft = input;
    this.#emitChange();
  }
  public parseValue = (value: ObjectValue | undefined) => value;

  #onChange: SetStateFn<ObjectValue | undefined>;

  #emitChange() {
    if (!this.#ready) return;
    if (this.#draft === undefined) {
      this.#value = undefined;
    }
    if (Object.keys(this.#draft || {}).length === 0 && !this.#replace) {
      return;
    }

    if (this.#replace) {
      this.#value = sortObjectKeys({ ...this.#draft }, this.#propertyKeys);
      this.#replace = false;
    } else {
      this.#value = sortObjectKeys(
        {
          ...(isPlainObject(this.#value) && this.#value),
          ...this.#draft,
        },
        this.#propertyKeys,
      );
    }
    this.#draft = {};
    this.#onChange(this.#value);
    this.publish(MethodType.Change, this.#value);
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    ajv,
  }: SchemaNodeConstructorProps<ObjectSchema>) {
    super({ key, name, jsonSchema, defaultValue, parentNode, ajv });

    this.#onChange = onChange;

    if (defaultValue !== undefined) {
      this.#value = this.defaultValue;
    }

    this.#propertyKeys = jsonSchema.properties
      ? Object.keys(jsonSchema.properties)
      : [];

    const invertedAnyOfMap: Map<string, string[]> | null =
      getInvertedAnyOfMap(jsonSchema);

    const { virtualReferencesMap, virtualReferenceFieldsMap } =
      getVirtualReferencesMap(name, this.#propertyKeys, jsonSchema.virtual);

    const childNodeMap = new Map<string, ChildNode>();

    for (const [name, schema] of Object.entries(jsonSchema.properties || {})) {
      childNodeMap.set(name, {
        isVirtualized: !!virtualReferenceFieldsMap?.get(name)?.length,
        node: schemaNodeFactory({
          name,
          jsonSchema: mergeShowConditions(schema, invertedAnyOfMap?.get(name)),
          parentNode: this,
          defaultValue: defaultValue?.[name] ?? getFallbackValue(schema),
          onChange: (input) => {
            if (!this.#draft) return;
            const value =
              typeof input === 'function' ? input(this.#draft[name]) : input;
            if (value !== undefined && this.#draft[name] === value) return;
            this.#draft[name] = value;
            this.#emitChange();
          },
        }),
      });
    }

    this.#children = getChildren(
      this,
      childNodeMap,
      virtualReferenceFieldsMap,
      virtualReferencesMap,
    );

    this.#ready = true;
    this.#emitChange();
  }
}
