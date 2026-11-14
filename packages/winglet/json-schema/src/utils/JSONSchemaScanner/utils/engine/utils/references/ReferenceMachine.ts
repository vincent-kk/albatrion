import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { DialectFlag, DialectMask } from '../../../../../dialect/DialectFlag';
import { DIALECT_FLAGS } from '../../../../../dialect/dialectFlags';
import { JSONSchemaScanError } from '../../../../../error/JSONSchemaScanError';
import { JSONSchemaScanErrorCode } from '../../../../../error/JSONSchemaScanErrorCode';
import { ScanLimit } from '../../../../../limits/ScanLimit';
import { ReferenceSkipReason } from '../../../../../referenceOutcome/ReferenceSkipReason';
import { cloneSchema } from '../../../../../schemaCopy/cloneSchema';
import type {
  ReferenceKeyword,
  ReferenceResolver,
  ReferenceResolverAsync,
  ReferenceStep,
} from '../../../../type';
import type { EngineEntry, ScanConfig } from '../../type';
import { LegacyMode } from '../LegacyMode';
import { getReferenceKeywords } from '../getReferenceKeywords';
import { isThenable } from '../isThenable';

/** A context switch belongs to the lexical frame that introduced it. */
interface ContextScope {
  frame: number;
  previous: unknown;
  dialect: number;
}
/** Reference-only continuation; ordinary nodes allocate no progress record. */
interface Progress {
  entry: EngineEntry;
  frame: number;
  keys: readonly ReferenceKeyword[];
  index: number;
  replacements: number;
  branches: Array<{ uri: string; value: UnknownSchema | boolean }> | undefined;
  removed: string[] | undefined;
  awaiting: boolean;
}
/** Prepared synthetic branch receives the host context without re-entering the target's identifier. */
interface Branch {
  uri: string;
}

/** Shared resumable reference step, allocated only for a configured provider. */
export class ReferenceMachine {
  /** Current resource's compiled dialect bit. */
  public dialect: number;
  /** Old-dialect discovery mode: retained reference or KEEP wrapper. */
  public legacyMode: LegacyMode = LegacyMode.None;
  /** Deepest frame with a context or canonical identity to release; ordinary frames skip leave entirely. */
  public releaseFrame = -1;
  /** Identity-owning frame stack; sibling indices are removed before their peers enter. */
  private ownerFrames: number[] = [];
  /** Current lexical context, compared by identity. */
  private context: unknown;
  /** Provider methods never receive visitor context or mutable entry metadata. */
  private readonly resolver:
    | ReferenceResolver<any>
    | ReferenceResolverAsync<any>;
  /** Context restoration records exist only for real context changes. */
  private scopes: ContextScope[] = [];
  /** Canonical locations active along replacement and synthetic-branch ancestry. */
  private active = new Set<string>();
  /** Canonical identities match ownerFrames by index and need no per-frame arrays. */
  private ownedUris: string[] = [];
  /** Provider callback presence is fixed before traversal. */
  private readonly hasChild: boolean;
  /** Pure replacement scans never probe the synthetic-branch table. */
  private hasSynthetic = false;
  /** Synthetic child metadata exists only for newly appended branches. */
  private synthetic = new WeakMap<EngineEntry, Branch>();
  /** Pending branch assignments are attached after ordinary child capture. */
  private bindings = new Map<number, Map<number, Branch>>();
  /** Suspended reference continuation, absent for ordinary nodes. */
  private progress: Progress | undefined;
  /** Total inlined schema nodes in this scan. */
  private inlined = 0;
  /** Counts are stable for an immutable provider template identity. */
  private counts = new WeakMap<object, number>();

  /**
   * Establish a provider context once for the document.
   * @param root Caller-owned original root.
   * @param config Immutable scan options and driver-owned operation ledger.
   * @param awaitResults Whether resolve results may suspend.
   * @param countNodes Shared-engine counting traversal, independent of user depth/filter.
   */
  constructor(
    root: UnknownSchema | boolean,
    private readonly config: ScanConfig<any, any>,
    private readonly awaitResults: boolean,
    private readonly countNodes: (schema: UnknownSchema | boolean) => number,
  ) {
    const resolver = config.resolveReference;
    if (
      resolver === null ||
      typeof resolver !== 'object' ||
      typeof resolver.root !== 'function' ||
      typeof resolver.dialect !== 'function' ||
      typeof resolver.resolve !== 'function' ||
      (resolver.child !== undefined && typeof resolver.child !== 'function')
    )
      throw new TypeError('resolveReference must implement ReferenceResolver');
    this.resolver = resolver;
    this.context = resolver.root(root);
    this.dialect = DIALECT_FLAGS[resolver.dialect(this.context)];
    this.hasChild = resolver.child !== undefined;
  }

