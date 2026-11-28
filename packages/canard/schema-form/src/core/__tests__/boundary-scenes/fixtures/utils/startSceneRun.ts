import type { FormErrorRecord } from '@/schema-form/errors';

import { ValidationMode } from '../../../../engine';
import {
  type FieldNode,
  FieldNodeEventType,
  buildFieldNodeTree,
  mountFieldNode,
} from '../../../../surface';
import { createTestValidator } from '../../../fixtures/createTestValidator';
import type { BoundarySceneBase } from '../types';
import { collectFieldNodes } from './collectFieldNodes';
import { describeThrown } from './describeThrown';

/** The mounted form of one scene run and everything its probes read besides the form itself. */
export interface SceneRun {
  /** The mounted root, read by every path probe. */
  root: FieldNode;
  /** References taken right after the load, by name; `null` when the path had no node. */
  heldNodes: Record<string, FieldNode | null>;
  /** Paths whose node received a Refresh since the load or the last `note` step. */
  refreshedPaths: Set<string>;
  /** Values the schema callbacks received after the load. */
  log: unknown[];
  /** Values the `append` updaters received. */
  updaterInputs: unknown[];
  /** `<where> <code or message>` of every thrown error. */
  thrownErrors: string[];
  /** The last thrown error. */
  lastError: unknown;
  /** Every record the form delivered, the mount's included. */
  reports: FormErrorRecord[];
}

/**
 * Build and mount a scene's form, take its held references and start recording Refresh events and callbacks.
 * A mount that throws (a budget error) is recorded as thrown at `load`; the committed form stays readable.
 * @param scene - The schema, load, context and held paths
 * @param load - The load snapshot; a fresh run passes the sources another run ended with
 * @returns The run, ready for steps
 */
export const startSceneRun = (
  scene: Pick<BoundarySceneBase, 'schema' | 'context' | 'hold' | 'validates'>,
  load: unknown,
): SceneRun => {
  let isLoaded = false;
  const log: unknown[] = [];
  const reports: FormErrorRecord[] = [];
  const schema =
    typeof scene.schema === 'function'
      ? scene.schema((value) => {
          if (isLoaded) log.push(value);
        })
      : scene.schema;
  const root = buildFieldNodeTree({
    jsonSchema: schema,
    defaultValue: load,
    validationMode: scene.validates
      ? ValidationMode.OnRequest
      : ValidationMode.None,
    validator: createTestValidator(),
    context: scene.context,
    errorReporter: {
      hasConsumer: () => true,
      report: (record) => reports.push(record),
    },
  });
  const run: SceneRun = {
    root,
    heldNodes: {},
    refreshedPaths: new Set(),
    log,
    updaterInputs: [],
    thrownErrors: [],
    lastError: undefined,
    reports,
  };
  try {
    mountFieldNode(root);
  } catch (error) {
    run.thrownErrors.push(`load ${describeThrown(error)}`);
    run.lastError = error;
  }
  for (const [name, path] of Object.entries(scene.hold ?? {}))
    run.heldNodes[name] = root.find(path);
  for (const node of collectFieldNodes(root))
    node.subscribe((event) => {
      if (event.type & FieldNodeEventType.RequestRefresh)
        run.refreshedPaths.add(node.path);
    });
  isLoaded = true;
  return run;
};
