import { escapeSegment, unescapeSegment } from '@winglet/json/pointer';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type {
  Blueprint,
  BlueprintNode,
  PropertyDeclaration,
} from '../../../blueprint';
import { getDeriveRuleTable } from '../../../derive';
import type { FieldNodeRecord } from '../../../record';
import { resolveDependencyPath } from '../../../utils/paths/resolveDependencyPath';
import type { GateSelectionTable } from '../../types/gateSelectionTable';
import type {
  RegistrationSink,
  SplitBucket,
  SplitOwner,
} from '../../types/splitRegistration';
import { getGateExpression } from '../gates/getGateExpression';
import { bindTemplatePath } from '../templatePaths/bindTemplatePath';
import { expandTemplatePaths } from '../templatePaths/expandTemplatePaths';
import { intersectsWatchedPath } from '../templatePaths/intersectsWatchedPath';
import { isCanonicalArrayIndex } from '../templatePaths/isCanonicalArrayIndex';
import { getContextOwners } from './getContextOwners';

/** No reverse dependency owners for a gate-free input path. */
const NO_OWNERS: readonly string[] = Object.freeze([]);

/** One absolute watch prefix and declarations registered exactly here. */
interface DependencyNode {
  /** Ordinary contributions retain their original positions for ordered merging. */
  plainOwners?: { rank: number; entry: DependencyNode['owners'][number] }[];
  /** Table-host groups, populated only after explicit table injection. */
  splitBuckets?: SplitBucket[];
  /** Declaration hosts that read this exact path. */
  owners: {
    /** Absolute owner path, possibly containing array wildcards. */
    path: string;
    /** Whether changed indices can bind every wildcard in this owner. */
    bindable: boolean;
    /** Original reads folded onto this host; absent for an unconditional host read. */
    watched?: string[];
  }[];
  /** Reused membership index preserves linear registration and owner order. */
  ownerPaths: Set<string>;
  /** Next escaped JSON Pointer segments. */
  children: Map<string, DependencyNode>;
}

/** Queryable reverse dependencies built once from the blueprint dictionary. */
class DependencyIndex {
  /** Immutable analysis retained only with its weakly cached index. */
  private readonly blueprint?: Blueprint;
  /** Contributions outside the gate loop can never be split. */
  private readonly ordinaryOwners = new Set<string>();
  /** Static path evidence shared by registration, deletion and owner predicates. */
  readonly splitOwners = new Map<string, SplitOwner>();
  /** Injection is idempotent even when no table owner qualifies. */
  private registrationPrepared = false;

  /** Whether this analysis has any injected, exclusively table-owned path. */
  get hasSplitOwners(): boolean {
    return this.splitOwners.size > 0;
  }
  /** Root of the absolute JSON Pointer watch trie. */
  private readonly root: DependencyNode | undefined;
  /** Ancestor trie steps retained only while their settlement context lives. */
  private readonly presenceMemos = new WeakMap<
    object,
    Map<string, DependencyNode[][]>
  >();

  /** Build absolute watch paths from authored reverse dependency IDs. */
  constructor(blueprint?: Blueprint) {
    this.blueprint = blueprint;
    this.root = undefined;
    if (!blueprint) return;
    this.root = { owners: [], ownerPaths: new Set(), children: new Map() };
    getContextOwners(blueprint);
    const dependencies = Object.entries(blueprint.dependencies);
    if (dependencies.length === 0 && blueprint.expressions.length === 0) return;
    const declarations = new Map<number, PropertyDeclaration>(
      blueprint.nodes.flatMap((node) =>
        node.declarations.map((declaration): [number, PropertyDeclaration] => [
          declaration.id,
          declaration,
        ]),
      ),
    );
    for (const [dependency, ids] of dependencies)
      for (const id of ids) {
        const declaration = declarations.get(id);
        if (!declaration) continue;
        const watched = resolveDependencyPath(declaration.path, dependency);
        if (watched === $.Context) continue;
        this.ordinaryOwners.add(declaration.path);
        this.add(watched, declaration.path);
      }
    const rules = getDeriveRuleTable(blueprint);
    for (const node of blueprint.nodes)
      for (const declaration of node.declarations)
        for (const rule of rules.byDeclaration.get(declaration.id) ?? []) {
          if (rule.kind !== 'derived' || !rule.targetName) continue;
          const targetPath =
            declaration.path + '/' + escapeSegment(rule.targetName);
          for (const watch of rule.watchDependencies) {
            const watched = resolveDependencyPath(targetPath, watch);
            if (watched !== $.Context) {
              this.ordinaryOwners.add(declaration.path);
              this.add(watched, declaration.path);
            }
          }
        }
    for (const node of blueprint.nodes)
      for (const declaration of node.declarations)
        for (const gate of declaration.gates) {
          const expression = getGateExpression(blueprint, gate.schemaPath);
          if (!expression) continue;
          for (const dependency of expression.dependencies) {
            const watched = resolveDependencyPath(gate.hostPath, dependency);
            if (watched === $.Context) continue;
            this.add(watched, declaration.path);
          }
        }
  }

