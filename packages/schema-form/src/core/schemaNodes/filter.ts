import type { ArrayNode } from './ArrayNode';
import { BaseNode } from './BaseNode';
import type { BooleanNode } from './BooleanNode';
import type { NumberNode } from './NumberNode';
import type { ObjectNode } from './ObjectNode';
import type { StringNode } from './StringNode';
import type { VirtualNode } from './VirtualNode';
import type { SchemaNode } from './type';

export const isSchemaNode = (input: any): input is SchemaNode =>
  input instanceof BaseNode;

export const isBooleanNode = (input: SchemaNode): input is BooleanNode =>
  input.type === 'boolean';

export const isNumberNode = (input: SchemaNode): input is NumberNode =>
  input.type === 'number';

export const isObjectNode = (input: SchemaNode): input is ObjectNode =>
  input.type === 'object';

export const isStringNode = (input: SchemaNode): input is StringNode =>
  input.type === 'string';

export const isVirtualNode = (input: SchemaNode): input is VirtualNode =>
  input.type === 'virtual';

export const isArrayNode = (input: SchemaNode): input is ArrayNode =>
  input.type === 'array';
