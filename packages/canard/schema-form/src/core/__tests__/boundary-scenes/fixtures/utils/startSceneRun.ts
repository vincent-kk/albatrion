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
  held: Record<string, FieldNode | null>;
  /** Paths whose node received a Refresh since the load or the last `note` step. */
  refreshed: Set<string>;
  /** Values the schema callbacks received after the load. */
  log: unknown[];
  /** Values the `append` updaters received. */
  updater: unknown[];
  /** `<where> <code or message>` of every thrown error. */
  thrown: string[];
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
    held: {},
    refreshed: new Set(),
    log,
    updater: [],
    thrown: [],
    lastError: undefined,
    reports,
  };
  try {
    mountFieldNode(root);
  } catch (error) {
    run.thrown.push(`load ${describeThrown(error)}`);
    run.lastError = error;
  }
  for (const [name, path] of Object.entries(scene.hold ?? {}))
    run.held[name] = root.find(path);
  for (const node of collectFieldNodes(root))
    node.subscribe((event) => {
      if (event.type & FieldNodeEventType.RequestRefresh)
        run.refreshed.add(node.path);
    });
  isLoaded = true;
  return run;
};