  /**
   * Attach compute-owned static tables without importing the compute layer.
   * @param tables - Prepared table evidence; absence leaves the old query untouched
   * @returns Nothing; immutable split metadata is built at most once
   */
  prepareRegistration(
    tables: ReadonlyMap<BlueprintNode, GateSelectionTable>,
  ): void {
    if (this.registrationPrepared || !this.blueprint || !tables.size) return;
    this.registrationPrepared = true;
    const candidates = new Map<string, string>();
    const plain = new Set(this.ordinaryOwners);
    for (const node of this.blueprint.nodes)
      for (const declaration of node.declarations)
        for (const gate of declaration.gates) {
          const expression = getGateExpression(this.blueprint, gate.schemaPath);
          if (
            !expression?.dependencies.some(
              (dependency) =>
                resolveDependencyPath(gate.hostPath, dependency) !== $.Context,
            )
          )
            continue;
          let hostPath: string | undefined;
          for (const [host, table] of tables) {
            const name = unescapeSegment(
              declaration.path.slice(declaration.path.lastIndexOf('/') + 1),
            );
            const stepIndex = table.stepIndexByName.get(name);
            if (
              stepIndex !== undefined &&
              table.tableSteps.has(stepIndex) &&
              table.plan.steps[stepIndex].gate === gate &&
              declaration.path === host.path + '/' + escapeSegment(name) &&
              !declaration.path.includes('/*')
            ) {
              hostPath = host.path;
              break;
            }
          }
          if (hostPath === undefined) plain.add(declaration.path);
          else candidates.set(declaration.path, hostPath);
        }
    const pending = this.root ? [this.root] : [];
    const allNodes: DependencyNode[] = [];
    while (pending.length) {
      const node = pending.pop()!;
      allNodes.push(node);
      for (const entry of node.owners) if (entry.watched) plain.add(entry.path);
      pending.push(...node.children.values());
    }
    const runNumbers = new Map<string, number>();
    pending.push(...allNodes);
    while (pending.length) {
      const node = pending.pop()!;
      const grouped = new Map<string, Map<string, number>>();
      node.plainOwners = [];
      for (let rank = 0; rank < node.owners.length; rank++) {
        const entry = node.owners[rank];
        const host = candidates.get(entry.path);
        if (host === undefined || plain.has(entry.path) || entry.watched) {
          node.plainOwners.push({ rank, entry });
          continue;
        }
        let names = grouped.get(host);
        if (!names) grouped.set(host, (names = new Map()));
        names.set(
          unescapeSegment(entry.path.slice(entry.path.lastIndexOf('/') + 1)),
          rank,
        );
      }
      node.splitBuckets = [];
      for (const [hostPath, ranksByName] of grouped) {
        const runs: { ranks: number[]; firstRank: number; id: number }[] = [];
        const runByName = new Map<string, number>();
        let previous = -1;
        for (const [name, rank] of ranksByName) {
          let foreign = previous < 0;
          for (
            let between = previous + 1;
            !foreign && between < rank;
            between++
          )
            if (!node.owners[between].path.startsWith(hostPath + '/'))
              foreign = true;
          if (foreign) {
            const id = runNumbers.get(hostPath) ?? 0;
            runNumbers.set(hostPath, id + 1);
            runs.push({ ranks: [], firstRank: rank, id });
          }
          runs[runs.length - 1].ranks.push(rank);
          runByName.set(name, runs.length - 1);
          previous = rank;
        }
        const bucket: SplitBucket = {
          hostPath,
          ranksByName,
          firstRank: ranksByName.values().next().value!,
          runs,
          runByName,
        };
        node.splitBuckets.push(bucket);
        for (const [name, rank] of ranksByName)
          this.splitOwners.set(hostPath + '/' + escapeSegment(name), {
            bucket,
            rank,
            run: runByName.get(name)!,
          });
      }
    }
  }

