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
 * 주어진 입력이 SchemaNode 인지 확인합니다.
 * @param input - 확인할 값
 * @returns SchemaNode 인지 여부
 */
export const isSchemaNode = (input: any): input is SchemaNode =>
  input instanceof AbstractNode;

/**
 * 주어진 입력이 BooleanNode 인지 확인합니다.
 * @param input - 확인할 값
 * @returns BooleanNode 인지 여부
 */
export const isBooleanNode = (input: any): input is BooleanNode =>
  isSchemaNode(input) && input.type === 'boolean';

/**
 * 주어진 입력이 NumberNode 인지 확인합니다.
 * @param input - 확인할 값
 * @returns NumberNode 인지 여부
 */
export const isNumberNode = (input: any): input is NumberNode =>
  isSchemaNode(input) && input.type === 'number';

/**
 * 주어진 입력이 ObjectNode 인지 확인합니다.
 * @param input - 확인할 값
 * @returns ObjectNode 인지 여부
 */
export const isObjectNode = (input: any): input is ObjectNode =>
  isSchemaNode(input) && input.type === 'object';

/**
 * 주어진 입력이 StringNode 인지 확인합니다.
 * @param input - 확인할 값
 * @returns StringNode 인지 여부
 */
export const isStringNode = (input: any): input is StringNode =>
  isSchemaNode(input) && input.type === 'string';

/**
 * 주어진 입력이 VirtualNode 인지 확인합니다.
 * @param input - 확인할 값
 * @returns VirtualNode 인지 여부
 */
export const isVirtualNode = (input: any): input is VirtualNode =>
  isSchemaNode(input) && input.type === 'virtual';

/**
 * 주어진 입력이 ArrayNode 인지 확인합니다.
 * @param input - 확인할 값
 * @returns ArrayNode 인지 여부
 */
export const isArrayNode = (input: any): input is ArrayNode =>
  isSchemaNode(input) && input.type === 'array';

/**
 * 주어진 입력이 NullNode 인지 확인합니다.
 * @param input - 확인할 값
 * @returns NullNode 인지 여부
 */
export const isNullNode = (input: any): input is NullNode =>
  isSchemaNode(input) && input.type === 'null';

/**
 * 주어진 노드가 하위 노드를 가질 수 있는 브랜치 노드인지 확인합니다.
 * @param node - 확인할 SchemaNode
 * @returns 브랜치 노드인지 여부
 */
export const isBranchNode = (
  node: SchemaNode,
): node is ObjectNode | ArrayNode | VirtualNode => node.group === 'branch';

/**
 * 주어진 노드가 하위 노드를 가질 수 없는 터미널 노드인지 확인합니다.
 * @param node - 확인할 SchemaNode
 * @returns 터미널 노드인지 여부
 */
export const isTerminalNode = (
  node: SchemaNode,
): node is BooleanNode | NumberNode | StringNode | NullNode =>
  node.group === 'terminal';
