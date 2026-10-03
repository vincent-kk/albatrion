import { SchemaNode as RuntimeSchemaNode } from '../SchemaNode';
import type { ArrayNode, BooleanNode, BranchNode, NumberNode, ObjectNode,
  SchemaNode, StringNode, TerminalNode, UnionNode, VirtualNode } from '../type';

/** Identify instances of the single runtime class. */
export const isSchemaNode = (value: unknown): value is SchemaNode =>
  value instanceof RuntimeSchemaNode;
/** Narrow the stable row kind. */
export const isStringNode = (node: SchemaNode): node is StringNode =>
  node.type === 'string';
/** Narrow the stable row kind. */
export const isNumberNode = (node: SchemaNode): node is NumberNode =>
  node.type === 'number';
/** Narrow the stable row kind. */
export const isBooleanNode = (node: SchemaNode): node is BooleanNode =>
  node.type === 'boolean';
/** Narrow both object strategies. */
export const isObjectNode = (node: SchemaNode): node is ObjectNode =>
  node.type === 'object';
/** Narrow the array kind. */
export const isArrayNode = (node: SchemaNode): node is ArrayNode =>
  node.type === 'array';
/** Narrow the virtual reference kind. */
export const isVirtualNode = (node: SchemaNode): node is VirtualNode =>
  node.type === 'virtual';
/** Narrow the union value kind. */
export const isUnionNode = (node: SchemaNode): node is UnionNode =>
  node.type === 'union';
/** A branch owns structural children. */
export const isBranchNode = (node: SchemaNode): node is BranchNode =>
  node.strategy === 'branch';
/** A terminal includes an object stored as a whole value. */
export const isTerminalNode = (node: SchemaNode): node is TerminalNode =>
  node.strategy === 'terminal';