  /**
   * Emit only ordinary and living table owners in the original trie/rank order.
   * @param changedPath - Concrete changed raw path
   * @param root - Current live structure used to resolve each table host
   * @param sink - Settlement effects and deferred rank-positioned anchors
   * @returns Nothing; presence and derive queries keep using the full owners array
   */
  affectedForRegistration<Self extends FieldNodeRecord<Self>>(
    changedPath: string,
    root: Self,
    sink: RegistrationSink,
  ): void {
    if (!this.root) return;
    const emitted = new Set<string>();
    const collect = (node: DependencyNode): void => {
      const events: { rank: number; emit: () => void }[] = [];
      for (const { rank, entry } of node.plainOwners ??
        node.owners.map((entry, rank) => ({ entry, rank }))) {
        const path = entry.bindable
          ? bindTemplatePath(entry.path, changedPath)
          : entry.path;
        const paths = path.includes('/*')
          ? expandTemplatePaths(root, path)
          : [path];
        events.push({
          rank,
          emit: () => {
            for (const concrete of paths)
              if (!emitted.has(concrete)) {
                emitted.add(concrete);
                sink.owner(concrete, 'plain');
              }
          },
        });
      }
      for (const bucket of node.splitBuckets ?? []) {
        let host: Self | undefined = root;
        for (const segment of bucket.hostPath.split('/').slice(1))
          host = host?.structure?.[unescapeSegment(segment)];
        const living: { path: string; rank: number }[] = [];
        if (host?.structure)
          for (const name of Object.keys(host.structure)) {
            const rank = bucket.ranksByName.get(name);
            if (rank !== undefined)
              living.push({
                path: bucket.hostPath + '/' + escapeSegment(name),
                rank,
              });
          }
        living.sort((left, right) => left.rank - right.rank);
        for (const anchor of sink.hit(
          bucket,
          living.map((entry) => entry.rank),
        ))
          events.push({ rank: anchor.rank, emit: anchor.insert });
        events.push({
          rank: bucket.firstRank,
          emit: () => {
            if (!emitted.has(bucket.hostPath)) {
              emitted.add(bucket.hostPath);
              sink.owner(bucket.hostPath, 'host', bucket);
            }
          },
        });
        for (const entry of living)
          events.push({
            rank: entry.rank,
            emit: () => {
              if (!emitted.has(entry.path)) {
                emitted.add(entry.path);
                sink.owner(entry.path, 'split', bucket);
              }
            },
          });
      }
      events.sort((left, right) => left.rank - right.rank);
      for (const event of events) event.emit();
    };
    let current = [this.root];
    collect(this.root);
    for (const segment of changedPath.split($.Separator).filter(Boolean)) {
      const next = this.presenceChildren(current, segment);
      if (!next.length) return;
      current = next;
      for (const node of current) collect(node);
    }
    const pending = current.flatMap((node) => [...node.children.values()]);
    while (pending.length) {
      const child = pending.pop()!;
      collect(child);
      pending.push(...child.children.values());
    }
  }

