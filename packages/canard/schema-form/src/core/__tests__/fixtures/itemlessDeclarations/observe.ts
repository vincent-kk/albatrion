import type { BlueprintNode } from '../../../engine';
import type { TestFieldNode, TestPublicFieldNode } from '../testFieldNode';
import { ObservationCodec, assertObservationEqual } from './codec';
import type { ItemlessScene } from './scenes';

/** Minimal unchanged dispatcher/binding surface shared by source and copied production dist. */
export interface ItemlessEngine {
  /** Build an unmounted public tree with its private runtime record. */
  buildFieldNodeTree(props: Record<string, unknown>): TestPublicFieldNode;
  /** Complete the binding mount with its normal default-source behavior. */
  mountFieldNode(root: TestPublicFieldNode, value?: unknown): void;
  /** Public replacement/merge dispatcher. */
  dispatchSetValue(
    root: TestFieldNode,
    value: unknown,
    option?: number,
  ): unknown;
  /** Public append dispatcher. */
  dispatchPush(root: TestFieldNode, value?: unknown): unknown;
  /** Public insertion dispatcher. */
  dispatchInsert(root: TestFieldNode, index: number, value?: unknown): unknown;
  /** Public removal dispatcher. */
  dispatchRemove(root: TestFieldNode, index: number): unknown;
  /** Public tail removal dispatcher. */
  dispatchPop(root: TestFieldNode): unknown;
  /** Public clear dispatcher. */
  dispatchClear(root: TestFieldNode): unknown;
  /** Public item update dispatcher. */
  dispatchUpdate(root: TestFieldNode, index: number, value: unknown): unknown;
  /** Public batch boundary. */
  dispatchBatch(root: TestFieldNode, callback: () => void): unknown;
  /** Subscribe before mount and before every subsequent occurrence can deliver. */
  subscribeFieldNode(
    root: TestFieldNode,
    listener: (event: unknown) => void,
  ): () => void;
  /** Existing memo producer used only by the explicit pre-requested memo scene. */
  getItemEntries(template: BlueprintNode, index: number): readonly unknown[];
}

/** A complete typed observation record; compile rejection is distinct from a runtime failure. */
export interface SceneResult {
  /** Compiler rejection details, if this authored schema is unsupported. */
  error?: { code: string; schemaPath: unknown; message: string };
  /** Actual compiler phase; operation errors never masquerade as compiler exclusions. */
  phase: 'completed' | 'compile-rejected';
  /** Full before/after history for each of the 27 required observation channels. */
  observation?: Record<string, unknown>;
}

/** Traverse live occurrences in child order, avoiding repeated virtual occurrences. */
function liveNodes(root: TestFieldNode): TestPublicFieldNode[] {
  const found: TestPublicFieldNode[] = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop()!;
    if (found.includes(node as TestPublicFieldNode)) continue;
    found.push(node as TestPublicFieldNode);
    for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
      stack.push(node.children![index]);
  }
  return found;
}

