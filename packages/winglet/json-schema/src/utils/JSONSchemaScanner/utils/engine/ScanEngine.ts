import { isObject } from '@winglet/common-utils/filter';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { KeywordDescriptor, SchemaEntry } from '../../type';
import { isDefinitionSchema } from '../isDefinitionSchema';
import { DEFAULT_KEYWORD_MAP } from '../keywordDescriptors';
import type { ScanConfig } from './type';
import { ScanStage } from './utils/ScanStage';
import { applyReferenceResult } from './utils/applyReferenceResult';
import { appendChildren } from './utils/children/appendChildren';
import { isThenable } from './utils/isThenable';

/** Match the compiled vocabulary snapshot even when callers mutate the publicly exposed descriptor array. */
const defaultOrderedKeywords = Array.from(DEFAULT_KEYWORD_MAP.values());

/**
 * Shared direct-call DFS machine; entry and stage arrays have matching frame indices.
 * Saved stage thresholds skip completed callbacks when the async driver resumes.
 */
export class ScanEngine<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Fresh per-node entries; a parent's captured children occupy the top span in reverse visit order. */
  private readonly entries: SchemaEntry<Schema>[];
  /** Next stage per frame; only suspension or descent writes a continuation. */
  private readonly stages: ScanStage[] = [ScanStage.Filter];
  /** Reference strings active along the current DFS ancestry. */
  private readonly active = new Set<string>();
  /** Optional original resolver results memoized for this scan. */
  private readonly cache: Map<string, UnknownSchema | undefined> | undefined;
  /** Vocabulary positions used by allocation-free bit-mask ordering. */
  private readonly ordered: readonly KeywordDescriptor[];
  /** Reused words for vocabulary positions beyond the first 32; empty on the default path. */
  private readonly masks: number[];
  /** Callback presence is fixed before traversal, independently of per-frame continuation labels. */
  private readonly hasFilter: boolean;
  /** Whether mutation must be invoked on every accepted frame. */
  private readonly hasMutate: boolean;
  /** Whether entry callbacks must be invoked on every accepted frame. */
  private readonly hasEnter: boolean;
  /** Whether exit callbacks must be invoked after each accepted frame. */
  private readonly hasExit: boolean;
  /** Written reference awaiting application after an async resolver suspension. */
  private reference: string | undefined;

  /**
   * Initialize a scan without invoking user callbacks.
   * @param schema Root schema, retaining its original reference until a mutation replaces it.
   * @param config Immutable callback snapshot and mutable driver-owned output ledger.
   * @param awaitCallbacks Whether to inspect callback results for thenables; sync drivers pass false.
   */
  constructor(
    schema: Schema,
    private readonly config: ScanConfig<Schema, ContextType>,
    private readonly awaitCallbacks: boolean,
  ) {
    this.entries = [
      { schema, path: '#', dataPath: '', depth: 0 } as SchemaEntry<Schema>,
    ];
    this.cache = config.cacheResolvedReference ? new Map() : undefined;
    this.hasFilter = config.filter !== undefined;
    this.hasMutate = config.mutate !== undefined;
    this.hasEnter = config.enter !== undefined;
    this.hasExit = config.exit !== undefined;
    if (config.keywordMap === DEFAULT_KEYWORD_MAP)
      this.ordered = defaultOrderedKeywords;
    else {
      const ordered: KeywordDescriptor[] = [];
      for (const descriptor of config.keywordMap.values())
        ordered[descriptor.order] = descriptor;
      this.ordered = ordered;
    }
    this.masks = new Array(Math.floor((this.ordered.length - 1) / 32)).fill(0);
  }

  /**
   * Run synchronous callback stages directly and pause only for enabled thenable results.
   * @param resumed Already-awaited value of the pending callback; ignored on the first call.
   * @returns Pending thenable, or undefined when all frames finish; callback errors propagate.
   */
  public run(resumed?: unknown): PromiseLike<unknown> | undefined {
    const {
      entries,
      stages,
      config,
      awaitCallbacks,
      active,
      cache,
      hasFilter,
      hasMutate,
      hasEnter,
      hasExit,
    } = this;
    const { context, maxDepth } = config;
    let result = resumed;
    while (entries.length > 0) {
      const top = entries.length - 1;
      const entry = entries[top];
      const stage = stages[top];
      if (stage <= ScanStage.FilterResult) {
        if (stage === ScanStage.Filter && hasFilter) {
          result = config.filter!(entry, context);
          if (awaitCallbacks && isThenable(result)) {
            stages[top] = ScanStage.FilterResult;
            return result;
          }
        }
        if (hasFilter && !result) {
          entries.pop();
          stages.pop();
          continue;
        }
      }
      if (stage <= ScanStage.MutateResult) {
        if (stage <= ScanStage.Mutate && hasMutate) {
          result = config.mutate!(entry, context);
          if (awaitCallbacks && isThenable(result)) {
            stages[top] = ScanStage.MutateResult;
            return result;
          }
        }
        if (hasMutate && result !== undefined) {
          entry.schema = result as Schema;
          config.resolves.push([entry.path, result as UnknownSchema]);
        }
      }
      if (stage <= ScanStage.Enter && hasEnter) {
        result = config.enter!(entry, context);
        if (awaitCallbacks && isThenable(result)) {
          stages[top] = ScanStage.Reference;
          return result;
        }
      }
      if (stage <= ScanStage.Reference) {
        const schema = entry.schema;
        this.reference = undefined;
        if (isObject(schema) && typeof schema.$ref === 'string') {
          const reference = schema.$ref;
          if (active.has(reference)) {
            entry.hasReference = true;
            entry.referenceSkipped = 'cycle';
            stages[top] = ScanStage.Exit;
            continue;
          }
          const isDefinition =
            config.resolveReference !== undefined &&
            isDefinitionSchema(entry.path);
          if (config.resolveReference === undefined || isDefinition) {
            entry.hasReference = true;
            entry.referenceSkipped = isDefinition ? 'definition' : 'unresolved';
            stages[top] = ScanStage.Exit;
            continue;
          }
          this.reference = reference;
          if (cache !== undefined && cache.has(reference))
            result = cache.get(reference);
          else {
            result = config.resolveReference(reference, entry, context);
            if (awaitCallbacks && isThenable(result)) {
              stages[top] = ScanStage.ReferenceResult;
              return result;
            }
          }
        }
      }
      if (
        stage <= ScanStage.ReferenceResult &&
        this.reference !== undefined &&
        !applyReferenceResult(
          entry,
          this.reference,
          result,
          config,
          active,
          cache,
        )
      ) {
        stages[top] = ScanStage.Exit;
        continue;
      }
      if (stage <= ScanStage.Children) {
        const start = entries.length;
        if (!(maxDepth !== undefined && entry.depth + 1 > maxDepth))
          appendChildren(
            entries,
            entry,
            config.keywordMap,
            this.ordered,
            this.masks,
          );
        const end = entries.length;
        if (end > start) {
          stages[top] = ScanStage.Exit;
          for (let i = start, j = end - 1; i < j; i++, j--) {
            const swap = entries[i];
            entries[i] = entries[j];
            entries[j] = swap;
          }
          for (let i = start; i < end; i++) stages.push(ScanStage.Filter);
          continue;
        }
      }
      if (stage <= ScanStage.Exit && hasExit) {
        result = config.exit!(entry, context);
        if (awaitCallbacks && isThenable(result)) {
          stages[top] = ScanStage.Pop;
          return result;
        }
      }
      if (
        entry.referenceResolved &&
        entry.referencePath &&
        active.has(entry.referencePath)
      )
        active.delete(entry.referencePath);
      entries.pop();
      stages.pop();
    }
    return undefined;
  }
}