  /** Return owners whose reads intersect a changed path in either direction. */
  affected<Self extends FieldNodeRecord<Self>>(
    changedPath: string,
    root: Self,
  ): readonly string[] {
    const rootIndex = this.root;
    if (
      !rootIndex ||
      (rootIndex.owners.length === 0 && rootIndex.children.size === 0)
    )
      return NO_OWNERS;
    const owners = new Set<string>();
    let current: DependencyNode[] = [rootIndex];
    const collect = (node: DependencyNode): void => {
      for (const entry of node.owners) {
        const path = entry.bindable
          ? bindTemplatePath(entry.path, changedPath)
          : entry.path;
        if (path.includes('/*'))
          for (const expanded of expandTemplatePaths(root, path))
            owners.add(expanded);
        else owners.add(path);
      }
    };
    collect(rootIndex);
    for (const segment of changedPath.split($.Separator).filter(Boolean)) {
      const next: DependencyNode[] = [];
      for (const node of current) {
        const exact = node.children.get(segment);
        if (exact) next.push(exact);
        if (isCanonicalArrayIndex(segment)) {
          const wildcard = node.children.get($.Wildcard);
          if (wildcard) next.push(wildcard);
        }
      }
      if (next.length === 0) return [...owners];
      current = next;
      for (const node of current) collect(node);
    }
    const pending = current.flatMap((node) => [...node.children.values()]);
    while (pending.length) {
      const child = pending.pop();
      if (!child) continue;
      collect(child);
      pending.push(...child.children.values());
    }
    return [...owners];
  }

  /**
   * Resolve presence readers while excluding in-progress and changed-subtree owners.
   * @param hostPath - Live host whose direct child changed identity
   * @param childSegment - Escaped name of that child
   * @param metrics - Optional record-mode insertion counter
   * @param settlement - Call identity isolating the ancestor-step memo
   * @returns Bound owners, state-only owners and unbound templates for each query phase
   */
  affectedByPresence(
    hostPath: string,
    childSegment: string,
    metrics?: { ownerInsertions: number },
    settlement?: object,
  ): {
    owners: Set<string>;
    stateOnly: Set<string>;
    outerTemplates: Set<string>;
    directTemplates: Set<string>;
  } {
    const owners = new Set<string>();
    const stateOnly = new Set<string>();
    const outerTemplates = new Set<string>();
    const directTemplates = new Set<string>();
    if (!this.root)
      return { owners, stateOnly, outerTemplates, directTemplates };
    const changedPath = hostPath + '/' + childSegment;
    const ancestorOwners = new Set<string>();
    let memo = settlement ? this.presenceMemos.get(settlement) : undefined;
    if (!memo) {
      memo = new Map();
      if (settlement) this.presenceMemos.set(settlement, memo);
    }
    const levels = this.presenceLevels(hostPath, memo);
    this.collectPresenceOwners(
      levels.flat(),
      changedPath,
      ancestorOwners,
      outerTemplates,
      metrics,
    );
    for (const owner of ancestorOwners)
      if (owner.startsWith(hostPath + '/')) stateOnly.add(owner);
      else owners.add(owner);
    const depth = hostPath ? hostPath.split($.Separator).length : 1;
    const reached = levels.length === depth ? levels[levels.length - 1] : [];
    const pending = this.presenceChildren(reached, childSegment);
    const direct = new Set<string>();
    const subtree: DependencyNode[] = [];
    while (pending.length) {
      const child = pending.pop()!;
      subtree.push(child);
      for (const descendant of child.children.values())
        pending.push(descendant);
    }
    if (subtree.length)
      this.collectPresenceOwners(
        subtree,
        changedPath,
        direct,
        directTemplates,
        metrics,
      );
    for (const owner of direct)
      if (owner !== changedPath && !owner.startsWith(changedPath + '/'))
        owners.add(owner);
    return { owners, stateOnly, outerTemplates, directTemplates };
  }

  /**
   * Extend the parent's memoized trie levels without changing traversal order.
   * @param path - Bound host pointer in the current settlement
   * @param memo - Private call-local table, never exposing trie nodes to callers
   * @returns Ordered ancestor levels, ending at the first missing trie step
   */
  private presenceLevels(
    path: string,
    memo: Map<string, DependencyNode[][]>,
  ): DependencyNode[][] {
    const known = memo.get(path);
    if (known) return known;
    let levels: DependencyNode[][];
    if (!path) levels = [[this.root!]];
    else {
      const cut = path.lastIndexOf($.Separator);
      const parent = this.presenceLevels(path.slice(0, cut), memo);
      const last = parent[parent.length - 1];
      levels =
        last.length === 0
          ? parent
          : [...parent, this.presenceChildren(last, path.slice(cut + 1))];
    }
    memo.set(path, levels);
    return levels;
  }

