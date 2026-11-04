import { captureObservation } from '../observationIdentity/capture';
import type {
  ObservationEngine,
  SceneResult,
} from '../observationIdentity/capture';
import type { TestFieldNode, TestPublicFieldNode } from '../testFieldNode';
import type { ItemlessScene } from './scenes';

/** Preserve the original58 wrapper's engine and result interface. */
export type ItemlessEngine = ObservationEngine;
export type { SceneResult } from '../observationIdentity/capture';

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

/** Run the original58 initialization and operations through a graph-local capture session. */
export function runItemlessScene(
  engine: ItemlessEngine,
  scene: ItemlessScene,
  validator: unknown,
): SceneResult {
  return captureObservation(
    engine,
    scene,
    validator,
    (bound, root, input, step) =>
      applyStep(bound, root, input as ItemlessScene, step),
  );
}

/** Bind the original58 wrapper to the readonly reader from its actual execution module. */
export function createStrictItemlessObserver(
  engine: ItemlessEngine,
  readExistingId: (node: object) => number | undefined,
): (scene: ItemlessScene, validator: unknown) => SceneResult {
  if (typeof readExistingId !== 'function')
    throw new Error(
      'Strict observation requires its own existing owner reader',
    );
  return (scene, validator) =>
    captureObservation(
      engine,
      scene,
      validator,
      (bound, root, input, step) =>
        applyStep(bound, root, input as ItemlessScene, step),
      readExistingId,
    );
}
