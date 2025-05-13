import type { Fn } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

export enum OperationPhase {
  /** 노드를 처음 방문할 때의 단계 */
  Enter = 1 << 0,
  /** 하위 노드를 추가할 단계 */
  ChildEntries = 1 << 1,
  /** $ref를 처리할 단계 */
  Reference = 1 << 2,
  /** 노드 방문을 완료할 단계 */
  Exit = 1 << 3,
}

export interface SchemaEntry {
  /** 처리 중인 스키마 노드 */
  schema: UnknownSchema;
  /** 현재 노드의 JSON 포인터 경로 */
  path: string;
  /** 탐색 깊이 */
  depth: number;
  /** 참조가 있는지 여부 */
  hasReference?: boolean;
  /** 처리된 참조 경로 */
  referencePath?: string;
  /** 참조 해결 여부 */
  referenceResolved?: boolean;
}

export interface SchemaVisitor<ContextType = void> {
  /** 노드 처리 시작 시 호출되는 콜백 */
  enter?: Fn<[entry: SchemaEntry, context?: ContextType]>;
  /** 노드 처리 종료 시 호출되는 콜백 */
  exit?: Fn<[entry: SchemaEntry, context?: ContextType]>;
}

export interface JsonScannerOptions<ContextType = void> {
  /** 스키마 노드 필터링 함수 */
  filter?: Fn<[entry: SchemaEntry, context?: ContextType], boolean>;
  /** $ref 참조 해결 함수 */
  resolveReference?: Fn<
    [reference: string, context?: ContextType],
    UnknownSchema | undefined
  >;
  /** 최대 탐색 깊이 */
  maxDepth?: number;
  /** 방문자와 필터에 전달되는 컨텍스트 객체 */
  context?: ContextType;
}

export interface JsonScannerOptionsAsync<ContextType = void>
  extends JsonScannerOptions<ContextType> {
  resolveReference?: Fn<
    [reference: string, context?: ContextType],
    UnknownSchema | Promise<UnknownSchema | undefined> | undefined
  >;
}
