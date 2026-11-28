import type { SchemaStep } from './parseSchemaLocation';

/**
 * Read the run of non-moving keywords written immediately before one step of a location.
 * The run ends at the nearest instance-moving keyword, the nearest reference or definition,
 * or the start of the location, because a validator may write either the referring side or
 * the target side of a jump.
 * @param steps - Parsed location keywords.
 * @param end - Index of the step whose preceding run is read.
 * @returns The run's compared keywords in location order; empty when the step directly follows a move, a jump or the start.
 */
export const readComparedRun = (
  steps: readonly SchemaStep[],
  end: number,
): readonly SchemaStep[] => {
  const run: SchemaStep[] = [];
  for (let index = end - 1; index >= 0; index--) {
    const step = steps[index];
    if (step.kind === 'move' || step.kind === 'jump') break;
    run.unshift(step);
  }
  return run;
};
