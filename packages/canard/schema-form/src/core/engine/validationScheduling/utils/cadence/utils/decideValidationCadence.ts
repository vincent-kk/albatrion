import { VALIDATION_CADENCE_CAP_MS } from '../../constants';

/** Choose one observation transition without inspecting domain or host state.
 * @param phase - Current observation phase.
 * @param isRequested - Whether a request arrived since the preceding baseline.
 * @param elapsed - Milliseconds since the last started run.
 * @returns The next frame-loop action. */
export const decideValidationCadence = (
  phase: 'watch' | 'carry',
  isRequested: boolean,
  elapsed: number,
): 'idle' | 'carry' | 'run' => {
  if (phase === 'watch' && !isRequested) return 'idle';
  if (
    elapsed >= VALIDATION_CADENCE_CAP_MS ||
    (phase === 'carry' && !isRequested)
  )
    return 'run';
  return 'carry';
};
