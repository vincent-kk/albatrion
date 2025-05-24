import { JSONPointer, clone, setValueByPointer } from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  type JsonScannerOptionsAsync,
  OperationPhase,
  type SchemaEntry,
  type SchemaVisitor,
} from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';
import { isDefinitionSchema } from './utils/isDefinitionSchema';

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
  private readonly __visitor__: SchemaVisitor<ContextType>;
  /** 스캔 옵션: 최대 탐색 깊이, 필터링 함수, 참조 해결 함수 등을 포함합니다. */
  private readonly __options__: JsonScannerOptionsAsync<ContextType>;
  /** `scan` 메서드에 전달된 원본 JSON 스키마. */
  private __originalSchema__: UnknownSchema | undefined;
  /** 참조가 해결된 최종 스키마. `getValue` 첫 호출 시 계산됩니다. */
  private __processedSchema__: UnknownSchema | undefined;
  /** `__run__` 실행 중 해결되었지만 아직 최종 스키마에 적용되지 않은 참조들의 배열 ([경로, 해결된 스키마]). */
  private __pendingResolves__:
    | Array<[path: string, schema: UnknownSchema]>
    | undefined;

  /**
   * JsonSchemaScannerAsync 인스턴스를 생성합니다.
   * @param {JsonSchemaScannerProps<ContextType>} [props] - Scanner 설정 (visitor, options).
   */
  constructor(props?: JsonSchemaScannerProps<ContextType>) {
    this.__visitor__ = props?.visitor || {};
    this.__options__ = props?.options || {};
  }

  /**
   * 주어진 JSON 스키마를 비동기적으로 스캔하고 내부 상태를 업데이트합니다.
   * Visitor 훅을 실행하고, 해결된 참조 정보를 수집하여 `__pendingResolves__`에 저장합니다.
   *
   * @param {UnknownSchema} schema - 스캔할 JSON 스키마 객체.
   * @returns {Promise<this>} 현재 JsonSchemaScannerAsync 인스턴스 (메서드 체이닝 가능).
   */
  public async scan(this: this, schema: UnknownSchema): Promise<this> {
    this.__originalSchema__ = schema;
    this.__processedSchema__ = undefined; // 새 스캔 시작 시 이전 결과 초기화
    this.__pendingResolves__ = undefined;
    await this.__run__(this.__originalSchema__);
    return this;
  }

  /**
   * 스캔 및 참조 해결이 완료된 최종 스키마를 반환합니다.
   *
   * 첫 호출 시: `__pendingResolves__`에 저장된 참조들을 원본 스키마의 깊은 복사본에 적용하여
   * 최종 스키마를 생성하고 캐시합니다.
   * 두 번째 호출부터: 캐시된 최종 스키마를 반환합니다.
   *
   * @returns {UnknownSchema | undefined} 처리된 최종 스키마. 스캔 전이면 undefined 반환.
   * 참조가 해결되지 않았으면 원본 스키마의 깊은 복사본을 반환합니다.
   */
  public getValue(this: this): UnknownSchema | undefined {
    if (!this.__originalSchema__) return undefined;
    if (this.__processedSchema__) return this.__processedSchema__;
    if (!this.__pendingResolves__ || this.__pendingResolves__.length === 0) {
      this.__processedSchema__ = this.__originalSchema__;
      return this.__processedSchema__;
    }

    this.__processedSchema__ = clone(this.__originalSchema__);
    for (const [path, resolvedSchema] of this.__pendingResolves__) {
      this.__processedSchema__ = setValueByPointer(
        this.__processedSchema__,
        path,
        resolvedSchema,
      );
    }

    // 적용 완료 후 pending 맵 비우기 (메모리 해제)
    this.__pendingResolves__ = undefined;
    return this.__processedSchema__;
  }

  /**
   * 스키마를 깊이 우선 탐색(DFS) 방식으로 비동기 순회하고 참조를 해결하는 내부 로직입니다.
   * 상태 머신(OperationPhase)을 사용하여 각 노드의 처리 단계를 관리합니다.
   *
   * @param {UnknownSchema} schema - 순회를 시작할 스키마 노드.
   * @private
   */
  private async __run__(this: this, schema: UnknownSchema): Promise<void> {
    const stack: SchemaEntry[] = [
      { schema, path: JSONPointer.Root, dataPath: JSONPointer.Root, depth: 0 },
    ];
    const entryPhase = new WeakMap<SchemaEntry, OperationPhase>();
    const visitedReference = new Set<string>();

    while (stack.length > 0) {
      const entry = stack[stack.length - 1];
      const currentPhase = entryPhase.get(entry) ?? OperationPhase.Enter;

      switch (currentPhase) {
        case OperationPhase.Enter: {
          if (
            this.__options__.filter &&
            !(await this.__options__.filter(entry, this.__options__.context))
          ) {
            stack.pop();
            entryPhase.delete(entry);
            break;
          }

          if (this.__visitor__.enter)
            await this.__visitor__.enter(entry, this.__options__.context);
          entryPhase.set(entry, OperationPhase.Reference);
          break;
        }

        case OperationPhase.Reference: {
          if (typeof entry.schema.$ref === 'string') {
            const referencePath = entry.schema.$ref;

            if (visitedReference.has(referencePath)) {
              entry.hasReference = true;
              entryPhase.set(entry, OperationPhase.Exit);
              break;
            }

            const resolvedReference =
              this.__options__.resolveReference &&
              !isDefinitionSchema(entry.path)
                ? await this.__options__.resolveReference(
                    referencePath,
                    this.__options__.context,
                  )
                : undefined;

            if (resolvedReference) {
              if (!this.__pendingResolves__)
                this.__pendingResolves__ = new Array();
              this.__pendingResolves__.push([entry.path, resolvedReference]);

              entry.schema = resolvedReference;
              entry.referencePath = referencePath;
              entry.referenceResolved = true;

              visitedReference.add(referencePath);
              entryPhase.set(entry, OperationPhase.ChildEntries);
            } else {
              entry.hasReference = true;
              entryPhase.set(entry, OperationPhase.Exit);
            }
            break;
          }

          entryPhase.set(entry, OperationPhase.ChildEntries);
          break;
        }

        case OperationPhase.ChildEntries: {
          if (
            this.__options__.maxDepth !== undefined &&
            entry.depth + 1 > this.__options__.maxDepth
          ) {
            entryPhase.set(entry, OperationPhase.Exit);
            break;
          }

          const childEntries = getStackEntriesForNode(entry);
          entryPhase.set(entry, OperationPhase.Exit);
          if (childEntries.length > 0) {
            for (let i = childEntries.length - 1; i >= 0; i--) {
              const child = childEntries[i];
              entryPhase.set(child, OperationPhase.Enter);
              stack.push(child);
            }
          }
          break;
        }

        case OperationPhase.Exit: {
          if (this.__visitor__.exit)
            await this.__visitor__.exit(entry, this.__options__.context);

          if (
            entry.referenceResolved &&
            entry.referencePath &&
            visitedReference.has(entry.referencePath)
          )
            visitedReference.delete(entry.referencePath);
          stack.pop();
          entryPhase.delete(entry);
          break;
        }

        default: {
          stack.pop();
          entryPhase.delete(entry);
          break;
        }
      }
    }
  }
}