  /**
   * Enter an original lexical child or activate a prepared branch.
   * @param entry Fresh child before callbacks.
   * @param frame Stable engine frame index.
   * @returns Nothing; only changed contexts allocate restoration records.
   */
  public enter(entry: EngineEntry, frame: number): void {
    const branch = this.hasSynthetic ? this.synthetic.get(entry) : undefined;
    if (branch !== undefined) {
      this.active.add(branch.uri);
      this.ownedUris.push(branch.uri);
      this.ownerFrames.push(frame);
      this.releaseFrame = frame;
    } else if (frame !== 0 && this.hasChild && !entry.inert) {
      const context = this.resolver.child!(
        this.context,
        entry.keyword!,
        entry.schema,
      );
      if (context !== this.context) {
        this.scopes.push({
          frame,
          previous: this.context,
          dialect: this.dialect,
        });
        this.context = context;
        this.releaseFrame = frame;
        this.dialect = DIALECT_FLAGS[this.resolver.dialect(context)];
      }
    }
  }

  /**
   * Handle references after callbacks, resuming only the outstanding provider call.
   * @param entry Current mutable engine view.
   * @param frame Stable owner frame.
   * @param definition Whether an ancestor definition frame owns this occurrence.
   * @param resumed Already-awaited result, used only after suspension.
   * @returns A pending thenable, or undefined once reference processing completes.
   */
  public run(
    entry: EngineEntry,
    frame: number,
    definition: boolean,
    resumed?: unknown,
  ): PromiseLike<unknown> | undefined {
    this.legacyMode = LegacyMode.None;
    let state = this.progress;
    if (state === undefined) {
      const schema = entry.schema;
      if (entry.inert || schema === null || typeof schema !== 'object') return;
      if (
        !(
          typeof schema.$ref === 'string' ||
          (this.dialect === DialectFlag.Draft202012 &&
            typeof schema.$dynamicRef === 'string') ||
          (this.dialect === DialectFlag.Draft201909 &&
            typeof schema.$recursiveRef === 'string')
        )
      )
        return;
      const keys = getReferenceKeywords(schema, this.dialect);
      if (!keys.length) return;
      state = {
        entry,
        frame,
        keys,
        index: 0,
        replacements: 0,
        branches: undefined,
        removed: undefined,
        awaiting: false,
      };
      this.progress = state;
    }
    while (state.index < state.keys.length) {
      const schema = entry.schema as UnknownSchema;
      const keyword = state.keys[state.index];
      const reference = schema[keyword] as string;
      const outcome = { keyword, reference, resolved: false } as NonNullable<
        EngineEntry['references']
      >[number];
      (entry.references ??= []).push(outcome);
      if (definition) {
        outcome.skipped = ReferenceSkipReason.Definition;
        state.index++;
        continue;
      }
      let result: unknown;
      if (state.awaiting) {
        result = resumed;
        state.awaiting = false;
      } else {
        result = this.resolver.resolve(reference, keyword, this.context);
        if (this.awaitResults && isThenable(result)) {
          entry.references!.pop();
          state.awaiting = true;
          return result;
        }
      }
      if (
        result === null ||
        typeof result !== 'object' ||
        !('status' in result) ||
        ((result as ReferenceStep).status !== 'resolved' &&
          (result as ReferenceStep).status !== 'skipped')
      )
        throw new JSONSchemaScanError(
          JSONSchemaScanErrorCode.InvalidResolverResult,
          'Expected a ReferenceStep',
        );
      const step = result as ReferenceStep;
      if (step.status === 'skipped') {
        if (
          !['unresolved', 'dynamic', 'relocation', 'invalid'].includes(
            step.reason,
          ) ||
          (step.uri !== undefined && typeof step.uri !== 'string')
        )
          throw new JSONSchemaScanError(
            JSONSchemaScanErrorCode.InvalidResolverResult,
            'Invalid skipped reference result',
          );
        outcome.uri = step.uri;
        outcome.skipped = step.reason;
        if (
          step.reason === ReferenceSkipReason.Unresolved &&
          this.config.unresolvedReference === 'throw'
        )
          throw new JSONSchemaScanError(
            JSONSchemaScanErrorCode.UnresolvedReference,
            reference,
          );
        state.index++;
        continue;
      }
      if (
        typeof step.uri !== 'string' ||
        !(
          typeof step.target === 'boolean' ||
          (step.target !== null &&
            typeof step.target === 'object' &&
            !Array.isArray(step.target))
        )
      )
        throw new JSONSchemaScanError(
          JSONSchemaScanErrorCode.InvalidResolverResult,
          'Invalid resolved reference result',
        );
      outcome.uri = step.uri;
      if (this.active.has(step.uri)) {
        outcome.skipped = ReferenceSkipReason.Cycle;
        state.index++;
        continue;
      }
      const legacy = (this.dialect & DialectMask.Legacy) !== 0;
      const own = Object.keys(schema);
      const sole = own.length === 0 || (own.length === 1 && own[0] === keyword);
      let keep = false;
      let blocked = false;
      if (legacy && !sole)
        for (const key of own) {
          if (key === keyword) continue;
          if (key === '$schema' || key === 'definitions' || key === '$defs')
            keep = true;
          else if (
            !(
              schema[key] === null ||
              typeof schema[key] === 'string' ||
              typeof schema[key] === 'number'
            )
          ) {
            blocked = true;
            break;
          }
        }
      if (blocked) {
        outcome.skipped = 'relocation';
        state.index++;
        continue;
      }
      if (
        !legacy &&
        hasOwnProperty(schema, 'allOf') &&
        !Array.isArray(schema.allOf) &&
        !(state.keys.length === 1 && sole)
      ) {
        outcome.skipped = 'invalid';
        state.index++;
        continue;
      }
      let count =
        typeof step.target === 'boolean' ? 1 : this.counts.get(step.target);
      if (count === undefined) {
        count = this.countNodes(step.target);
        this.counts.set(step.target as object, count);
      }
      this.inlined += count;
      if (
        this.inlined >
        (this.config.limits?.inlinedNodes ?? ScanLimit.InlinedNodes)
      )
        throw new JSONSchemaScanError(
          JSONSchemaScanErrorCode.InlinedNodeLimit,
          'Inlining exceeds the node limit',
        );
      const copy = cloneSchema(step.target);
      outcome.resolved = true;
      if ((legacy && !keep) || (!legacy && state.keys.length === 1 && sole)) {
        if (
          ++state.replacements >
          (this.config.limits?.referenceChain ?? ScanLimit.ReferenceChain)
        )
          throw new JSONSchemaScanError(
            JSONSchemaScanErrorCode.ReferenceChainLimit,
            'Reference replacement chain exceeds the limit',
          );
        this.ownedUris.push(step.uri);
        this.ownerFrames.push(frame);
        this.releaseFrame = frame;
        this.active.add(step.uri);
        entry.schema = copy;
        this.config.operations.push({
          kind: 'replace',
          path: entry.path,
          value: copy,
          copy: false,
        });
        state.keys =
          copy !== null && typeof copy === 'object'
            ? getReferenceKeywords(copy, this.dialect)
            : [];
        state.index = 0;
        continue;
      }
      (state.branches ??= []).push({ uri: step.uri, value: copy });
      (state.removed ??= []).push(keyword);
      state.index++;
    }
    const schema = entry.schema;
    if (
      state.branches?.length &&
      schema !== null &&
      typeof schema === 'object'
    ) {
      const legacy = (this.dialect & DialectMask.Legacy) !== 0;
      const wrapper: UnknownSchema = {};
      for (const key of Object.keys(schema))
        if (
          legacy
            ? key === '$schema' || key === 'definitions' || key === '$defs'
            : !state.removed!.includes(key)
        )
          Object.defineProperty(wrapper, key, {
            value: schema[key],
            enumerable: true,
            writable: true,
            configurable: true,
          });
      const offset = legacy ? 0 : (schema.allOf?.length ?? 0);
      wrapper.allOf = (legacy ? [] : (schema.allOf ?? [])).concat(
        state.branches.map((branch) => branch.value),
      );
      const bindings = new Map<number, Branch>();
      for (let index = 0; index < state.branches.length; index++)
        bindings.set(offset + index, { uri: state.branches[index].uri });
      this.bindings.set(frame, bindings);
      entry.schema = wrapper;
      this.config.operations.push({
        kind: 'wrap',
        path: entry.path,
        value: wrapper,
        copy: true,
        removed: state.removed!,
        branches: state.branches.map((branch) => branch.value),
      });
      if (legacy) this.legacyMode = LegacyMode.Wrapped;
    } else if (
      (this.dialect & DialectMask.Legacy) !== 0 &&
      schema !== null &&
      typeof schema === 'object' &&
      typeof schema.$ref === 'string'
    )
      this.legacyMode = LegacyMode.ReferenceKept;
    this.progress = undefined;
    return undefined;
  }

