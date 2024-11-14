import {
  ArrayNode,
  BooleanNode,
  NumberNode,
  ObjectNode,
  StringNode,
  VirtualNode,
} from '.';

export function nodeFactory({
  key,
  name,
  jsonSchema,
  defaultValue,
  parentNode,
  onChange,
  refNodes,
  ajv,
}: any) {
  switch (jsonSchema.type) {
    case 'array':
      return new ArrayNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
        nodeFactory,
      });
    case 'number':
      return new NumberNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      });
    case 'object':
      return new ObjectNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
        nodeFactory,
      });
    case 'string':
      return new StringNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      });
    case 'virtual':
      return new VirtualNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        refNodes,
        ajv,
      });
    case 'boolean':
      return new BooleanNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      });
  }
  throw new Error(`Unknown schema type: ${jsonSchema.type}`);
}
