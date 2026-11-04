import { expect, vi } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';

import type { PlainNode } from '../../../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../../../__tests__/fixtures/createTestTree';
import type { BlueprintSchema } from '../../../../blueprint';
import { WriteOption } from '../../../../types/value';
import { engineModes } from '../../../../utils/cache/engineModes';
import { getCommittedDeclarationKey } from '../../../../utils/controls/getCommittedDeclarationKey';
import type { Validator } from '../../../../validation';
import { dispatchMount, subscribeFieldNode } from '../../../../write';
import * as commits from '../../../utils/commit/commitSettlement';
import * as selection from '../../../utils/compute/childSelection/selectChildren';
import * as entries from '../../../utils/compute/childSelection/selectEntryStep';
import * as compute from '../../../utils/compute/computeNode';
import * as assembly from '../../../utils/output/updateOutput';
import { loadFieldNodeAtMount } from '../../loadFieldNodeAtMount';
import * as fixedLoader from '../../utils/staticFirst/loadFixedFirstTree';

/** Differential controls preserve the ordinary evaluator and disable only the new plan. */
interface ObservationOptions {
  /** Remove the mount plan from this runtime's view. */
  general?: boolean;
  /** Omit the validator entirely. */
  missing?: boolean;
  /** Custom synchronous guard behavior, including deliberate failures. */
  validator?: Validator;
  /** Existing automatic-write flags. */
  option?: WriteOption;
  /** Form-level suppression, overridden by the existing call bits. */
  disableAutomaticWrites?: boolean;
  /** Public dispatcher rather than direct settlement. */
  dispatch?: boolean;
  /** Existing validation mode. */
  mode?: number;
  /** Whether structured diagnostics have a consumer. */
  consumer?: boolean;
}

/**
 * Mount a fresh tree and capture observable state plus independent work counters.
 * @param schema - Authored fixture analyzed by the real compiler
 * @param options - Oracle admission and ordinary runtime bindings
 * @returns Root, observations, synchronous delivery log and work evidence
 */
