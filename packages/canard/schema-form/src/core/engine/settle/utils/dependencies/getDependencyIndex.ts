import { map as mapArray } from '@winglet/common-utils/array';

import {
  JSONPointer as $,
  PointerOperator,
  type PointerSegment,
  appendSegment,
  hasPointerOperator,
  isDescendantPath,
  joinPointer,
  parsePointerSegment,
  parsePointerSegments,
  readPointerSegment,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type {
  Blueprint,
  BlueprintGate,
  BlueprintNode,
  PropertyDeclaration,
} from '../../../blueprint';
import { getDeriveRuleTable } from '../../../derive';
import type { FieldNodeRecord } from '../../../record';
import { getBlueprintDerived } from '../../../utils/cache/derivedRecords';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import { resolveDependencyPath } from '../../../utils/paths/resolveDependencyPath';
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

/** Minimal injected evidence keeps dependency analysis independent of compute. */
interface RegistrationTable {
  readonly plan: {
    readonly steps: readonly { readonly gate: BlueprintGate | undefined }[];
  };
  readonly stepIndexByName: ReadonlyMap<string, number>;
  readonly tableSteps: ReadonlySet<number>;
}

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
  children: Map<PointerSegment, DependencyNode>;
}

/** Call-local prefix traversal results; never retained by the static index. */
export type DependencyPresenceMemo = Map<string, DependencyNode[][]>;

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
  /** Finite authored syntax; query misses belong only to the querying runtime. */
  private readonly preparedSegments = new Map<
    string,
    readonly PointerSegment[]
  >();

  /**
   * Read prepared syntax without retaining dynamic addresses on the blueprint.
   * @param path - Authored or concrete absolute pointer to decode
   * @param runtime - Optional owner for bounded concrete syntax reuse
   * @returns The retained readonly array, or unretained syntax for a cold caller
   */
  pathSegments(path: string, runtime?: object): readonly PointerSegment[] {
    return (
      this.preparedSegments.get(path) ??
      (runtime
        ? getCachedPointerSegments(runtime, path)
        : parsePointerSegments(path))
    );
  }

  /** Whether this analysis has any injected, exclusively table-owned path. */
  get hasSplitOwners(): boolean {
    return this.splitOwners.size > 0;
  }
  /** Root of the absolute JSON Pointer watch trie. */
  private readonly root: DependencyNode | undefined;

  /** Build absolute watch paths from authored reverse dependency IDs. */
  constructor(blueprint?: Blueprint) {
    this.blueprint = blueprint;
    this.root = undefined;
    if (!blueprint) return;
    this.root = { owners: [], ownerPaths: new Set(), children: new Map() };
    for (const node of blueprint.nodes) {
      if (!this.preparedSegments.has(node.path))
        this.preparedSegments.set(node.path, parsePointerSegments(node.path));
      if (!this.preparedSegments.has(node.schemaPath))
        this.preparedSegments.set(
          node.schemaPath,
          parsePointerSegments(node.schemaPath),
        );
      for (const declaration of node.declarations) {
        if (!this.preparedSegments.has(declaration.path))
          this.preparedSegments.set(
            declaration.path,
            parsePointerSegments(declaration.path),
          );
        if (!this.preparedSegments.has(declaration.schemaPath))
          this.preparedSegments.set(
            declaration.schemaPath,
            parsePointerSegments(declaration.schemaPath),
          );
      }
    }
    getContextOwners(blueprint);
    const dependencies = Object.entries(blueprint.dependencies);
    if (dependencies.length === 0 && blueprint.expressions.length === 0) return;
    const declarations = new Map<number, PropertyDeclaration>(
      blueprint.nodes.flatMap((node) =>
        mapArray(
          node.declarations,
          (declaration): [number, PropertyDeclaration] => [
            declaration.id,
            declaration,
          ],
        ),
      ),
    );
    for (const [dependency, ids] of dependencies)
      for (const id of ids) {
        const declaration = declarations.get(id);
        if (!declaration) continue;
        const watched = resolveDependencyPath(declaration.path, dependency);
        if (readPointerSegment(watched, 0) === PointerOperator.Context)
          continue;
        this.ordinaryOwners.add(declaration.path);
        this.add(watched, declaration.path);
      }
    const rules = getDeriveRuleTable(blueprint);
    for (const node of blueprint.nodes)
      for (const declaration of node.declarations)
        for (const rule of rules.byDeclaration.get(declaration.id) ?? []) {
          if (
            rule.kind !== 'derived' ||
            (rule.targetName === undefined && !rule.targetItems)
          )
            continue;
          const targetPath = rule.targetItems
            ? joinPointer([
                ...(this.preparedSegments.get(declaration.path) ?? []),
                PointerOperator.Wildcard,
              ])
            : appendSegment(declaration.path, rule.targetName ?? '');
          for (const watch of rule.watchDependencies) {
            const watched = resolveDependencyPath(targetPath, watch);
            if (readPointerSegment(watched, 0) !== PointerOperator.Context) {
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
            if (readPointerSegment(watched, 0) === PointerOperator.Context)
              continue;
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
    tables: ReadonlyMap<BlueprintNode, RegistrationTable>,
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
            !(() => {
              const items = expression?.dependencies;
              if (items == null) return undefined;
              for (
                let index = 0, count = items.length;
                index < count;
                index++
              ) {
                if (!(index in items)) continue;
                const dependency = items[index];
                if (
                  readPointerSegment(
                    resolveDependencyPath(gate.hostPath, dependency),
                    0,
                  ) !== PointerOperator.Context
                )
                  return true;
              }
              return false;
            })()
          )
            continue;
          let hostPath: string | undefined;
          for (const [host, table] of tables) {
            const name = readPointerSegment(declaration.path, -1);
            if (typeof name !== 'string') continue;
            const stepIndex = table.stepIndexByName.get(name);
            if (
              stepIndex !== undefined &&
              table.tableSteps.has(stepIndex) &&
              table.plan.steps[stepIndex].gate === gate &&
              declaration.path === appendSegment(host.path, name) &&
              !hasPointerOperator(declaration.path, PointerOperator.Wildcard)
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
        const name = readPointerSegment(entry.path, -1);
        if (typeof name !== 'string') continue;
        names.set(name, rank);
      }
      node.splitBuckets = [];
      for (const [hostPath, ranksByName] of grouped) {
        if (!this.preparedSegments.has(hostPath))
          this.preparedSegments.set(hostPath, parsePointerSegments(hostPath));
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
            if (!isDescendantPath(node.owners[between].path, hostPath))
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
          this.splitOwners.set(appendSegment(hostPath, name), {
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
    const hostsEmitted = new Set<string>();
    const collect = (node: DependencyNode): void => {
      const events: { rank: number; emit: () => void }[] = [];
      for (const { rank, entry } of node.plainOwners ??
        mapArray(node.owners, (entry, rank) => ({ entry, rank }))) {
        const path = entry.bindable
          ? bindTemplatePath(entry.path, changedPath)
          : entry.path;
        const paths = hasPointerOperator(path, PointerOperator.Wildcard)
          ? expandTemplatePaths(
              root,
              path,
              this.pathSegments(path, root.runtime),
            )
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
        for (const segment of this.pathSegments(bucket.hostPath))
          if (typeof segment === 'string') host = host?.structure?.[segment];
          else {
            host = undefined;
            break;
          }
        const living: { path: string; rank: number }[] = [];
        if (host?.structure)
          for (const name of Object.keys(host.structure)) {
            const rank = bucket.ranksByName.get(name);
            if (rank !== undefined)
              living.push({
                path: appendSegment(bucket.hostPath, name),
                rank,
              });
          }
        living.sort((left, right) => left.rank - right.rank);
        for (const anchor of sink.hit(
          bucket,
          mapArray(living, (entry) => entry.rank),
        ))
          events.push({ rank: anchor.rank, emit: anchor.insert });
        events.push({
          rank: bucket.firstRank,
          emit: () => {
            if (!hostsEmitted.has(bucket.hostPath)) {
              hostsEmitted.add(bucket.hostPath);
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
    for (const segment of this.pathSegments(changedPath, root.runtime)) {
      if (typeof segment !== 'string') return;

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
        if (hasPointerOperator(path, PointerOperator.Wildcard))
          for (const expanded of expandTemplatePaths(
            root,
            path,
            this.pathSegments(path, root.runtime),
          ))
            owners.add(expanded);
        else owners.add(path);
      }
    };
    collect(rootIndex);
    for (const segment of this.pathSegments(changedPath, root.runtime)) {
      if (typeof segment !== 'string') return [...owners];

      const next: DependencyNode[] = [];
      for (const node of current) {
        const exact = node.children.get(segment);
        if (exact) next.push(exact);
        if (isCanonicalArrayIndex(segment)) {
          const wildcard = node.children.get(PointerOperator.Wildcard);
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
   * @param runtime - Optional root runtime owning bounded dynamic syntax
   * @returns Bound owners, state-only owners and unbound templates for each query phase
   */
  affectedByPresence(
    hostPath: string,
    childSegment: string,
    metrics?: { ownerInsertions: number },
    settlement?: { dependencyPresenceMemo?: DependencyPresenceMemo },
    runtime?: object,
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
    const childName = parsePointerSegment(childSegment);
    if (typeof childName !== 'string')
      return { owners, stateOnly, outerTemplates, directTemplates };
    const changedPath = appendSegment(hostPath, childName);
    const changedSegments = this.pathSegments(changedPath, runtime);
    const ancestorOwners = new Set<string>();
    let memo = settlement?.dependencyPresenceMemo;
    if (!memo) {
      memo = new Map();
      if (settlement) settlement.dependencyPresenceMemo = memo;
    }
    const levels = this.presenceLevels(hostPath, memo);
    this.collectPresenceOwners(
      levels.flat(),
      changedPath,
      changedSegments,
      ancestorOwners,
      outerTemplates,
      metrics,
    );
    for (const owner of ancestorOwners)
      if (isDescendantPath(owner, hostPath)) stateOnly.add(owner);
      else owners.add(owner);
    const depth = this.pathSegments(hostPath, runtime).length + 1;
    const reached = levels.length === depth ? levels[levels.length - 1] : [];
    const pending = this.presenceChildren(reached, childName);
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
        changedSegments,
        direct,
        directTemplates,
        metrics,
      );
    for (const owner of direct)
      if (owner !== changedPath && !isDescendantPath(owner, changedPath))
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
      const parent = this.presenceLevels(resolvePointer(path, $.Parent), memo);
      const last = parent[parent.length - 1];
      const name = readPointerSegment(path, -1);
      levels =
        last.length === 0 || typeof name !== 'string'
          ? parent
          : [...parent, this.presenceChildren(last, name)];
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
        ? node.children.get(PointerOperator.Wildcard)
        : undefined;
      if (wildcard) next.push(wildcard);
    }
    return next;
  }

  /** Bind affected owner templates against one changed live child path. */
  private collectPresenceOwners(
    nodes: readonly DependencyNode[],
    changedPath: string,
    changedSegments: readonly PointerSegment[],
    owners: Set<string>,
    templates: Set<string>,
    metrics?: { ownerInsertions: number },
  ): void {
    const sizeBefore = owners.size;
    for (const node of nodes)
      for (const entry of node.owners) {
        if (
          entry.watched &&
          !(() => {
            const items = entry.watched;
            for (let index = 0, count = items.length; index < count; index++) {
              if (!(index in items)) continue;
              const watched = items[index];
              if (
                intersectsWatchedPath(
                  watched,
                  changedPath,
                  this.pathSegments(watched),
                  changedSegments,
                )
              )
                return true;
            }
            return false;
          })()
        )
          continue;
        const path = entry.bindable
          ? bindTemplatePath(entry.path, changedPath)
          : entry.path;
        if (hasPointerOperator(path, PointerOperator.Wildcard))
          templates.add(path);
        else owners.add(path);
      }
    if (metrics) metrics.ownerInsertions += owners.size - sizeBefore;
  }

  /** Insert one exact watched location into the pointer trie. */
  private add(watchedPath: string, owner: string): void {
    let ownerParts = this.preparedSegments.get(owner);
    if (!ownerParts) {
      ownerParts = parsePointerSegments(owner);
      this.preparedSegments.set(owner, ownerParts);
    }
    let watchedParts = this.preparedSegments.get(watchedPath);
    if (!watchedParts) {
      watchedParts = parsePointerSegments(watchedPath);
      this.preparedSegments.set(watchedPath, watchedParts);
    }
    let indexedParts = watchedParts;
    const originalWatchedPath = watchedPath;
    for (let index = 0; index < ownerParts.length; index++) {
      if (
        ownerParts[index] === PointerOperator.Wildcard &&
        watchedParts[index] !== PointerOperator.Wildcard &&
        (() => {
          const items = ownerParts.slice(0, index);
          for (let cursor = 0, count = items.length; cursor < count; cursor++) {
            if (!(cursor in items)) continue;
            const part = items[cursor];
            const position = cursor;
            if (!(part === watchedParts[position])) return false;
          }
          return true;
        })() &&
        watchedParts[index] !== undefined
      ) {
        indexedParts = ownerParts.slice(0, index);
        watchedPath = joinPointer(indexedParts);
        break;
      }
    }
    let current = this.root!;
    for (const segment of indexedParts) {
      let child = current.children.get(segment);
      if (!child) {
        child = { owners: [], ownerPaths: new Set(), children: new Map() };
        current.children.set(segment, child);
      }
      current = child;
    }
    if (!current.ownerPaths.has(owner)) {
      current.ownerPaths.add(owner);
      current.owners.push({
        path: owner,
        bindable: (() => {
          const items = ownerParts;
          for (
            let position = 0, count = items.length;
            position < count;
            position++
          ) {
            if (!(position in items)) continue;
            const part = items[position];
            const index = position;
            if (
              !(
                part !== PointerOperator.Wildcard ||
                indexedParts[index] === PointerOperator.Wildcard
              )
            )
              return false;
          }
          return true;
        })(),
        ...(watchedPath !== originalWatchedPath
          ? { watched: [originalWatchedPath] }
          : {}),
      });
    } else {
      const entry = current.owners.find(
        (candidate) => candidate.path === owner,
      )!;
      if (watchedPath === originalWatchedPath) delete entry.watched;
      else if (
        entry.watched &&
        entry.watched.indexOf(originalWatchedPath) === -1
      )
        entry.watched.push(originalWatchedPath);
    }
  }
}

/** Cached dependency indexes live only while their analyzed blueprint lives. */

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
  tables?: ReadonlyMap<BlueprintNode, RegistrationTable>,
): DependencyIndex => {
  if (
    !blueprint.capabilities.hasDependencies &&
    !blueprint.capabilities.hasExpressions
  )
    return EMPTY_INDEX;
  let index = getBlueprintDerived<'dependencyIndex', DependencyIndex>(
    blueprint,
  ).dependencyIndex;
  if (!index) {
    index = new DependencyIndex(blueprint);
    getBlueprintDerived<'dependencyIndex', DependencyIndex>(
      blueprint,
    ).dependencyIndex = index;
  }
  if (tables) index.prepareRegistration(tables);
  return index;
};
