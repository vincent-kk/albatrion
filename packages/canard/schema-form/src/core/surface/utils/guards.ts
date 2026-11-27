import type { Nullish } from '@aileron/declare';

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
/**
 * Narrow the stable row kind.
 * @param node - Observed reference; null and undefined represent absence
 * @returns False for absence, otherwise narrows to the matching node subtype
 */
export const isStringNode = (node: FieldNode | Nullish): node is StringNode =>
  node != null && node.type === 'string';
/**
 * Narrow the stable row kind.
 * @param node - Observed reference; null and undefined represent absence
 * @returns False for absence, otherwise narrows to the matching node subtype
 */
export const isNumberNode = (node: FieldNode | Nullish): node is NumberNode =>
  node != null && node.type === 'number';
/**
 * Narrow the stable row kind.
 * @param node - Observed reference; null and undefined represent absence
 * @returns False for absence, otherwise narrows to the matching node subtype
 */
export const isBooleanNode = (node: FieldNode | Nullish): node is BooleanNode =>
  node != null && node.type === 'boolean';
/**
 * Narrow both object strategies.
 * @param node - Observed reference; null and undefined represent absence
 * @returns False for absence, otherwise narrows to the matching node subtype
 */
export const isObjectNode = (node: FieldNode | Nullish): node is ObjectNode =>
  node != null && node.type === 'object';
/**
 * Narrow the array kind.
 * @param node - Observed reference; null and undefined represent absence
 * @returns False for absence, otherwise narrows to the matching node subtype
 */
export const isArrayNode = (node: FieldNode | Nullish): node is ArrayNode =>
  node != null && node.type === 'array';
/**
 * Narrow the virtual reference kind.
 * @param node - Observed reference; null and undefined represent absence
 * @returns False for absence, otherwise narrows to the matching node subtype
 */
export const isVirtualNode = (node: FieldNode | Nullish): node is VirtualNode =>
  node != null && node.type === 'virtual';
/**
 * Narrow the union value kind.
 * @param node - Observed reference; null and undefined represent absence
 * @returns False for absence, otherwise narrows to the matching node subtype
 */
export const isUnionNode = (node: FieldNode | Nullish): node is UnionNode =>
  node != null && node.type === 'union';
/**
 * A branch owns structural children.
 * @param node - Observed reference; null and undefined represent absence
 * @returns False for absence, otherwise narrows to the matching node subtype
 */
export const isBranchNode = (node: FieldNode | Nullish): node is BranchNode =>
  node != null && node.strategy === 'branch';
/**
 * A terminal includes an object stored as a whole value.
 * @param node - Observed reference; null and undefined represent absence
 * @returns False for absence, otherwise narrows to the matching node subtype
 */
export const isTerminalNode = (
  node: FieldNode | Nullish,
): node is TerminalNode => node != null && node.strategy === 'terminal';