  /**
   * Assign branch-owned identities to captured synthetic allOf children.
   * @param entries Engine stack after child capture.
   * @param start First newly captured entry.
   * @param frame Parent owner frame.
   * @returns Nothing; original allOf siblings never receive a synthetic identity.
   */
  public bind(entries: EngineEntry[], start: number, frame: number): void {
    const branches = this.bindings.get(frame);
    if (!branches) return;
    for (let index = start; index < entries.length; index++) {
      const child = entries[index];
      if (child.keyword === 'allOf' && typeof child.variant === 'number') {
        const branch = branches.get(child.variant);
        if (branch) {
          this.synthetic.set(child, branch);
          this.hasSynthetic = true;
        }
      }
    }
    this.bindings.delete(frame);
  }

  /**
   * Release only identities and context changes owned by this completed frame.
   * @param frame Stable owner frame index.
   * @returns Nothing; independent siblings regain the enclosing context.
   */
  public leave(frame: number): void {
    while (this.ownerFrames[this.ownerFrames.length - 1] === frame) {
      this.ownerFrames.pop();
      this.active.delete(this.ownedUris.pop()!);
    }
    const scope = this.scopes[this.scopes.length - 1];
    if (scope?.frame === frame) {
      this.context = scope.previous;
      this.dialect = scope.dialect;
      this.scopes.pop();
    }
    this.releaseFrame = Math.max(
      this.scopes[this.scopes.length - 1]?.frame ?? -1,
      this.ownerFrames[this.ownerFrames.length - 1] ?? -1,
    );
  }
}
