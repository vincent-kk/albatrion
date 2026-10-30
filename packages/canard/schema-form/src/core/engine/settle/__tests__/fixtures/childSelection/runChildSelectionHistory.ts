import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import type { TestGuardMode } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import type { AuthoredSchema } from '@/schema-form/core/engine/types/jsonSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { buildFieldNodeTree, mountFieldNode } from '@/schema-form/core/surface';
import type { SetValueOption } from '@/schema-form/core/surface';

import type { ChildSelectionRuntimeNode } from './ChildSelectionRuntimeNode';
import { normalizeSelectionObservation } from './normalizeSelectionObservation';

/** Authored mount and input history shared by the HEAD and candidate runtimes. */
export interface ChildSelectionHistory {
  /** Diagnostic label included in differential failures. */
  label: string;
  /** Fresh authored input passed through the public construction boundary. */
  schema: AuthoredSchema;
  /** Root input used for the first mounted settlement. */
  input?: unknown;
  /** Sequential public writes; an empty path replaces the root. */
  writes: readonly {
    path: string;
    value: unknown;
    option?: SetValueOption;
    context?: Record<string, unknown>;
    reset?: 'form' | 'subtree';
  }[];
  /** Optional initial context for histories containing context-dependent gates. */
  context?: Record<string, unknown>;
  /** Attach listeners to every occurrence, including ones created during a write. */
  allListeners?: boolean;
  /** Select a real or deliberately failing if validator; omission keeps it absent. */
  guardMode?: TestGuardMode;
  /** Public form option used to compare automatic fills on and off. */
  disableAutomaticWrites?: boolean;
}

/**
 * Observe a real mounted form, publications, revisions and synchronous listener payloads.
 * @param fixture - Fixed schema, mount input, public input history and listener mode
 * @param performReset - Load probe's injected reset operations; historical builds need no reset imports
 * @returns Ordered observations after mounting and after every write
 */
export const runChildSelectionHistory = (
  fixture: ChildSelectionHistory,
  performReset?: (
    root: ChildSelectionRuntimeNode,
    target: ChildSelectionRuntimeNode,
    write: ChildSelectionHistory['writes'][number],
  ) => void,
): unknown[] => {
  const results: unknown[] = [];
  const events: unknown[] = [];
  const changes: unknown[] = [];
  const occurrences: ChildSelectionRuntimeNode[] = [];
  let root: ChildSelectionRuntimeNode;
  const subscribe = (node: typeof root): void => {
    node.subscribe((event) =>
      events.push(
        normalizeSelectionObservation({
          path: node.path,
          identity: occurrences.indexOf(node),
          event,
          revisions: node.revisionLedger,
          commit: node.runtime.commitNumber,
          value: node.value,
          emit: node.emit,
        }),
      ),
    );
  };
  const capture = (failure: unknown): void => {
    const nodes: unknown[] = [];
    const pending = [root];
    while (pending.length) {
      const node = pending.pop()!;
      nodes.push({
        path: node.path,
        identity: occurrences.indexOf(node),
        kind: node.blueprintNode.kind,
        names: Object.keys(node.structure ?? {}),
        children: node.children,
        schema: node.schema,
        raw: node.raw,
        undeclaredValues: node.undeclaredValues,
        value: node.value,
        emit: node.emit,
        active: node.active,
        detached: node.detached,
        visible: node.visible,
        readOnly: node.readOnly,
        disabled: node.disabled,
        required: node.required,
        errors: node.errors,
        state: node.interactionState,
        revisions: node.revisionLedger,
        pending: node.pendingDelivery,
        referenceStable:
          node.value === node.value && node.children === node.children,
      });
      const children = node.children ?? [];
      for (let index = children.length - 1; index >= 0; index--)
        if (children[index].parent === node) pending.push(children[index]);
    }
    results.push(
      normalizeSelectionObservation({
        nodes,
        failure,
        diagnostics: root.runtime.diagnostics,
        commit: root.runtime.commitNumber,
        globalState: root.runtime.globalState,
        deliveryOrder: [...(root.runtime.deliveries ?? [])],
        events,
        changes,
      }),
    );
    events.length = 0;
    changes.length = 0;
  };
  try {
    root = buildFieldNodeTree({
      jsonSchema: fixture.schema,
      defaultValue: fixture.input,
      validationMode: ValidationMode.None,
      validator: fixture.guardMode
        ? createTestValidator(fixture.guardMode)
        : undefined,
      disableAutomaticWrites: fixture.disableAutomaticWrites,
      onChange: (value) => changes.push(normalizeSelectionObservation(value)),
    }) as unknown as typeof root;
    // This pinned-HEAD observer inspects latent storage and its original stage records.
    Reflect.set(root.runtime, 'slots', 'off');
  } catch (failure) {
    return [normalizeSelectionObservation({ failure })];
  }
  occurrences.push(root);
  if (fixture.context) root.runtime.context = fixture.context;
  subscribe(root);
  const factory = root.runtime.nodeFactory!;
  root.runtime.nodeFactory = (entry, parent, runtime) => {
    const node = factory(entry, parent, runtime);
    occurrences.push(node);
    if (fixture.allListeners) subscribe(node);
    return node;
  };
  let failure: unknown;
  try {
    mountFieldNode(
      root as unknown as Parameters<typeof mountFieldNode>[0],
      undefined,
      undefined,
      { deferValidation: true },
    );
  } catch (cause) {
    failure = cause;
  }
  capture(failure);
  for (const write of fixture.writes) {
    failure = undefined;
    try {
      if (write.context) root.runtime.context = write.context;
      const target = write.path ? root.find(write.path) : root;
      if (!target) throw new Error(`Missing write target ${write.path}`);
      if (write.reset) {
        if (!performReset) throw new Error('Missing reset observer');
        performReset(root, target, write);
      } else if (write.option !== undefined)
        target.setValue(write.value, write.option);
      else target.setValue(write.value);
    } catch (cause) {
      failure = cause;
    }
    capture(failure);
  }
  for (const node of occurrences) node.runtime.listeners?.delete(node);
  return results;
};
