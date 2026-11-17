import { isArray } from '@winglet/common-utils/filter';

import type { ScenarioExpectation } from '@aileron/schema-form-scenarios';

/** Display noun of each observation, in the order the timeline lists them. */
const EXPECTATION_LABELS: Readonly<Record<keyof ScenarioExpectation, string>> = {
  outputValue: 'Output value',
  values: 'Values at',
  states: 'States at',
  shape: 'Field presence at',
  errors: 'Errors at',
  defaultValues: 'Default values at',
  schemaTypes: 'Schema types at',
  extras: 'Array extras at',
  identity: 'Node identity at',
  deliveryOrder: 'Delivery order',
  result: 'Return value',
  onChangeCount: 'onChange ×',
  validationRequestCount: 'Validation requests ×',
  onErrorCodes: 'Error codes',
  diagnostics: 'Diagnostics',
};
/** Observation keys in display order, hoisted so each call reuses one list. */
const EXPECTATION_KEYS = Object.keys(EXPECTATION_LABELS) as readonly (keyof ScenarioExpectation)[];

/**
 * Name the paths of a path-indexed observation, or count them when the list would be long.
 * @param label - Noun ending in "at", such as `Values at`.
 * @param paths - JSON Pointers of the observation; the empty pointer reads as "(root)".
 * @returns `Values at /a, /b` for up to three paths, otherwise `Values at 5 paths`.
 */
function withPaths(label: string, paths: readonly string[]): string {
  if (paths.length > 3) return `${label} ${paths.length} paths`;
  return `${label} ${paths.map((path) => path || '(root)').join(', ')}`;
}

/**
 * Summarize what a scenario step asserts as short chip labels, without values.
 * @param expectation - The step's observation record; undefined when the step asserts nothing.
 * @returns One label per present key in display order, e.g. `Values at /a`, `onChange × 1`,
 * `No error codes` or `Diagnostics: stable`; an empty list when nothing is asserted.
 */
export function describeExpectation(expectation: ScenarioExpectation | undefined): string[] {
  if (!expectation) return [];
  const labels: string[] = [];
  for (const key of EXPECTATION_KEYS) {
    const observed = expectation[key];
    if (observed === undefined && !(key === 'result' && key in expectation)) continue;
    const label = EXPECTATION_LABELS[key];
    if (key === 'onErrorCodes' && isArray(observed))
      labels.push(observed.length ? `${label}: ${observed.join(', ')}` : 'No error codes');
    else if (key === 'diagnostics') labels.push(`${label}: ${(observed as { status: string }).status}`);
    else if (key === 'onChangeCount' || key === 'validationRequestCount') labels.push(`${label} ${observed}`);
    else if (label.endsWith(' at')) labels.push(withPaths(label, Object.keys(observed as object)));
    else labels.push(label);
  }
  return labels;
}
