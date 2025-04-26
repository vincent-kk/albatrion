import { JSONPointer, clone, setValueByPointer } from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  type JsonScannerOptionsAsync,
  OperationPhase,
  type SchemaEntry,
  type SchemaVisitor,
} from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';

interface JsonSchemaScannerProps<ContextType> {
  visitor?: SchemaVisitor<ContextType>;
  options?: JsonScannerOptionsAsync<ContextType>;
}

/**
 * @class JsonSchemaScannerAsync
 * @template ContextType - Visitor 및 옵션에서 사용할 수 있는 컨텍스트 타입.
 *
 * JSON 스키마를 깊이 우선 탐색(DFS) 방식으로 비동기적으로 순회하며,
 * 방문자(Visitor) 패턴을 적용하고 $ref 참조를 비동기적으로 해결하는 유틸리티 클래스입니다.
 * 스택 기반 순환 참조 감지 로직을 사용하여 무한 루프를 방지합니다.
 */
export class JsonSchemaScannerAsync<ContextType = void> {
  /** Visitor 객체: 스키마 노드 진입/종료 시 실행될 콜백 함수들을 포함합니다. */
  readonly #visitor: SchemaVisitor<ContextType>;
  /** 스캔 옵션: 최대 탐색 깊이, 필터링 함수, 참조 해결 함수 등을 포함합니다. */
  readonly #options: JsonScannerOptionsAsync<ContextType>;
  /** `scan` 메서드에 전달된 원본 JSON 스키마. */
  #originalSchema: UnknownSchema | undefined;
  /** 참조가 해결된 최종 스키마. `getValue` 첫 호출 시 계산됩니다. */
  #processedSchema: UnknownSchema | undefined;
  /** `#run` 실행 중 해결되었지만 아직 최종 스키마에 적용되지 않은 참조들의 맵 (경로 -> 해결된 스키마). */
  #pendingResolvedRefs: Map<string, UnknownSchema> | undefined;
  /** 각 참조 경로가 해결된 횟수를 기록하는 맵 (현재 직접적인 로직 제한에는 사용되지 않음). */
  #resolvedCounts: Map<string, number> | undefined;

  /**
   * JsonSchemaScannerAsync 인스턴스를 생성합니다.
   * @param {JsonSchemaScannerProps<ContextType>} [props] - Scanner 설정 (visitor, options).
   */
  constructor(props?: JsonSchemaScannerProps<ContextType>) {
    this.#visitor = props?.visitor || {};
    this.#options = props?.options || {};
  }

  /**
   * 주어진 JSON 스키마를 비동기적으로 스캔하고 내부 상태를 업데이트합니다.
   * Visitor 훅을 실행하고, 해결된 참조 정보를 수집하여 `#pendingResolvedRefs`에 저장합니다.
   *
   * @param {UnknownSchema} schema - 스캔할 JSON 스키마 객체.
   * @returns {Promise<this>} 현재 JsonSchemaScannerAsync 인스턴스 (메서드 체이닝 가능).
   */
  public async scan(this: this, schema: UnknownSchema): Promise<this> {
    this.#originalSchema = schema;
    this.#processedSchema = undefined; // 새 스캔 시작 시 이전 결과 초기화
    this.#pendingResolvedRefs = undefined;
    this.#resolvedCounts = new Map();
    await this.#run(this.#originalSchema);
    return this;
  }

