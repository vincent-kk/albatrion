import { SchemaNodeError } from '@lumy/schema-form/errors';
import type { ObjectSchema, ObjectValue } from '@lumy/schema-form/types';
import { isPlainObject } from 'es-toolkit';

import { BaseNode } from '../BaseNode';
import { type ConstructorPropsWithNodeFactory, MethodType } from '../type';
import type { ChildNode, VirtualReference } from './type';
import {
  getChildren,
  getInvertedAnyOfMap,
  mergeShowConditions,
  sortObjectKeys,
} from './utils';

export class ObjectNode extends BaseNode<ObjectSchema, ObjectValue> {
  readonly type = 'object';

  readonly #propertyKeys: string[] = [];

  #replace: boolean = false;
  #ready: boolean = false;

  #children: ChildNode[] = [];
  get children() {
    return this.#children;
  }

  #value: ObjectValue | undefined = undefined;
  #draft: ObjectValue | undefined = {};
  get value() {
    return this.#value;
  }
  set value(input: ObjectValue | undefined) {
    this.#draft = input;
    this.#emitChange();
  }
  public parseValue = (value: ObjectValue | undefined) => value;

  #onChange: (value: ObjectValue | undefined) => void;

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
    if (typeof this.#onChange === 'function') {
      this.#onChange(this.#value);
    }
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
    nodeFactory,
  }: ConstructorPropsWithNodeFactory<ObjectValue>) {
    super({ key, name, jsonSchema, defaultValue, onChange, parentNode, ajv });

    this.#onChange = onChange;

    if (defaultValue !== undefined) {
      this.#value = this.defaultValue;
    }

    this.#propertyKeys = jsonSchema.properties
      ? Object.keys(jsonSchema.properties)
      : [];

    const invertedAnyOfMap: Map<string, string[]> | null =
      getInvertedAnyOfMap(jsonSchema);

    const virtualReferenceFieldsMap = new Map<
      string,
      VirtualReference['fields']
    >();
    const virtualReferencesMap = new Map<string, VirtualReference>();

    if (jsonSchema.virtual) {
      const propertySet = new Set(this.#propertyKeys);

      for (const [key, value] of Object.entries(jsonSchema.virtual)) {
        if (!Array.isArray(value.fields)) {
          throw new SchemaNodeError(
            'VIRTUAL_FIELDS_NOT_VALID',
            `'virtual.fields' is must be an array.`,
            {
              nodeKey: key,
              nodeValue: value,
              name: name || 'root',
            },
          );
        }

        // NOTE: virtual field는 모두 properties에 정의되어 있어야 함
        const notFoundFields = value.fields.filter(
          (field) => !propertySet.has(field),
        );
        if (notFoundFields.length > 0) {
          throw new SchemaNodeError(
            'VIRTUAL_FIELDS_NOT_IN_PROPERTIES',
            `virtual fields are not found on properties`,
            {
              nodeKey: key,
              nodeValue: value,
              notFoundFields,
            },
          );
        }

        for (const field of value.fields) {
          virtualReferenceFieldsMap.set(field, [
            ...(virtualReferenceFieldsMap.get(field) || []),
            key,
          ]);
        }

        virtualReferencesMap.set(key, value);
      }
    }

    const childNodeMap = new Map<string, ChildNode>();

    for (const [name, schema] of Object.entries(jsonSchema.properties || {})) {
      const handleChange = (value: ObjectValue | undefined) => {
        if (!this.#draft) return;
        if (value !== undefined && this.#draft[name] === value) return;
        this.#draft[name] = value;
        this.#emitChange();
      };
      childNodeMap.set(name, {
        isVirtualized: !!virtualReferenceFieldsMap.get(name)?.length,
        node: nodeFactory({
          name,
          schema: mergeShowConditions(schema, invertedAnyOfMap?.get(name)),
          parentNode: this,
          defaultValue: defaultValue?.[name],
          onChange: handleChange,
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