/** Preserve the committed public and private channels without removing per-tree rule stores. */
function stateOf(
  root: TestPublicFieldNode,
  known: readonly TestPublicFieldNode[],
  ruleKey: (key: string) => string,
) {
  const runtime = root.runtime;
  const nodes = liveNodes(root);
  const view = (node: TestPublicFieldNode) => ({
    path: node.path,
    name: node.name,
    key: node.itemKey,
    count: node.itemCount,
    nextKey: node.nextItemKey,
    parent: node.parent,
    root: node.rootNode,
    raw: node.raw,
    extras: node.undeclaredValues,
    local: node.local,
    emit: node.emit,
    value: node.value,
    output: node.outputValue,
    defaultValue: node.defaultValue,
    children: node.children,
    structure: node.structure,
    schema: node.schema.schema,
    active: node.active,
    visible: node.visible,
    readOnly: node.readOnly,
    disabled: node.disabled,
    required: node.required,
    state: node.interactionState,
    revisions: { ...node.revisionLedger },
    delivery: node.pendingDelivery,
    detached: node.detached,
    errors: node.errors,
    misfit: node.misfit,
    inactiveValues: node.inactiveValues,
    blueprint: {
      kind: node.blueprintNode.kind,
      strategy: node.blueprintNode.strategy,
      item: node.blueprintNode.item !== undefined,
      prefixItems: node.blueprintNode.prefixItems !== undefined,
      itemCandidates: node.blueprintNode.itemCandidates !== undefined,
      prefixItemCandidates:
        node.blueprintNode.prefixItemCandidates !== undefined,
    },
  });
  return {
    nodes: nodes.map(view),
    retiredNodes: known.filter((node) => !nodes.includes(node)).map(view),
    snapshot: runtime.loadSnapshot,
    commit: runtime.commitNumber,
    diagnostics: runtime.diagnostics,
    globalState: runtime.globalState,
    counts: [...runtime.globalStateCounts],
    deliveryOrder: [...(runtime.deliveries ?? [])].map((node) => node.path),
    latent: [...runtime.latentRaw],
    misfits: [...runtime.misfitPaths],
    declarations: [...(runtime.committedDeclarationIds ?? [])],
    rules: [...(runtime.committedRuleValues ?? [])].map(([key, value]) => [
      ruleKey(key),
      value,
    ]),
    ruleSources: [...(runtime.committedRuleKeysBySource ?? [])].map(
      ([key, values]) => [key, new Set([...values].map(ruleKey))],
    ),
    ruleTargets: [...(runtime.committedRuleKeysByTarget ?? [])].map(
      ([key, values]) => [key, new Set([...values].map(ruleKey))],
    ),
    inactive: [...(runtime.inactiveValueEntries ?? [])],
    inactiveMemo: [...runtime.inactiveValuesMemo],
    misfitsMemo: [...(runtime.misfitsMemo ?? [])],
    warnings: [...(runtime.warningKeys ?? [])],
    warningRecords: [...(runtime.pendingWarningRecords ?? [])],
  };
}

/** Apply a named public action; return values and errors are retained by the caller. */
function applyStep(
  engine: ItemlessEngine,
  root: TestPublicFieldNode,
  scene: ItemlessScene,
  step: string,
): unknown {
  if (step === 'flag-off' || step === 'flag-on')
    return engine.dispatchSetValue(
      root.find('/flag') as unknown as TestFieldNode,
      step === 'flag-on',
      1,
    );
  if (step === 'tag-a' || step === 'tag-b')
    return engine.dispatchSetValue(
      root.find('/tag') as unknown as TestFieldNode,
      step === 'tag-a' ? 'a' : 'b',
      1,
    );
  if (step === 'source-write')
    return engine.dispatchSetValue(
      root.find('/source') as unknown as TestFieldNode,
      9,
      1,
    );
  const host = (
    scene.path ? root.find(scene.path) : root
  ) as TestPublicFieldNode;
  if (!host) throw new Error('Missing live action host: ' + scene.path);
  switch (step) {
    case 'push':
      return engine.dispatchPush(host, 3);
    case 'insert-start':
      return engine.dispatchInsert(host, 0, 3);
    case 'insert-middle':
      return engine.dispatchInsert(host, 1, 3);
    case 'insert-end':
      return engine.dispatchInsert(host, host.itemCount, 3);
    case 'remove':
      return engine.dispatchRemove(host, 0);
    case 'pop':
      return engine.dispatchPop(host);
    case 'clear':
      return engine.dispatchClear(host);
    case 'update':
      return engine.dispatchUpdate(host, 0, 7);
    case 'out-of-range':
      return [
        engine.dispatchUpdate(host, -1, 7),
        engine.dispatchRemove(host, 999),
        engine.dispatchInsert(host, 999, 7),
      ];
    case 'overwrite':
      return engine.dispatchSetValue(host, [4, undefined, 6], 1);
    case 'merge':
      return engine.dispatchSetValue(host, [8], 2);
    case 'same-value-write':
      return engine.dispatchSetValue(host, host.value, 1);
    case 'union-string':
      return engine.dispatchSetValue(host, 'branch-exit', 1);
    case 'batch-mixed':
      return engine.dispatchBatch(root, () => {
        engine.dispatchSetValue(host, [5, 6], 1);
        engine.dispatchPush(host, 7);
        engine.dispatchUpdate(host, 0, 8);
      });
    default:
      throw new Error('Unknown public action: ' + step);
  }
}

