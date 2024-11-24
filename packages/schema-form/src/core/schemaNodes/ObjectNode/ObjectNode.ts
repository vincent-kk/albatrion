import { getFallbackValue } from '@lumy/schema-form/helpers/getFallbackValue';
import type {
  ObjectSchema,
  ObjectValue,
  SetStateOptions,
} from '@lumy/schema-form/types';

import { BaseNode } from '../BaseNode';
import { schemaNodeFactory } from '../schemaNodeFactory';
import { MethodType, type SchemaNodeConstructorProps } from '../type';
import type { ChildNode } from './type';
import {
  getChildren,
  getOneOfConditionsMap,
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
    this.setValue(input, { replace: true });
  }
  protected applyValue(input: ObjectValue, options?: SetStateOptions) {
    this.#draft = input;
    this.#replace = options?.replace || false;
    this.#emitChange();
  }
  public parseValue = (value: ObjectValue | undefined) => value;

  #emitChange() {
    if (!this.#ready) return;
    const previous = { ...this.#value };
    if (this.#draft === undefined) {
      this.#value = undefined;
    } else if (this.#replace) {
      this.#value = sortObjectKeys(this.#draft, this.#propertyKeys);
      this.#replace = false;
    } else {
      this.#value = sortObjectKeys(
        {
          ...this.#value,
          ...this.#draft,
        },
        this.#propertyKeys,
      );
    }
    this.onChange(this.#value);

    this.publish({
      type: MethodType.Change,
      payload: this.#value,
      options: {
        previous,
        current: this.#value,
        difference: { ...this.#draft },
      },
    });

    this.#draft = {};
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
    super({ key, name, jsonSchema, defaultValue, onChange, parentNode, ajv });

    if (defaultValue !== undefined) {
      this.#value = this.defaultValue;
    }

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
        node: schemaNodeFactory({
          name,
          jsonSchema: mergeShowConditions(
            schema,
            oneOfConditionsMap?.get(name),
          ),
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
