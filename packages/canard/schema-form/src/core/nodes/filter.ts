import { AbstractNode } from './AbstractNode';
import type { ArrayNode } from './ArrayNode';
import type { BooleanNode } from './BooleanNode';
import type { NullNode } from './NullNode';
import type { NumberNode } from './NumberNode';
import type { ObjectNode } from './ObjectNode';
import type { StringNode } from './StringNode';
import type { VirtualNode } from './VirtualNode';
import type { SchemaNode } from './type';

export const isSchemaNode = (input: any): input is SchemaNode =>
  input instanceof AbstractNode;

export const isBooleanNode = (input: any): input is BooleanNode =>
  isSchemaNode(input) && input.type === 'boolean';

export const isNumberNode = (input: any): input is NumberNode =>
  isSchemaNode(input) && input.type === 'number';

export const isObjectNode = (input: any): input is ObjectNode =>
  isSchemaNode(input) && input.type === 'object';

export const isStringNode = (input: any): input is StringNode =>
  isSchemaNode(input) && input.type === 'string';

export const isVirtualNode = (input: any): input is VirtualNode =>
  isSchemaNode(input) && input.type === 'virtual';

export const isArrayNode = (input: any): input is ArrayNode =>
  isSchemaNode(input) && input.type === 'array';

export const isNullNode = (input: any): input is NullNode =>
  isSchemaNode(input) && input.type === 'null';

const BRANCH_NODE_TYPE = new Set<SchemaNode['type']>([
  'object',
  'array',
  'virtual',
]);

const TERMINAL_NODE_TYPE = new Set<SchemaNode['type']>([
  'boolean',
  'number',
  'string',
  'null',
]);

export const isBranchNode = (
  node: SchemaNode,
): node is ObjectNode | ArrayNode | VirtualNode =>
  BRANCH_NODE_TYPE.has(node.type);

export const isTerminalNode = (
  node: SchemaNode,
): node is BooleanNode | NumberNode | StringNode | NullNode =>
  TERMINAL_NODE_TYPE.has(node.type);