/**
 * Observe an independently compiled form from before mount through all named operations.
 * @param engine - Actual source or unchanged copied dist callable surface
 * @param scene - Fresh authored schema, caller input and operation history
 * @param validator - Real guard/validation factory with the same behavior in both engines
 * @returns Typed full-channel history, or an explicit compiler rejection
 */
export function runItemlessScene(
  engine: ItemlessEngine,
  scene: ItemlessScene,
  validator: unknown,
): SceneResult {
  const codec = new ObservationCodec();
  const known: TestPublicFieldNode[] = [];
  const listenerHistory: unknown[] = [];
  const onChangeHistory: unknown[] = [];
  const firstListenerCommitSnapshots: unknown[] = [];
  const callerOwnershipChecks: unknown[] = [];
  const callerMutationIsolationChecks: unknown[] = [];
  const operationResults: unknown[] = [];
  const histories: Record<string, unknown>[] = [];
  const referenceMatrix: unknown[] = [];
  let root: TestPublicFieldNode;
  const callerBefore = codec.encode(scene.input);
  const props: Record<string, unknown> = {
    jsonSchema: scene.schema,
    validator,
    validationMode: 0,
    errorReporter: { hasConsumer: () => true, report: () => undefined },
    onChange: (value: unknown) => onChangeHistory.push(codec.encode(value)),
  };
  if (!['schema', 'none', 'undefined'].includes(scene.load ?? ''))
    props.defaultValue = scene.input;
  if (scene.load === 'undefined') props.defaultValue = undefined;
  if (scene.load === 'disable' || scene.load === 'enable')
    props.disableAutomaticWrites = scene.load === 'disable';
  try {
    root = engine.buildFieldNodeTree(props);
  } catch (error) {
    const record = error as {
      code?: unknown;
      details?: { schemaPath?: unknown };
      schemaPath?: unknown;
      message?: unknown;
    };
    if (!record.code) throw error;
    return {
      phase: 'compile-rejected',
      error: {
        code: String(record.code),
        schemaPath: record.schemaPath ?? record.details?.schemaPath ?? null,
        message: String(record.message),
      },
    };
  }
  const ruleTargets = new Map<number, number>();
  const localRuleTargets = new Map<number, number>();
  const ruleKey = (key: string): string => {
    const parts: unknown = JSON.parse(key);
    if (
      !Array.isArray(parts) ||
      parts.length !== 8 ||
      typeof parts[7] !== 'number'
    )
      return key;
    let local = ruleTargets.get(parts[7]);
    if (local === undefined) {
      const target = [...known]
        .reverse()
        .find(
          (node) =>
            node.path === parts[5] &&
            node.blueprintNode.kind === String(parts[6]).split(':')[0] &&
            !node.detached,
        );
      if (!target) throw new Error('Missing rule target occurrence: ' + key);
      local = codec.nodes.get(target)!;
      const previous = localRuleTargets.get(local);
      if (previous !== undefined && previous !== parts[7])
        throw new Error(
          'Rule target identity changed for a retained occurrence: ' + key,
        );
      localRuleTargets.set(local, parts[7]);
      ruleTargets.set(parts[7], local);
    }
    return JSON.stringify([...parts.slice(0, 7), ['occurrence', local]]);
  };
  const capture = () =>
    Object.fromEntries(
      Object.entries(stateOf(root, known, ruleKey)).map(([key, value]) => [
        key,
        codec.encode(value),
      ]),
    );
  const register = (node: TestFieldNode) => {
    const publicNode = node as TestPublicFieldNode;
    if (known.includes(publicNode)) return;
    known.push(publicNode);
    codec.nodes.set(node, known.length);
    engine.subscribeFieldNode(node, (event) => {
      if (
        !listenerHistory.some(
          (entry) =>
            (entry as { commit: number }).commit === root.runtime.commitNumber,
        )
      )
        firstListenerCommitSnapshots.push(capture());
      listenerHistory.push({
        node: known.indexOf(publicNode) + 1,
        path: node.path,
        commit: root.runtime.commitNumber,
        event: codec.encode(event),
      });
    });
  };
  register(root);
  const factory = root.runtime.nodeFactory;
  root.runtime.nodeFactory = (entry, parent, runtime) => {
    const node = factory(entry, parent, runtime);
    register(node);
    return node;
  };
  if (scene.id === 'pre-requested-empty-memo') {
    const before = engine.getItemEntries(root.blueprintNode, 0);
    referenceMatrix.push({ preRequested: codec.id(before) });
  }
  const retain = () =>
    known
      .flatMap((node) => [
        node.children,
        node.undeclaredValues,
        node.local,
        node.emit,
      ])
      .concat([root.runtime.loadSnapshot]);
  const run = (action: () => unknown) => {
    const containers = retain();
    const retainedBefore = containers.map((value) => codec.encode(value));
    const beforeEngineCall = codec.encode(scene.input);
    const result = action();
    const afterEngineCall = codec.encode(scene.input);
    assertObservationEqual(
      beforeEngineCall,
      afterEngineCall,
      scene.id + '/caller',
    );
    const retainedAfter = containers.map((value) => codec.encode(value));
    assertObservationEqual(
      retainedBefore,
      retainedAfter,
      scene.id + '/retained containers',
    );
    callerOwnershipChecks.push({ beforeEngineCall, afterEngineCall });
    operationResults.push(codec.encode(result));
    for (const node of liveNodes(root)) register(node);
    referenceMatrix.push(
      known.map((node) => ({
        node: codec.nodes.get(node),
        parent: node.parent ? codec.nodes.get(node.parent) : null,
        children: codec.id(node.children),
        extras: codec.id(node.undeclaredValues),
        local: codec.id(node.local),
        emit: codec.id(node.emit),
        snapshot: codec.id(root.runtime.loadSnapshot),
      })),
    );
    histories.push(capture());
  };
  run(() => engine.mountFieldNode(root));
  for (const step of scene.steps)
    run(() => applyStep(engine, root, scene, step));
  if (scene.id === 'caller-post-mutation') {
    const containers = retain();
    const retainedBefore = containers.map((value) => codec.encode(value));
    const ownedContainers = containers.filter((value) => value !== scene.input);
    const ownedRetainedBefore = ownedContainers.map((value) =>
      codec.encode(value),
    );
    const input = scene.input as { nested: number[] }[];
    input.push({ nested: [3] });
    const afterOuterMutation = containers.map((value) => codec.encode(value));
    const ownedRetainedAfter = ownedContainers.map((value) =>
      codec.encode(value),
    );
    assertObservationEqual(
      ownedRetainedBefore,
      ownedRetainedAfter,
      scene.id + '/engine-owned outer container isolation',
    );
    callerMutationIsolationChecks.push({
      kind: 'outer-container',
      policy: 'decision-59-pending',
      retainedBefore,
      retainedAfter: afterOuterMutation,
      callerIsSnapshot: root.runtime.loadSnapshot === scene.input,
      ownedRetainedBefore,
      ownedRetainedAfter,
    });
    input[0].nested.push(99);
    const retainedAfter = containers.map((value) => codec.encode(value));
    callerMutationIsolationChecks.push({
      kind: 'external-shared-nested-mutation',
      policy: 'decision-59-pending',
      retainedBefore: afterOuterMutation,
      retainedAfter,
    });
  }
  const final = capture();
  for (const key of Object.keys(final))
    final[key] = histories.map((history) => history[key]);
  return {
    phase: 'completed',
    observation: {
      ...final,
      operationResults,
      firstListenerCommitSnapshots,
      listenerHistory,
      onChangeHistory,
      referenceMatrix,
      callerBefore,
      callerAfter: codec.encode(scene.input),
      callerOwnershipChecks,
      callerMutationIsolationChecks,
    },
  };
}
