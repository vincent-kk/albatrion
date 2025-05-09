import type { ObjectSchema } from '@/schema-form/types';

import type { SchemaNode } from '../type';

/**
 * 객체 노드의 자식 노드 정보를 나타내는 인터페이스입니다.
 */
export interface ChildNode {
  isVirtualized?: boolean;
  index?: number;
  node: SchemaNode;
}

/**
 * 가상 참조 정보를 나타내는 타입입니다.
 */
export type VirtualReference = NonNullable<ObjectSchema['virtual']>[string];
