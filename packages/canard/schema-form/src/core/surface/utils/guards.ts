import { FieldNode as RuntimeFieldNode } from '../runtime/FieldNode';
import type {
  ArrayNode,
  BooleanNode,
  BranchNode,
  FieldNode,
  NumberNode,
  ObjectNode,
  StringNode,
  TerminalNode,
  UnionNode,
  VirtualNode,
} from '../type';

/** Identify instances of the single runtime class. */
export const isFieldNode = (value: unknown): value is FieldNode =>
  value instanceof RuntimeFieldNode;
/** Narrow the stable row kind. */
export const isStringNode = (node: FieldNode): node is StringNode =>
  node.type === 'string';
/** Narrow the stable row kind. */
export const isNumberNode = (node: FieldNode): node is NumberNode =>
  node.type === 'number';
/** Narrow the stable row kind. */
export const isBooleanNode = (node: FieldNode): node is BooleanNode =>
  node.type === 'boolean';
/** Narrow both object strategies. */
export const isObjectNode = (node: FieldNode): node is ObjectNode =>
  node.type === 'object';
/** Narrow the array kind. */
export const isArrayNode = (node: FieldNode): node is ArrayNode =>
  node.type === 'array';
/** Narrow the virtual reference kind. */
export const isVirtualNode = (node: FieldNode): node is VirtualNode =>
  node.type === 'virtual';
/** Narrow the union value kind. */
export const isUnionNode = (node: FieldNode): node is UnionNode =>
  node.type === 'union';
/** A branch owns structural children. */
export const isBranchNode = (node: FieldNode): node is BranchNode =>
  node.strategy === 'branch';
/** A terminal includes an object stored as a whole value. */
export const isTerminalNode = (node: FieldNode): node is TerminalNode =>
  node.strategy === 'terminal';
