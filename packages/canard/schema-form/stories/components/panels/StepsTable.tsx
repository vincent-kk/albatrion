import type { FormScenario } from '@aileron/schema-form-scenarios';

import type { StoryPanelsParameters } from './types';
import { StepRows } from './utils/StepRows';
import { toDisplayJSON } from './toDisplayJSON';

/**
 * Display shared reproduction steps and the separate consumer tail.
 * @param props - Scenario steps, composite metadata and docs-collapse preference.
 * @returns A fieldset whose legend is present even when docs content is collapsed.
 */
export function StepsTable({ scenario, parameters, collapsed }: { scenario?: FormScenario; parameters?: StoryPanelsParameters; collapsed: boolean }) {
  const tables = <><StepRows steps={scenario?.steps ?? []} />{parameters?.tail && <>
    <h4>Consumer tail</h4><p>Tail start: <code>{toDisplayJSON(parameters.tailStart)}</code></p><StepRows steps={parameters.tail} />
  </>}</>;
  return <fieldset><legend>Reproduction steps</legend>{collapsed ? <details><summary>Show reproduction steps</summary>{tables}</details> : tables}</fieldset>;
}
