import type { Fn } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

export enum OperationPhase {
  Enter = 1 << 0,      // 노드를 처음 방문할 때의 단계
  ChildEntries = 1 << 1, // 하위 노드를 추가할 단계
  Reference = 1 << 2,   // $ref를 처리할 단계
  Exit = 1 << 3,       // 노드 방문을 완료할 단계
}

export const $DEFS = '$defs';

export interface SchemaEntry {
  schema: UnknownSchema;  // 처리 중인 스키마 노드
  path: string;          // 현재 노드의 JSON 포인터 경로
  depth: number;         // 탐색 깊이
  hasReference?: boolean;       // 참조가 있는지 여부
  referencePath?: string;       // 처리된 참조 경로
  referenceResolved?: boolean;  // 참조 해결 여부
}

export interface SchemaVisitor<ContextType = void> {
  enter?: Fn<[entry: SchemaEntry, context?: ContextType]>;  // 노드 진입 시 호출되는 콜백
  exit?: Fn<[entry: SchemaEntry, context?: ContextType]>;   // 노드 종료 시 호출되는 콜백
}

export interface JsonScannerOptions<ContextType = void> {
  filter?: Fn<[entry: SchemaEntry, context?: ContextType], boolean>;  // 스키마 노드 필터링 함수
  resolveReference?: Fn<
    [reference: string, context?: ContextType],
    UnknownSchema | undefined
  >;  // $ref 참조 해결 함수
  maxDepth?: number;  // 최대 탐색 깊이
  context?: ContextType;  // 방문자와 필터에 전달되는 컨텍스트 객체
}

export interface JsonScannerOptionsAsync<ContextType = void>
  extends JsonScannerOptions<ContextType> {
  resolveReference?: Fn<
    [reference: string, context?: ContextType],
    UnknownSchema | Promise<UnknownSchema | undefined> | undefined
  >;
}
