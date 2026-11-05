import type { FormScenario } from '@aileron/schema-form-scenarios';

import type { StoryPanelsParameters } from './types';
import { StepRows } from './utils/StepRows';
import { toDisplayJSON } from './toDisplayJSON';

/**
 * Display shared reproduction steps and the separate consumer tail.
 * @param props - Scenario steps and optional composite consumer-tail metadata.
 * @returns A closed native disclosure in both canvas and docs views.
 */
export function StepsTable({ scenario, parameters }: { scenario?: FormScenario; parameters?: StoryPanelsParameters }) {
  const tables = <><StepRows steps={scenario?.steps ?? []} />{parameters?.tail && <>
    <h4>Consumer tail</h4><p>Tail start: <code>{toDisplayJSON(parameters.tailStart)}</code></p><StepRows steps={parameters.tail} />
  </>}</>;
  return <details className="sf-panel"><summary>Steps</summary><h4>Reproduction steps</h4>{tables}</details>;
}
