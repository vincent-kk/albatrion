import type { Observation } from '../types';
import { readSceneProbe } from './readSceneProbe';
import type { SceneRun } from './startSceneRun';

/**
 * Read several probes of a run at once.
 * @param run - The run to read
 * @param probes - Probe tokens (listed on `BoundarySceneBase`)
 * @param prefix - Prepended to every key: `''` at the end of a run, `<label>: ` at a `note` step
 * @returns The readings keyed by prefixed token; throws on an unknown probe kind
 */
export const readSceneProbes = (
  run: SceneRun,
  probes: readonly string[],
  prefix: string,
): Observation =>
  Object.fromEntries(
    probes.map((token) => [`${prefix}${token}`, readSceneProbe(run, token)]),
  );
