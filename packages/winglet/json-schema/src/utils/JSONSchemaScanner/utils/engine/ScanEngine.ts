import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { detectDialect } from '../dialect/detectDialect';
import { DIALECT_FLAGS } from '../dialect/dialectFlags';
import { JSONSchemaScanError } from '../error/JSONSchemaScanError';
import { DEFAULT_KEYWORD_MAP } from '../vocabulary/defaultKeywords';
import type { OrderedKeywordDescriptor } from '../vocabulary/type';
import type {
  DialectScope,
  EngineEntry,
  PhysicalCheckpoint,
  ScanConfig,
} from './type';
import { ScanStage } from './utils/ScanStage';
import { assertIdentifiersUnchanged } from './utils/assertIdentifiersUnchanged';
import { appendChildren } from './utils/children/appendChildren';
import { getReferenceKeywords } from './utils/getReferenceKeywords';
import { isThenable } from './utils/isThenable';
import { ReferenceMachine } from './utils/references/ReferenceMachine';

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
  private readonly entries: EngineEntry<Schema>[];
  /** Next stage per frame; only suspension or descent writes a continuation. */
  private readonly stages: ScanStage[] = [ScanStage.Filter];
  /** Reference-only state does not exist when no provider is configured. */
  private readonly references: ReferenceMachine | undefined;
  /** Vocabulary positions used by allocation-free bit-mask ordering. */
  private readonly ordered: readonly OrderedKeywordDescriptor[];
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
  /** Power-of-two ancestor checkpoints, allocated only when a child-bearing frame reaches depth 256. */
  private checkpoints: PhysicalCheckpoint[] | undefined;

  /** Whether callbacks can observe boolean leaves; false avoids their frame allocations entirely. */
  private readonly visitBooleans: boolean;
  /** Current lexical resource dialect as a descriptor-membership bit. */
  private dialect: number;
  /** Known resource dialect changes, allocated only when a declaration changes the current dialect. */
  private dialectScopes: DialectScope[] | undefined;
  /** Outermost active definition frame; descendants inherit its role independently of path strings. */
  private definitionFrame: number | undefined;

  /**
   * Initialize a scan without invoking user callbacks.
   * @param schema Root schema, retaining its original reference until a mutation replaces it.
   * @param config Immutable callback snapshot and mutable driver-owned output ledger.
   * @param awaitCallbacks Whether to inspect callback results for thenables; sync drivers pass false.
   */
  constructor(
    schema: Schema | boolean,
    private readonly config: ScanConfig<Schema, ContextType>,
    private readonly awaitCallbacks: boolean,
  ) {
    this.hasFilter = config.filter !== undefined;
    this.hasMutate = config.mutate !== undefined;
    this.hasEnter = config.enter !== undefined;
    this.hasExit = config.exit !== undefined;
    this.visitBooleans =
      this.hasFilter || this.hasMutate || this.hasEnter || this.hasExit;
    this.entries =
      typeof schema === 'boolean' && !this.visitBooleans
        ? []
        : [
            {
              schema,
              path: '#',
              dataPath: '',
              depth: 0,
            } as EngineEntry<Schema>,
          ];
    this.dialect = DIALECT_FLAGS[config.defaultDialect ?? '2020-12'];
    this.references =
      config.resolveReference === undefined
        ? undefined
        : new ReferenceMachine(schema, config, awaitCallbacks, (target) =>
            this.countNodes(target),
          );
    if (this.references) this.dialect = this.references.dialect;
    if (
      this.entries.length &&
      typeof schema === 'boolean' &&
      this.dialect === 1
    )
      this.entries[0].inert = true;
    if (config.keywordMap === DEFAULT_KEYWORD_MAP)
      this.ordered = defaultOrderedKeywords;
    else {
      const ordered: OrderedKeywordDescriptor[] = [];
      for (const descriptor of config.keywordMap.values())
        ordered[descriptor.order] = descriptor;
      this.ordered = ordered;
    }
    this.masks = new Array(
      Math.max(0, Math.floor((this.ordered.length - 1) / 32)),
    ).fill(0);
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
      references,
      hasFilter,
      hasMutate,
      hasEnter,
      hasExit,
    } = this;
    const { context, maxDepth, resolveReference } = config;
    let result = resumed;
    let checkpoints = this.checkpoints;
    let checkpoint = checkpoints?.[checkpoints.length - 1];
    while (entries.length > 0) {
      const top = entries.length - 1;
      const entry = entries[top];
      const stage = stages[top];
      let legacyMode: 0 | 1 | 2 = 0;
      if (stage === ScanStage.Filter && references !== undefined)
        references.enter(entry, top);
      if (
        stage === ScanStage.Filter &&
        resolveReference !== undefined &&
        this.definitionFrame === undefined &&
        (entry.keyword === '$defs' || entry.keyword === 'definitions')
      )
        this.definitionFrame = top;
      if (stage <= ScanStage.FilterResult) {
        if (stage === ScanStage.Filter && hasFilter) {
          result = config.filter!(entry, context);
          if (awaitCallbacks && isThenable(result)) {
            stages[top] = ScanStage.FilterResult;
            return result;
          }
        }
        if (hasFilter && !result) {
          if (resolveReference !== undefined && this.definitionFrame === top)
            this.definitionFrame = undefined;
          if (references !== undefined && references.releaseFrame === top)
            references.leave(top);
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
          assertIdentifiersUnchanged(entry.schema, result);
          entry.schema = result as Schema;
          if (!entry.inert)
            config.operations.push({
              kind: 'replace',
              path: entry.path,
              value: result,
              copy: true,
            });
        }
      }
      if (stage <= ScanStage.Enter && hasEnter) {
        result = config.enter!(entry, context);
        if (awaitCallbacks && isThenable(result)) {
          stages[top] = ScanStage.Reference;
          return result;
        }
      }
      if (stage <= ScanStage.ReferenceResult) {
        const schema = entry.schema;
        if (references !== undefined) {
          this.dialect = references.dialect;
          if (
            !entry.inert &&
            schema !== null &&
            typeof schema === 'object' &&
            (typeof schema.$ref === 'string' ||
              (this.dialect === 16 && typeof schema.$dynamicRef === 'string') ||
              (this.dialect === 8 && typeof schema.$recursiveRef === 'string'))
          ) {
            const pending = references.run(
              entry,
              top,
              this.definitionFrame !== undefined,
              resumed,
            );
            if (pending !== undefined) {
              stages[top] = ScanStage.ReferenceResult;
              return pending;
            }
            legacyMode = references.legacyMode;
          }
        } else if (
          !entry.inert &&
          schema !== null &&
          typeof schema === 'object'
        ) {
          if (
            typeof schema.$schema === 'string' &&
            (top === 0 ||
              ((this.dialect >= 8 || typeof schema.$ref !== 'string') &&
                (typeof schema.$id === 'string' ||
                  (this.dialect === 1 && typeof schema.id === 'string'))))
          ) {
            const dialect = detectDialect(schema.$schema);
            if (dialect !== undefined && dialect !== this.dialect) {
              (this.dialectScopes ??= []).push({
                frame: top,
                previous: this.dialect,
              });
              this.dialect = dialect;
            }
          }
          if (
            typeof schema.$ref === 'string' ||
            (this.dialect === 16 && typeof schema.$dynamicRef === 'string') ||
            (this.dialect === 8 && typeof schema.$recursiveRef === 'string')
          ) {
            const keys = getReferenceKeywords(schema, this.dialect);
            entry.references = keys.map((keyword) => ({
              keyword,
              reference: schema[keyword] as string,
              resolved: false,
              skipped: 'unresolved',
            }));
            if (config.unresolvedReference === 'throw')
              throw new JSONSchemaScanError(
                'unresolved-reference',
                schema[keys[0]] as string,
              );
            if (this.dialect < 8 && typeof schema.$ref === 'string')
              legacyMode = 1;
          }
        }
      }
      if (stage <= ScanStage.Children) {
        if (
          entry.depth > 256 &&
          checkpoint !== undefined &&
          entry.depth > checkpoint.depth &&
          entry.schema === checkpoint.schema
        )
          throw new JSONSchemaScanError(
            'schema-cycle',
            'Physical cycle in schema ancestry',
          );
        const start = entries.length;
        if (!(maxDepth !== undefined && entry.depth + 1 > maxDepth))
          appendChildren(
            entries,
            entry,
            config.keywordMap,
            this.ordered,
            this.masks,
            this.dialect,
            this.visitBooleans,
            legacyMode,
          );
        references?.bind(entries, start, top);
        const end = entries.length;
        if (end > start) {
          const depth = entry.depth;
          if (depth >= 256 && (depth & (depth - 1)) === 0) {
            checkpoint = { depth, schema: entry.schema as object, frame: top };
            if (checkpoints === undefined) this.checkpoints = checkpoints = [];
            checkpoints.push(checkpoint);
          }
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
      if (references !== undefined && references.releaseFrame === top)
        references.leave(top);
      if (checkpoint !== undefined && checkpoint.frame === top) {
        checkpoints!.pop();
        checkpoint = checkpoints![checkpoints!.length - 1];
      }
      if (resolveReference !== undefined && this.definitionFrame === top)
        this.definitionFrame = undefined;
      const scope = this.dialectScopes?.[this.dialectScopes.length - 1];
      if (scope !== undefined && scope.frame === top) {
        this.dialect = scope.previous;
        this.dialectScopes!.pop();
      }
      if (references) this.dialect = references.dialect;
      entries.pop();
      stages.pop();
    }
    return undefined;
  }
  /**
   * Count complete inlined schema work using this same engine without user callbacks or resolution.
   * Property order matches both driver configurations to keep hot configuration loads monomorphic.
   * @param schema Immutable provider template; user maxDepth and filter do not constrain the count.
   * @returns Number of schema occurrences, including boolean leaves.
   */
  private countNodes(schema: UnknownSchema | boolean): number {
    let count = 0;
    new ScanEngine(
      schema,
      {
        context: undefined,
        maxDepth: undefined,
        defaultDialect: this.config.defaultDialect,
        keywordMap: this.config.keywordMap,
        operations: [],
        filter: undefined,
        mutate: undefined,
        enter: () => {
          count++;
        },
        exit: undefined,
        resolveReference: undefined,
        unresolvedReference: undefined,
        limits: undefined,
      },
      false,
    ).run();
    return count;
  }
}