export const observeFixedFirstLoad = (
  schema: BlueprintSchema,
  options: ObservationOptions = {},
) => {
  const calls: unknown[] = [];
  const guardCompiles: string[] = [];
  const delegate = options.validator ?? createTestValidator();
  const validator: Validator = {
    compile: (copy) => delegate.compile(copy),
    compileGuard: (copy, pointer) => {
      guardCompiles.push(pointer);
      const guard = delegate.compileGuard(copy, pointer);
      return (value) => {
        calls.push({ pointer, value: structuredClone(value) });
        return guard(value);
      };
    },
  };
  const { root, visits } = createTestTree(schema, validator);
  if (options.missing) root.runtime.validator = undefined;
  if (options.general)
    root.runtime.blueprint = Object.create(root.runtime.blueprint, {
      fixedFirstLoadPlan: { value: undefined },
    });
  root.runtime.validationMode = options.mode ?? 0;
  root.runtime.disableAutomaticWrites = options.disableAutomaticWrites;
  const reports: unknown[] = [];
  root.runtime.errorReporter = {
    hasConsumer: () => options.consumer ?? true,
    report: (record) =>
      reports.push({ record, commit: root.runtime.commitNumber }),
  };
  const delivered: unknown[] = [];
  const listen = (node: PlainNode) =>
    subscribeFieldNode(node, (event) => {
      const pending = [root];
      while (pending.length) {
        const current = pending.pop()!;
        expect(current.pendingRevision).toBe(0);
        expect(current.deliveryInitialized).toBe(true);
        pending.push(...(current.children ?? []));
      }
      delivered.push({ path: node.path, event, value: root.emit });
    });
  listen(root);
  let allocations = 0;
  const factory = root.runtime.nodeFactory;
  root.runtime.nodeFactory = (entry, parent, runtime) => {
    allocations++;
    const node = factory(entry, parent, runtime);
    listen(node);
    return node;
  };
  const contexts: object[] = [];
  let prepared = false;
  const body = compute.computeNode;
  const computeSpy = vi
    .spyOn(compute, 'computeNode')
    .mockImplementation((node, context) => {
      if (!contexts.includes(context)) contexts.push(context);
      prepared ||= Reflect.get(context, 'fixedFirstLoad') !== undefined;
      body(node, context);
    });
  const loaderSpy = vi.spyOn(fixedLoader, 'loadFixedFirstTree');
  const entrySpy = vi.spyOn(entries, 'selectEntryStep');
  const roundSpy = vi.spyOn(selection, 'selectChildren');
  const assemblySpy = vi.spyOn(assembly, 'updateOutput');
  const commitSpy = vi.spyOn(commits, 'commitSettlement');
  let error: unknown;
  try {
    if (options.dispatch)
      dispatchMount(root, undefined, options.option ?? WriteOption.Overwrite, {
        deferValidation: true,
      });
    else
      loadFieldNodeAtMount(
        root,
        undefined,
        options.option ?? WriteOption.Overwrite,
      );
  } catch (caught) {
    error = caught;
  }
  const loaderCalls = loaderSpy.mock.calls.length;
  expect(loaderCalls).toBe(prepared ? 1 : 0);
  if (root.runtime.blueprint.fixedFirstLoadPlan === undefined)
    expect(loaderCalls).toBe(0);
  const work = {
    allocations,
    rootRounds: roundSpy.mock.calls.filter(([node]) => node === root).length,
    entries: entrySpy.mock.calls.length,
    assemblies: assemblySpy.mock.calls.length,
    commits: commitSpy.mock.calls.length,
  };
  loaderSpy.mockRestore();
  computeSpy.mockRestore();
  entrySpy.mockRestore();
  roundSpy.mockRestore();
  assemblySpy.mockRestore();
  commitSpy.mockRestore();
  const snapshot = (): unknown => {
    const nodes: unknown[] = [];
    const pending = [root];
    while (pending.length) {
      const node = pending.shift()!;
      nodes.push({
        path: node.path,
        kind: node.behavior.type,
        schema: node.schema.schema,
        source: node.source,
        extras: node.extras,
        local: node.local,
        emit: node.emit,
        required: node.isRequired,
        active: node.isActive,
        visible: node.isVisible,
        readOnly: node.isReadOnly,
        disabled: node.isDisabled,
        state: node.interactionState,
        ids: root.runtime.committedDeclarationIds?.get(
          getCommittedDeclarationKey(node, node.runtime),
        ),
        revisions: { ...node.revisionLedger },
        delivery: node.pendingDelivery,
        initialized: node.deliveryInitialized,
        children: node.children?.map((child) => child.path),
      });
      pending.push(...(node.children ?? []));
    }
    return {
      nodes,
      commit: root.runtime.commitNumber,
      diagnostics: root.runtime.diagnostics,
      trace: root.runtime.settlementTrace,
      globalState: root.runtime.globalState,
      warnings: [...(root.runtime.pendingWarningRecords ?? [])],
      errors: [...(root.runtime.combinedErrors ?? [])],
      order: [...(root.runtime.deliveries ?? [])].map((node) => node.path),
      calls: [...calls],
      guardCompiles: [...guardCompiles],
      reports: [...reports],
      delivered: [...delivered],
      error,
    };
  };
  return {
    root,
    snapshot,
    calls,
    reports,
    delivered,
    error,
    work,
    prepared,
    loaderCalls,
    contexts,
    visits,
  };
};

/** Mirror mount admission: verifier modes require the ordinary evaluator. */
export const isFixedFirstLoadAdmissible = (): boolean =>
  engineModes.gateSelection !== 'verify' &&
  engineModes.gateWheel !== 'shadow' &&
  !engineModes.deriveShadow;

/** Assert route evidence while retaining compiler eligibility in verifier projects. */
export const expectFixedFirstLoadRoute = (
  actual: ReturnType<typeof observeFixedFirstLoad>,
): void => {
  const admitted = isFixedFirstLoadAdmissible();
  const reason =
    'Verifier modes use the general fallback until prepared-mode equivalence is covered';
  expect(actual.root.runtime.blueprint.fixedFirstLoadPlan).toBeDefined();
  expect(actual.prepared, reason).toBe(admitted);
  expect(actual.loaderCalls, reason).toBe(admitted ? 1 : 0);
  if (!admitted) {
    expect(actual.contexts.length, reason).toBeGreaterThan(0);
    expect(actual.work.entries, reason).toBeGreaterThan(0);
  }
};
