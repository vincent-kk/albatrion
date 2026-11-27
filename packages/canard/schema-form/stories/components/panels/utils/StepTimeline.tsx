import { isArray } from '@winglet/common-utils/filter';

import type { ScenarioExpectation } from '@aileron/schema-form-scenarios';

import { describeExpectation } from './describeExpectation';
import { describeStep } from './describeStep';

/**
 * Name a record describeStep does not cover: a consumer-tail act or an observation-only step.
 * @param record - Composite tail operations carry `act`; observation-only steps carry only `expect`.
 * @returns `Write /total` style text for an act, otherwise a check-only label.
 */
function toFallbackText(record: Record<string, unknown>): string {
  if (typeof record.act !== 'string') return 'Check the current state without acting';
  const act = record.act.charAt(0).toUpperCase() + record.act.slice(1);
  return typeof record.path === 'string' ? `${act} ${record.path || '(root)'}` : act;
}

/**
 * Read play steps as numbered sentences with the observations each one asserts.
 * @param props - Shared scenario steps or composite consumer-tail steps, in authored order.
 * @returns An ordered list; batch operations nest their own list.
 */
export function StepTimeline({ steps }: { steps: readonly object[] }) {
  return <ol className="sf-timeline">{steps.map((step, index) => {
    const record = step as Record<string, unknown>;
    const observed = describeExpectation(record.expect as ScenarioExpectation | undefined);
    return <li key={index}>
      <p className="sf-step-text">{describeStep(step) ?? toFallbackText(record)}</p>
      {observed.length > 0 && <ul className="sf-chips" aria-label="Asserts">
        {observed.map((label) => <li key={label} className="sf-chip">{label}</li>)}
      </ul>}
      {record.action === 'batch' && isArray(record.steps) && record.steps.length > 0 && <StepTimeline steps={record.steps} />}
    </li>;
  })}</ol>;
}
