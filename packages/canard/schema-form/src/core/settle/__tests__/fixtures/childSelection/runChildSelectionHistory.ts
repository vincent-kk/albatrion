import type { JSONSchema } from '../../../../types/jsonSchema';
import { buildSchemaNodeTree, mountSchemaNode } from '../../../../SchemaNode';
import { ValidationMode } from '../../../../types/state';
import type { ChildSelectionRuntimeNode } from './ChildSelectionRuntimeNode';
import { normalizeSelectionObservation } from './normalizeSelectionObservation';
import { createTestValidator } from '../../../../__tests__/fixtures/createTestValidator';
import type { TestGuardMode } from '../../../../__tests__/fixtures/createTestValidator';

/** Authored mount and input history shared by the HEAD and candidate runtimes. */
export interface ChildSelectionHistory {
  /** Diagnostic label included in differential failures. */
  label: string;
  /** Fresh authored input passed through the public construction boundary. */
  schema: JSONSchema;
  /** Root input used for the first mounted settlement. */
  input?: unknown;
  /** Sequential public writes; an empty path replaces the root. */
  writes: readonly { path: string; value: unknown }[];
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
 * @returns Ordered observations after mounting and after every write
 */
export const runChildSelectionHistory = (fixture: ChildSelectionHistory): unknown[] => {
  const results: unknown[] = [];
  const events: unknown[] = [];
  const changes: unknown[] = [];
  const occurrences: ChildSelectionRuntimeNode[] = [];
  let root: ChildSelectionRuntimeNode;
  const subscribe = (node: typeof root): void => {
    node.subscribe(event => events.push(normalizeSelectionObservation({ path: node.path,
      identity: occurrences.indexOf(node),
      event, revisions: node.revisionLedger, commit: node.runtime.commitNumber,
      value: node.value, emit: node.emit })));
  };
  const capture = (failure: unknown): void => {
    const nodes: unknown[] = [];
    const pending = [root];
    while (pending.length) {
      const node = pending.pop()!;
      nodes.push({ path: node.path, identity: occurrences.indexOf(node), kind: node.blueprintNode.kind,
        names: Object.keys(node.structure ?? {}), children: node.children,
        schema: node.schema, raw: node.raw, extras: node.extras, value: node.value,
        emit: node.emit, active: node.active, detached: node.detached,
        visible: node.visible, readOnly: node.readOnly, disabled: node.disabled,
        required: node.required, errors: node.errors, state: node.interactionState,
        revisions: node.revisionLedger, pending: node.pendingDelivery,
        referenceStable: node.value === node.value && node.children === node.children });
      const children = node.children ?? [];
      for (let index = children.length - 1; index >= 0; index--)
        if (children[index].parent === node) pending.push(children[index]);
    }
    results.push(normalizeSelectionObservation({ nodes, failure,
      diagnostics: root.runtime.diagnostics, commit: root.runtime.commitNumber,
      globalState: root.runtime.globalState, latent: root.runtime.latentRaw,
      deliveryOrder: [...root.runtime.deliveries ?? []], events, changes }));
    events.length = 0; changes.length = 0;
  };
  try {
    root = buildSchemaNodeTree({ jsonSchema: fixture.schema,
      defaultValue: fixture.input, validationMode: ValidationMode.None,
      validator: fixture.guardMode ? createTestValidator(fixture.guardMode) : undefined,
      disableAutomaticWrites: fixture.disableAutomaticWrites,
      onChange: value => changes.push(normalizeSelectionObservation(value)) }) as unknown as typeof root;
  } catch (failure) { return [normalizeSelectionObservation({ failure })]; }
  occurrences.push(root);
  subscribe(root);
  const factory = root.runtime.nodeFactory!;
  root.runtime.nodeFactory = (entry, parent, runtime) => {
    const node = factory(entry, parent, runtime);
    occurrences.push(node);
    if (fixture.allListeners) subscribe(node);
    return node;
  };
  let failure: unknown;
  try { mountSchemaNode(root as unknown as Parameters<typeof mountSchemaNode>[0],
    undefined, undefined, { deferValidation: true }); }
  catch (cause) { failure = cause; }
  capture(failure);
  for (const write of fixture.writes) {
    failure = undefined;
    try {
      const target = write.path ? root.find(write.path) : root;
      if (!target) throw new Error(`Missing write target ${write.path}`);
      target.setValue(write.value);
    } catch (cause) { failure = cause; }
    capture(failure);
  }
  for (const node of occurrences) node.runtime.listeners?.delete(node);
  return results;
};
