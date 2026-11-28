import type { BoundarySceneBase, Observation, SceneStep } from '../types';
import { applySceneStep } from './applySceneStep';
import { describeThrown } from './describeThrown';
import { readSceneProbes } from './readSceneProbes';
import { type SceneRun, startSceneRun } from './startSceneRun';

/**
 * Load a scene and apply its steps one after the other, or with the steps from the first write up to a `close` step
 * inside one `batch`, reading the probes at each `note` step and at the end. A step that throws is recorded and the run goes on.
 * @param scene - The scene to run
 * @param isBatch - Whether the steps from the first write up to a `close` step run inside one `batch`
 * @returns The run and its readings; rejects when a batched scene has a `validate` step, which a batch cannot await
 */
export const runSceneSteps = async (
  scene: BoundarySceneBase,
  isBatch: boolean,
): Promise<{ run: SceneRun; observation: Observation }> => {
  const run = startSceneRun(scene, scene.load);
  const observation: Record<string, unknown> = {};
  const take = async (step: SceneStep, index: number) => {
    if ('note' in step) {
      Object.assign(
        observation,
        readSceneProbes(run, scene.probes, `${step.note}: `),
      );
      run.refreshedPaths.clear();
    } else if ('validate' in step) await run.root.validate();
    else if (!('close' in step))
      attempt(run, String(index), () => applySceneStep(run, step));
  };
  const close = scene.steps.findIndex((step) => 'close' in step);
  const batchEnd = close < 0 ? scene.steps.length : close;
  const firstWrite = scene.steps.findIndex((step) => !('note' in step));
  const batched =
    isBatch && firstWrite >= 0 && firstWrite < batchEnd
      ? firstWrite
      : batchEnd;
  for (let index = 0; index < batched; index++)
    await take(scene.steps[index], index);
  if (batched < batchEnd) {
    if (scene.steps.slice(batched, batchEnd).some((step) => 'validate' in step))
      throw new Error(`${scene.id} validates inside a batch`);
    attempt(run, 'batch', () =>
      run.root.batch(() => {
        for (let index = batched; index < batchEnd; index++)
          void take(scene.steps[index], index);
      }),
    );
  }
  for (let index = batchEnd; index < scene.steps.length; index++)
    await take(scene.steps[index], index);
  Object.assign(observation, readSceneProbes(run, scene.probes, ''));
  return { run, observation };
};

/** Run an operation and record what it throws under `where` instead of ending the run. */
const attempt = (run: SceneRun, where: string, operation: () => void) => {
  try {
    operation();
  } catch (error) {
    run.thrownErrors.push(`${where} ${describeThrown(error)}`);
    run.lastError = error;
  }
};
