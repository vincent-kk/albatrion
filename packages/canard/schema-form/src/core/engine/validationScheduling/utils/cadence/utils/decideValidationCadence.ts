import { VALIDATION_CADENCE_CAP_MS } from '../../constants';

/** Choose one observation transition without inspecting domain or host state.
 * @param phase - Current observation phase.
 * @param requested - Whether a request arrived since the preceding baseline.
 * @param elapsed - Milliseconds since the last started run.
 * @returns The next frame-loop action. */
export const decideValidationCadence = (
  phase: 'watch' | 'carry',
  requested: boolean,
  elapsed: number,
): 'idle' | 'carry' | 'run' => {
  if (phase === 'watch' && !requested) return 'idle';
  if (elapsed >= VALIDATION_CADENCE_CAP_MS || (phase === 'carry' && !requested))
    return 'run';
  return 'carry';
};
