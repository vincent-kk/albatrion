import type { ObjectSchema, VirtualSchema } from '@lumy/schema-form/types';

import { BaseNode } from '../BaseNode';
import {
  type ConstructorPropsWithNodeFactory,
  MethodType,
  type SchemaNode,
} from '../type';

type ChildNode = {
  isVirtualized?: boolean;
  node: SchemaNode;
};

type VirtualReference = Required<ObjectSchema>['virtual'][string];

type ObjectValue = Record<string, any>;

export class ObjectNode extends BaseNode {
  readonly type = 'object';

  public children = () => this._children;
  public getValue = (): ObjectValue | undefined => this._value;
  public setValue = (value: ObjectValue, replace = false) => {
    this._draft = value;
    this._replace = replace;
    this._emitChange();
  };
  public parseValue = (value: ObjectValue) => value;

  private _children: ChildNode[] = [];
  private _value: ObjectValue | undefined;
  private _draft: ObjectValue;
  private _replace = false;
  private _emitChange: () => void;
  private _ready: boolean = false;

  constructor({
    key,
    name,
    schema,
    defaultValue,
    onChange,
    parentNode,
    ajv,
    nodeFactory,
  }: ConstructorPropsWithNodeFactory<ObjectValue>) {
    super({ key, name, schema, defaultValue, onChange, parentNode, ajv });

    this._value = this.defaultValue;
    this._draft = {};

    const keys = Object.keys(schema.properties || {});
    const sortObjectKeys = (obj: Dictionary) => {
      const newObj: Dictionary = {};
      const mergedKeys = [...keys, ...Object.keys(obj || {})].filter(
        (e, i, arr) => arr.indexOf(e) === i,
      );
      mergedKeys.forEach((key) => {
        if (key in obj) {
          newObj[key] = obj[key];
        }
      });
      return newObj;
    };

    this._emitChange = () => {
      if (
        this._ready &&
        (this._draft === undefined || Object.keys(this._draft).length >= 0)
      ) {
        if (this._draft === undefined) {
          this._value = undefined;
        } else if (
          Object.keys(this._draft || {}).length === 0 &&
          !this._replace
        ) {
          return;
        } else if (this._replace) {
          this._value = sortObjectKeys({ ...this._draft });
          this._replace = false;
        } else {
          const previous =
            this._value &&
            !Array.isArray(this._value) &&
            typeof this._value === 'object'
              ? { ...this._value }
              : {};
          this._value = sortObjectKeys({ ...previous, ...this._draft });
        }
        this._draft = {};
        if (typeof onChange === 'function') {
          onChange(this._value);
          this.publish(MethodType.Change, this._value);
        }
      }
      return undefined;
    };

    const invertedAnyOf: Dictionary<string[]> = {};
    if (schema.anyOf && Array.isArray(schema.anyOf)) {
      schema.anyOf
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

    if (schema?.virtual) {
      const knownProperties = Object.keys(schema.properties || {});
      Object.entries(schema.virtual).forEach(([k, v]) => {
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

    const childMap = Object.entries(schema?.properties || {}).reduce(
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

    const that = this;
    this._children = Object.entries(childMap).reduce((accum, [name, child]) => {
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

    this._ready = true;
    this._emitChange();
  }
}

function combineConditions(
  conditions: (string | boolean | undefined)[],
  operator: string,
) {
  let filtered = conditions.filter(Boolean) as (string | true)[];
  if (filtered.length === 1) {
    return filtered[0];
  }
  return filtered.map((item) => `(${item})`).join(` ${operator} `);
}
