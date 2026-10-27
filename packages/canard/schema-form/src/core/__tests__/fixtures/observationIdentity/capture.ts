import type { BlueprintNode } from '../../../engine';
import {
  ObservationCodec,
  assertObservationEqual,
} from '../itemlessDeclarations/codec';
import {
  assertRuleIndexes,
  createRuleTargetIdentity,
} from '../itemlessDeclarations/ruleTargetIdentity';
import type { TestFieldNode, TestPublicFieldNode } from '../testFieldNode';

/** Minimal unchanged dispatcher/binding surface shared by source and copied production dist. */
export interface ObservationEngine {
  /** Read the existing producer map in this engine module without allocating IDs. */
  __readExistingRuleOwnerId?: (node: object) => number | undefined;
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

/** Concrete input shared by the two observation wrappers; operations remain wrapper-owned. */
export interface ObservationScene {
  id: string;
  schema: unknown;
  input: unknown;
  steps: readonly string[];
  load?: 'props' | 'schema' | 'none' | 'undefined' | 'disable' | 'enable';
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
    latent: root.inactiveValues,
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
    inactive: root.inactiveValues,
    inactiveMemo: nodes.map((node) => [node.path, node.inactiveValues]),
    misfitsMemo: [...(runtime.misfitsMemo ?? [])],
    warnings: [...(runtime.warningKeys ?? [])],
    warningRecords: [...(runtime.pendingWarningRecords ?? [])],
  };
}

/** Capture current attachment using this session's real known objects and readonly module reader. */
export function captureObservationState(
  root: TestPublicFieldNode,
  known: readonly TestPublicFieldNode[],
  codec: ObservationCodec,
  readExistingId: (node: object) => number | undefined,
): Record<string, unknown> {
  const runtime = root.runtime;
  assertRuleIndexes(
    runtime.committedRuleValues,
    runtime.committedRuleKeysBySource,
    runtime.committedRuleKeysByTarget,
  );
  const normalize = createRuleTargetIdentity(
    () => known,
    readExistingId,
    codec.nodes,
  );
  const current = liveNodes(root);
  const key = (raw: string) => {
    const normalized = normalize(raw);
    const parts = JSON.parse(raw);
    if (parts.length === 8) {
      const owner = known.find((node) => readExistingId(node) === parts[7]);
      if (
        !owner ||
        owner.detached ||
        !current.includes(owner) ||
        owner.runtime !== runtime ||
        owner.rootNode !== root
      )
        throw new Error('Invalid current rule owner attachment: ' + raw);
    }
    return normalized;
  };
  return Object.fromEntries(
    Object.entries(stateOf(root, known, key)).map(([name, value]) => [
      name,
      codec.encode(value),
    ]),
  );
}

/** Share the original capture/history plumbing while keeping legacy characterization separate. */
export function captureObservation(
  engine: ObservationEngine,
  scene: ObservationScene,
  validator: unknown,
  applyStep: (
    engine: ObservationEngine,
    root: TestPublicFieldNode,
    scene: ObservationScene,
    step: string,
  ) => unknown,
  readExistingId?: (node: object) => number | undefined,
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
  const capture = () =>
    captureObservationState(
      root,
      known,
      codec,
      readExistingId ?? engine.__readExistingRuleOwnerId ?? (() => undefined),
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
  const preRequested =
    scene.id === 'pre-requested-empty-memo'
      ? engine.getItemEntries(root.blueprintNode, 0)
      : undefined;
  if (preRequested)
    referenceMatrix.push({ preRequested: codec.id(preRequested) });
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
    if (preRequested) {
      const after = engine.getItemEntries(root.blueprintNode, 0);
      if (after !== preRequested)
        throw new Error('Pre-requested empty memo identity changed');
      referenceMatrix.push({
        preRequested: codec.id(preRequested),
        after: codec.id(after),
        same: true,
      });
    }
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