  /**
   * 스캔 및 참조 해결이 완료된 최종 스키마를 반환합니다.
   *
   * 첫 호출 시: `#pendingResolvedRefs`에 저장된 참조들을 원본 스키마의 깊은 복사본에 적용하여
   * 최종 스키마를 생성하고 캐시합니다.
   * 두 번째 호출부터: 캐시된 최종 스키마를 반환합니다.
   *
   * @returns {UnknownSchema | undefined} 처리된 최종 스키마. 스캔 전이면 undefined 반환.
   * 참조가 해결되지 않았으면 원본 스키마의 깊은 복사본을 반환합니다.
   */
  public getValue(this: this): UnknownSchema | undefined {
    if (!this.#originalSchema) return undefined;

    // 이미 계산된 결과가 있다면 즉시 반환 (캐싱)
    if (this.#processedSchema) return this.#processedSchema;

    // 해결해야 할 참조가 없으면 원본 스키마 복사본 반환
    if (!this.#pendingResolvedRefs || this.#pendingResolvedRefs.size === 0) {
      this.#processedSchema = this.#originalSchema; // 원본을 그대로 사용 (불변성 가정)
      return this.#processedSchema;
    }

    // 첫 호출 시, 원본 복제 후 해결된 참조 적용
    this.#processedSchema = clone(this.#originalSchema);
    // setValueByPointer는 변경된 객체 또는 원본 객체를 반환하므로 결과 재할당
    for (const [path, resolvedSchema] of this.#pendingResolvedRefs) {
      this.#processedSchema = setValueByPointer(
        this.#processedSchema,
        path,
        resolvedSchema,
      );
    }

    // 적용 완료 후 pending 맵 비우기 (메모리 해제)
    this.#pendingResolvedRefs.clear();
    return this.#processedSchema;
  }

  /**
   * 스키마를 깊이 우선 탐색(DFS) 방식으로 비동기 순회하고 참조를 해결하는 내부 로직입니다.
   * 상태 머신(OperationPhase)을 사용하여 각 노드의 처리 단계를 관리합니다.
   *
   * @param {UnknownSchema} schema - 순회를 시작할 스키마 노드.
   * @private
   */
  async #run(this: this, schema: UnknownSchema): Promise<void> {
    // DFS 탐색을 위한 스택
    const stack: SchemaEntry[] = [{ schema, path: JSONPointer.Root, depth: 0 }];
    // 각 스택 항목(노드)의 현재 처리 단계(Phase)를 저장 (WeakMap으로 메모리 누수 방지)
    const entryPhase = new WeakMap<SchemaEntry, OperationPhase>();
    // DFS 경로 상에서 현재 방문 중인 $ref 경로를 추적하여 순환 참조 감지
    const visitedRerenderInStack = new Set<string>();

    while (stack.length > 0) {
      const entry = stack[stack.length - 1]; // 현재 처리할 노드
      const currentPhase = entryPhase.get(entry) ?? OperationPhase.Enter; // 현재 노드의 처리 단계

      switch (currentPhase) {
        case OperationPhase.Enter: {
          // 옵션: 최대 깊이 제한 또는 사용자 정의 필터링 조건 확인
          if (
            (this.#options.maxDepth !== undefined &&
              entry.depth > this.#options.maxDepth) ||
            (this.#options.filter &&
              !(await this.#options.filter(entry, this.#options.context)))
          ) {
            stack.pop(); // 조건 미충족 시 노드 처리 중단 및 스택에서 제거
            entryPhase.delete(entry);
            break; // continue 대신 break 사용
          }

          // Visitor 실행: 노드 진입 시점
          if (this.#visitor.enter)
            await this.#visitor.enter(entry, this.#options.context);
          // 다음 단계: 참조 확인
          entryPhase.set(entry, OperationPhase.Reference);
          break; // continue 대신 break 사용
        }

        case OperationPhase.Reference: {
          // 현재 노드가 $ref 속성을 가지고 있는지 확인
          if (typeof entry.schema.$ref === 'string') {
            const referencePath = entry.schema.$ref;

            // 순환 참조 확인: 현재 DFS 경로상에 이미 이 참조 경로가 있는지 확인
            if (visitedRerenderInStack.has(referencePath)) {
              entry.hasReference = true; // 참조가 있지만 순환으로 인해 해결 안 함
              entryPhase.set(entry, OperationPhase.Exit); // 종료 단계로 이동
              break; // continue 대신 break 사용
            }

            // 참조 해결 시도 (스택 순환 아님)
            visitedRerenderInStack.add(referencePath); // 현재 경로에 참조 추가 (추적 시작)
            const resolvedReference = this.#options.resolveReference
              ? await this.#options.resolveReference(
                  referencePath,
                  this.#options.context,
                )
              : undefined;

            if (resolvedReference) {
              // 참조 해결 성공
              if (!this.#pendingResolvedRefs) {
                this.#pendingResolvedRefs = new Map();
              }
              // 해결된 스키마를 pending 맵에 저장 (getValue에서 사용)
              this.#pendingResolvedRefs.set(entry.path, resolvedReference);

              // 해결 횟수 기록 (현재 직접 사용 안 함, 추적용)
              this.#resolvedCounts?.set(referencePath, 1);

              // 현재 노드의 스키마를 해결된 스키마로 교체하여 하위 탐색 준비
              entry.schema = resolvedReference;
              entry.referenceResolved = true;
              entry.referencePath = referencePath; // Exit 단계에서 추적 종료를 위해 경로 저장

              // 다음 단계: 해결된 스키마의 하위 노드 탐색
              entryPhase.set(entry, OperationPhase.ChildEntries);
              // 스택 추적(visitedRefsInStack)은 Exit 단계에서 제거됨
            } else {
              // 참조 해결 실패 (resolveReference 옵션이 없거나 null/undefined 반환)
              entry.hasReference = true; // 참조는 있지만 해결 실패
              // 해결 실패 시, 스택 추적 즉시 중단 (더 이상 해당 참조를 따라가지 않음)
              visitedRerenderInStack.delete(referencePath);
              entryPhase.set(entry, OperationPhase.Exit); // 종료 단계로 이동
            }
            break; // continue 대신 break 사용
          }

          // $ref 속성이 없는 노드는 바로 하위 탐색 단계로 이동
          entryPhase.set(entry, OperationPhase.ChildEntries);
          break; // continue 대신 break 사용
        }

        case OperationPhase.ChildEntries: {
          // 현재 노드의 하위 노드(객체 속성, 배열 아이템 등) 가져오기
          const childEntries = getStackEntriesForNode(entry);
          // 현재 노드는 하위 노드 탐색 후 Exit 단계로 진행하도록 설정
          entryPhase.set(entry, OperationPhase.Exit);

          // 하위 노드가 있으면 스택에 추가 (역순으로 추가해야 순서대로 처리됨 - DFS)
          if (childEntries.length > 0) {
            for (let i = childEntries.length - 1; i >= 0; i--) {
              const child = childEntries[i];
              entryPhase.set(child, OperationPhase.Enter); // 하위 노드는 Enter 단계부터 시작
              stack.push(child);
            }
          }
          break; // 스택의 top(마지막에 추가된 하위 노드)부터 처리 시작
        }

        case OperationPhase.Exit: {
          // Visitor 실행: 노드 및 모든 하위 노드 탐색 완료 시점
          if (this.#visitor.exit)
            await this.#visitor.exit(entry, this.#options.context);

          // 참조 추적 종료: 현재 노드가 이전에 성공적으로 해결된 참조였다면,
          // 해당 참조 경로를 스택 추적 Set에서 제거
          if (entry.referenceResolved && entry.referencePath) {
            visitedRerenderInStack.delete(entry.referencePath);
          }

          // 현재 노드 처리 완료, 스택에서 제거
          stack.pop();
          entryPhase.delete(entry);
          break; // continue 대신 break 사용
        }

        default: {
          // 예기치 않은 상태 처리
          stack.pop();
          entryPhase.delete(entry);
          break; // continue 대신 break 사용
        }
      }
    }
  }
}
