import type { FormScenario } from '@aileron/schema-form-scenarios';

import type { StoryPanelsParameters } from './types';
import { StepRows } from './utils/StepRows';
import { StepTimeline } from './utils/StepTimeline';
import { toDisplayJSON } from './toDisplayJSON';

/**
 * Explain what the play function does, step by step, and keep the authored records one level down.
 * @param props - Scenario steps, optional composite consumer-tail metadata and the view mode.
 * @returns A disclosure that starts open on the canvas and closed in docs.
 */
export function PlayStepsPanel({ scenario, parameters, docs }: { scenario?: FormScenario; parameters?: StoryPanelsParameters; docs: boolean }) {
  const steps = scenario?.steps ?? [];
  const tail = parameters?.tail;
  return <details className="sf-panel" open={!docs}>
    <summary>Play steps <span className="sf-badge sf-badge-neutral">{steps.length + (tail?.length ?? 0)}</span></summary>
    {steps.length ? <StepTimeline steps={steps} /> : <p className="sf-muted">This scenario has no scripted steps.</p>}
    {tail && <>
      <h4>Consumer tail</h4>
      <p>Starts from <code>{toDisplayJSON(parameters.tailStart, 0)}</code></p>
      <StepTimeline steps={tail} />
    </>}
    <details className="sf-subpanel">
      <summary>Raw step data</summary>
      <StepRows steps={steps} />
      {tail && <><h4>Consumer tail</h4><StepRows steps={tail} /></>}
    </details>
  </details>;
}
