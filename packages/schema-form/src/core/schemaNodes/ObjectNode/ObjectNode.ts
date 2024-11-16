import type {
  ObjectSchema,
  ObjectValue,
  VirtualSchema,
} from '@lumy/schema-form/types';
import { isPlainObject, merge } from 'es-toolkit';

import { BaseNode } from '../BaseNode';
import { type ConstructorPropsWithNodeFactory, MethodType } from '../type';
import type { ChildNode, VirtualReference } from './type';
import { combineConditions, sortObjectKeys } from './utils';

export class ObjectNode extends BaseNode<ObjectSchema, ObjectValue> {
  readonly type = 'object';

  readonly #properties: string[] = [];

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
      this.#value = sortObjectKeys({ ...this.#draft }, this.#properties);
      this.#replace = false;
    } else {
      this.#value = sortObjectKeys(
        {
          ...(isPlainObject(this.#value) && this.#value),
          ...this.#draft,
        },
        this.#properties,
      );
    }

    this.#draft = {};
    if (typeof this.#onChange === 'function') {
      this.#onChange(this.#value);
      this.publish(MethodType.Change, this.#value);
    }
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

    this.#properties = Object.keys(jsonSchema.properties || {});

    const invertedAnyOf: Dictionary<string[]> = {};
    if (jsonSchema.anyOf && Array.isArray(jsonSchema.anyOf)) {
      jsonSchema.anyOf
        .filter(
          (
            subSchema,
          ): subSchema is PickAndPartial<
            ObjectSchema,
            'properties' | 'required'
          > =>
            subSchema.properties !== undefined &&
            Array.isArray(subSchema.required),
        )
        .forEach(({ properties, required }) => {
          const conditions = Object.entries(properties)
            .filter(([, v]) => Array.isArray(v?.enum) && v.enum.length > 0)
            .map(([k, v]) =>
              v.enum && v.enum.length === 1
                ? `${JSON.stringify(v.enum[0])} === @.${k}`
                : `${JSON.stringify(v.enum)}.includes(@.${k})`,
            );
          required.forEach((field) => {
            invertedAnyOf[field] = [
              ...(invertedAnyOf[field] || []),
              ...conditions,
            ];
          });
        });
    }

    const virtualReferenceFields: Dictionary<VirtualReference['fields']> = {};
    const virtualReferences: Dictionary<VirtualReference> = {};

    if (jsonSchema.virtual) {
      const knownProperties = Object.keys(jsonSchema.properties || {});
      Object.entries(jsonSchema.virtual).forEach(([k, v]) => {
        const { fields } = v;

        if (!fields) {
          throw new Error(`'virtual.fields' is not found in ${name || 'root'}`);
        }

        // NOTE: virtual field는 모두 properties에 정의되어 있어야 함
        const notFoundFields = fields.filter(
          (field) => !knownProperties.includes(field),
        );

        if (notFoundFields.length > 0) {
          throw new Error(
            `virtual fields are not found on properties. (${notFoundFields.join(', ')})`,
          );
        }

        fields.forEach((field: string) => {
          virtualReferenceFields[field] = [
            ...(virtualReferenceFields[field] || []),
            k,
          ];
        });

        virtualReferences[k] = { ...v };
      });
    }

    const childMap = Object.entries(jsonSchema.properties || {}).reduce(
      (accum, [name, schema]) => {
        accum[name] = {
          isVirtualized:
            virtualReferenceFields[name] &&
            virtualReferenceFields[name].length > 0,
          node: nodeFactory({
            name,
            schema: invertedAnyOf[name]
              ? {
                  ...schema,
                  'ui:show': combineConditions(
                    [
                      schema['ui:show'],
                      combineConditions(invertedAnyOf[name], '||'),
                    ],
                    '&&',
                  ),
                }
              : schema,
            parentNode: this,
            defaultValue: defaultValue?.[name],
            onChange: (value: any) => {
              if (this._draft[name] !== value || value === undefined) {
                this._draft[name] = value;
                this._emitChange();
              }
            },
          }),
        };
        return accum;
      },
      {} as Dictionary<ChildNode>,
    );

    this.#children = Object.entries(childMap).reduce((accum, [name, child]) => {
      if (Array.isArray(virtualReferenceFields[name])) {
        virtualReferenceFields[name].forEach((fieldName: string) => {
          if (virtualReferences[fieldName]) {
            const reference = virtualReferences[fieldName];
            const schema: VirtualSchema = {
              type: 'virtual',
              ...reference,
            };
            const refNodes = reference.fields.map(
              (field) => childMap[field]?.node,
            );

            accum.push({
              node: nodeFactory({
                name: fieldName,
                schema: schema,
                parentNode: that,
                refNodes: refNodes,
                defaultValue: refNodes.map((refNode) => refNode?.defaultValue),
                onChange: () => {},
              }),
            });
            delete virtualReferences[fieldName];
          }
        });
      }
      accum.push(child);
      return accum;
    }, [] as ChildNode[]);

    this.#ready = true;
    this.#emitChange();
  }
}
