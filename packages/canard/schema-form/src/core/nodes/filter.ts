import { AbstractNode } from './AbstractNode';
import type { ArrayNode } from './ArrayNode';
import type { BooleanNode } from './BooleanNode';
import type { NullNode } from './NullNode';
import type { NumberNode } from './NumberNode';
import type { ObjectNode } from './ObjectNode';
import type { StringNode } from './StringNode';
import type { VirtualNode } from './VirtualNode';
import type { SchemaNode } from './type';

/**
 * Checks if the given input is a SchemaNode.
 * @param input - The value to check
 * @returns Whether the input is a SchemaNode
 */
export const isSchemaNode = (input: any): input is SchemaNode =>
  input instanceof AbstractNode;

/**
 * Checks if the given input is a BooleanNode.
 * @param input - The value to check
 * @returns Whether the input is a BooleanNode
 */
export const isBooleanNode = (input: any): input is BooleanNode =>
  isSchemaNode(input) && input.type === 'boolean';

/**
 * Checks if the given input is a NumberNode.
 * @param input - The value to check
 * @returns Whether the input is a NumberNode
 */
export const isNumberNode = (input: any): input is NumberNode =>
  isSchemaNode(input) && input.type === 'number';

/**
 * Checks if the given input is an ObjectNode.
 * @param input - The value to check
 * @returns Whether the input is an ObjectNode
 */
export const isObjectNode = (input: any): input is ObjectNode =>
  isSchemaNode(input) && input.type === 'object';

/**
 * Checks if the given input is a StringNode.
 * @param input - The value to check
 * @returns Whether the input is a StringNode
 */
export const isStringNode = (input: any): input is StringNode =>
  isSchemaNode(input) && input.type === 'string';

/**
 * Checks if the given input is a VirtualNode.
 * @param input - The value to check
 * @returns Whether the input is a VirtualNode
 */
export const isVirtualNode = (input: any): input is VirtualNode =>
  isSchemaNode(input) && input.type === 'virtual';

/**
 * Checks if the given input is an ArrayNode.
 * @param input - The value to check
 * @returns Whether the input is an ArrayNode
 */
export const isArrayNode = (input: any): input is ArrayNode =>
  isSchemaNode(input) && input.type === 'array';

/**
 * Checks if the given input is a NullNode.
 * @param input - The value to check
 * @returns Whether the input is a NullNode
 */
export const isNullNode = (input: any): input is NullNode =>
  isSchemaNode(input) && input.type === 'null';

/**
 * Checks if the given node is a branch node that can have child nodes.
 * @param node - The SchemaNode to check
 * @returns Whether the node is a branch node
 */
export const isBranchNode = (
  node: SchemaNode,
): node is ObjectNode | ArrayNode | VirtualNode => node.group === 'branch';

/**
 * Checks if the given node is a terminal node that cannot have child nodes.
 * @param node - The SchemaNode to check
 * @returns Whether the node is a terminal node
 */
export const isTerminalNode = (
  node: SchemaNode,
): node is BooleanNode | NumberNode | StringNode | NullNode =>
  node.group === 'terminal';