  /** Bind exact and wildcard trie steps without rebuilding a prefix index. */
  private presenceChildren(
    nodes: readonly DependencyNode[],
    segment: string,
  ): DependencyNode[] {
    const next: DependencyNode[] = [];
    for (const node of nodes) {
      const exact = node.children.get(segment);
      if (exact) next.push(exact);
      const wildcard = isCanonicalArrayIndex(segment)
        ? node.children.get($.Wildcard)
        : undefined;
      if (wildcard) next.push(wildcard);
    }
    return next;
  }

  /** Bind affected owner templates against one changed live child path. */
  private collectPresenceOwners(
    nodes: readonly DependencyNode[],
    changedPath: string,
    owners: Set<string>,
    templates: Set<string>,
    metrics?: { ownerInsertions: number },
  ): void {
    const sizeBefore = owners.size;
    for (const node of nodes)
      for (const entry of node.owners) {
        if (
          entry.watched &&
          !entry.watched.some((watched) =>
            intersectsWatchedPath(watched, changedPath),
          )
        )
          continue;
        const path = entry.bindable
          ? bindTemplatePath(entry.path, changedPath)
          : entry.path;
        if (path.includes('/*')) templates.add(path);
        else owners.add(path);
      }
    if (metrics) metrics.ownerInsertions += owners.size - sizeBefore;
  }

  /** Insert one exact watched location into the pointer trie. */
  private add(watchedPath: string, owner: string): void {
    const ownerParts = owner.split($.Separator);
    const watchedParts = watchedPath.split($.Separator);
    const originalWatchedPath = watchedPath;
    // A fixed read of another item depends on that array host's whole subtree.
    for (let index = 1; index < ownerParts.length; index++) {
      if (
        ownerParts[index] === $.Wildcard &&
        watchedParts[index] !== $.Wildcard &&
        ownerParts
          .slice(1, index)
          .every((part, position) => part === watchedParts[position + 1]) &&
        watchedParts[index]
      ) {
        watchedPath = ownerParts.slice(0, index).join($.Separator);
        break;
      }
    }
    let current = this.root!;
    for (const segment of watchedPath.split($.Separator).filter(Boolean)) {
      let child = current.children.get(segment);
      if (!child) {
        child = { owners: [], ownerPaths: new Set(), children: new Map() };
        current.children.set(segment, child);
      }
      current = child;
    }
    const indexedParts = watchedPath.split($.Separator);
    if (!current.ownerPaths.has(owner)) {
      current.ownerPaths.add(owner);
      current.owners.push({
        path: owner,
        bindable: ownerParts.every(
          (part, index) =>
            part !== $.Wildcard || indexedParts[index] === $.Wildcard,
        ),
        ...(watchedPath !== originalWatchedPath
          ? { watched: [originalWatchedPath] }
          : {}),
      });
    } else {
      const entry = current.owners.find(
        (candidate) => candidate.path === owner,
      )!;
      if (watchedPath === originalWatchedPath) delete entry.watched;
      else if (entry.watched && !entry.watched.includes(originalWatchedPath))
        entry.watched.push(originalWatchedPath);
    }
  }
}

/** Cached dependency indexes live only while their analyzed blueprint lives. */
const INDEXES = new WeakMap<Blueprint, DependencyIndex>();
/** Dependency absence is proven independently of branch presence. */
const EMPTY_INDEX = new DependencyIndex();
Object.freeze(EMPTY_INDEX);

/**
 * Reuse a path index for all writes against one analyzed blueprint.
 * @param blueprint - Static dependency dictionary and declaration IDs
 * @param tables - Optional compute-owned static evidence for split registration
 * @returns Reverse dependency trie for ancestor and descendant invalidation
 */
export const getDependencyIndex = (
  blueprint: Blueprint,
  tables?: ReadonlyMap<BlueprintNode, GateSelectionTable>,
): DependencyIndex => {
  if (
    !blueprint.capabilities.hasDependencies &&
    !blueprint.capabilities.hasExpressions
  )
    return EMPTY_INDEX;
  let index = INDEXES.get(blueprint);
  if (!index) {
    index = new DependencyIndex(blueprint);
    INDEXES.set(blueprint, index);
  }
  if (tables) index.prepareRegistration(tables);
  return index;
};
