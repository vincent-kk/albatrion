import type {
  BoundarySceneBase,
  ModeObservations,
  Observation,
  SceneMode,
} from '../types';
import { readRawSources } from './readRawSources';
import { readSceneProbes } from './readSceneProbes';
import { runSceneSteps } from './runSceneSteps';
import { startSceneRun } from './startSceneRun';

/** Probe kinds a fresh load can answer: they read the form, not what the steps delivered. */
const PATH_PROBES = ['value', 'types', 'source', 'inactive', 'find'];

/**
 * Run a scene in every mode it lists and read its probes.
 * @param scene - The scene; `fresh` loads the sources the `sequential` run ends with and reads only path probes
 * @returns The readings of each listed mode; rejects when a batch scene asks for validation inside the batch
 */
export const observeBoundaryScene = async (
  scene: BoundarySceneBase,
): Promise<ModeObservations> => {
  const observed: Partial<Record<SceneMode, Observation>> = {};
  const sequential = await runSceneSteps(scene, false);
  if (scene.modes.includes('sequential'))
    observed.sequential = sequential.observation;
  if (scene.modes.includes('batch'))
    observed.batch = (await runSceneSteps(scene, true)).observation;
  if (scene.modes.includes('fresh')) {
    const fresh = startSceneRun(scene, readRawSources(sequential.run.root));
    observed.fresh = readSceneProbes(
      fresh,
      scene.probes.filter(isPathProbe),
      '',
    );
  }
  return observed;
};

/** Whether a probe reads the form itself, so a fresh load can answer it. */
const isPathProbe = (token: string) =>
  PATH_PROBES.includes(token.split(' ')[0]) || token.startsWith('schema.');
