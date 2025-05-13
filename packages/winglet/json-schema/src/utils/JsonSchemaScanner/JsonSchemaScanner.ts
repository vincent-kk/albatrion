import {
  JSONPointer,
  clone,
  getValueByPointer,
  setValueByPointer,
} from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  type JsonScannerOptions,
  OperationPhase,
  type SchemaEntry,
  type SchemaVisitor,
} from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';
import { isDefinitionSchema } from './utils/isDefinitionSchema';

interface JsonSchemaScannerProps<ContextType> {
  visitor?: SchemaVisitor<ContextType>;
  options?: JsonScannerOptions<ContextType>;
}

/**
 * @class JsonSchemaScanner
 * @template ContextType - Visitor 및 옵션에서 사용할 수 있는 컨텍스트 타입.
 *
 * JSON 스키마를 깊이 우선 탐색(DFS) 방식으로 순회하며, 방문자(Visitor) 패턴을 적용하고
 * $ref 참조를 해결하는 유틸리티 클래스입니다.
 * 스택 기반 순환 참조 감지 로직을 사용하여 무한 루프를 방지합니다.
 */
export class JsonSchemaScanner<ContextType = void> {
  /** Visitor 객체: 스키마 노드 진입/종료 시 실행될 콜백 함수들을 포함합니다. */
  readonly #visitor: SchemaVisitor<ContextType>;
  /** 스캔 옵션: 최대 탐색 깊이, 필터링 함수, 참조 해결 함수 등을 포함합니다. */
  readonly #options: JsonScannerOptions<ContextType>;
  /** `scan` 메서드에 전달된 원본 JSON 스키마. */
  #originalSchema: UnknownSchema | undefined;
  /** 참조가 해결된 최종 스키마. `getValue` 첫 호출 시 계산됩니다. */
  #processedSchema: UnknownSchema | undefined;
  /** `#run` 실행 중 해결되었지만 아직 최종 스키마에 적용되지 않은 참조들의 배열 ([경로, 해결된 스키마]). */
  #pendingResolves: Array<[path: string, schema: UnknownSchema]> | undefined;

  /**
   * JsonSchemaScanner 인스턴스를 생성합니다.
   * @param {JsonSchemaScannerProps<ContextType>} [props] - Scanner 설정 (visitor, options).
   */
  constructor(props?: JsonSchemaScannerProps<ContextType>) {
    this.#visitor = props?.visitor || {};
    this.#options = props?.options || {};
  }

  /**
   * 주어진 JSON 스키마를 스캔하고 내부 상태를 업데이트합니다.
   * Visitor 훅을 실행하고, 해결된 참조 정보를 수집하여 `#pendingResolvedRefs`에 저장합니다.
   *
   * @param {UnknownSchema} schema - 스캔할 JSON 스키마 객체.
   * @returns {this} 현재 JsonSchemaScanner 인스턴스 (메서드 체이닝 가능).
   */
  public scan(this: this, schema: UnknownSchema): this {
    this.#originalSchema = schema;
    this.#processedSchema = undefined;
    this.#pendingResolves = undefined;
    this.#run(this.#originalSchema);
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
  public getValue<Schema extends UnknownSchema>(
    this: this,
  ): Schema | undefined {
    if (!this.#originalSchema) return undefined;
    if (this.#processedSchema) return this.#processedSchema as Schema;
    if (!this.#pendingResolves || this.#pendingResolves.length === 0) {
      this.#processedSchema = this.#originalSchema;
      return this.#processedSchema as Schema;
    }

    this.#processedSchema = clone(this.#originalSchema);
    for (const [path, resolvedSchema] of this.#pendingResolves) {
      this.#processedSchema = setValueByPointer(
        this.#processedSchema,
        path,
        resolvedSchema,
      );
    }
    this.#pendingResolves = undefined;
    return this.#processedSchema as Schema;
  }

  /**
   * 스키마를 깊이 우선 탐색(DFS) 방식으로 순회하고 참조를 해결하는 내부 로직입니다.
   * 상태 머신(OperationPhase)을 사용하여 각 노드의 처리 단계를 관리합니다.
   *
   * @param {UnknownSchema} schema - 순회를 시작할 스키마 노드.
   * @private
   */
  #run(this: this, schema: UnknownSchema): void {
    const stack: SchemaEntry[] = [{ schema, path: JSONPointer.Root, depth: 0 }];
    const entryPhase = new WeakMap<SchemaEntry, OperationPhase>();
    const visitedReference = new Set<string>();

    while (stack.length > 0) {
      const entry = stack[stack.length - 1];
      const currentPhase = entryPhase.get(entry) ?? OperationPhase.Enter;

      switch (currentPhase) {
        case OperationPhase.Enter: {
          if (
            this.#options.filter &&
            !this.#options.filter(entry, this.#options.context)
          ) {
            stack.pop();
            entryPhase.delete(entry);
            break;
          }

          this.#visitor.enter?.(entry, this.#options.context);
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
              this.#options.resolveReference && !isDefinitionSchema(entry.path)
                ? this.#options.resolveReference(
                    referencePath,
                    this.#options.context,
                  )
                : undefined;

            if (resolvedReference) {
              if (!this.#pendingResolves) this.#pendingResolves = new Array();
              this.#pendingResolves.push([entry.path, resolvedReference]);

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
            this.#options.maxDepth !== undefined &&
            entry.depth + 1 > this.#options.maxDepth
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
          this.#visitor.exit?.(entry, this.#options.context);
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

  static resolveReference(
    jsonSchema: UnknownSchema,
  ): UnknownSchema | undefined {
    const definitionMap = new Map<string, UnknownSchema>();
    new JsonSchemaScanner({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            definitionMap.set(
              schema.$ref,
              getValueByPointer(jsonSchema, schema.$ref),
            );
        },
      },
    }).scan(jsonSchema);
    return new JsonSchemaScanner({
      options: {
        resolveReference: (path) => definitionMap.get(path),
      },
    })
      .scan(jsonSchema)
      .getValue();
  }
}
