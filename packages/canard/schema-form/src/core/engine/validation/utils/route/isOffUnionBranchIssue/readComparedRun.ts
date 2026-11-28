import type { SchemaStep } from './parseSchemaLocation';

/**
 * Read the run of non-moving keywords written immediately before one step of a location.
 * The run ends at the nearest instance-moving keyword or at the start of the location;
 * references and definitions inside it are skipped, because a validator may write either
 * the referring side or the target side of the same jump.
 * @param steps - Parsed location keywords.
 * @param end - Index of the step whose preceding run is read.
 * @returns The run's compared keywords in location order; empty when the step follows a move or the start.
 */
export const readComparedRun = (
  steps: readonly SchemaStep[],
  end: number,
): readonly SchemaStep[] => {
  const run: SchemaStep[] = [];
  for (let index = end - 1; index >= 0; index--) {
    const step = steps[index];
    if (step.kind === 'move') break;
    if (step.kind !== 'jump') run.unshift(step);
  }
  return run;
};
