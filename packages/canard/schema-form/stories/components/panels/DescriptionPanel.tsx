import type { FormScenario } from '@aileron/schema-form-scenarios';

import { Breadcrumb } from './utils/Breadcrumb';
import { Icon } from './utils/Icon';
import { RunConfig } from './utils/RunConfig';
import { describeFirstStep } from './utils/describeFirstStep';
import { splitScenarioDescription } from './utils/splitScenarioDescription';
import { toDisplayLabel } from './utils/toDisplayLabel';

/**
 * Introduce a scenario: where it sits, what it checks, how it runs and what to try first.
 * The docs view already prints the story heading and description, so docs keep only the rest.
 * @param props - Optional authored scenario, raw Storybook title, story heading and view mode.
 * @returns A header above the form; authored scenario data stays intact.
 */
export function DescriptionPanel({ scenario, title, heading, docs }: { scenario?: FormScenario; title: string; heading: string; docs: boolean }) {
  const sentences = docs ? [] : splitScenarioDescription(scenario?.description ?? '');
  return <header className="sf-story-header">
    {!docs && <Breadcrumb title={title} />}
    <div className="sf-title-row">
      {!docs && <h2>{toDisplayLabel(heading)}</h2>}
      {scenario && <code className="sf-id" title="Shared scenario name">{scenario.name}</code>}
    </div>
    <RunConfig />
    {sentences.length > 1
      ? <ul className="sf-rules" aria-label="What this story checks">{sentences.map((sentence, index) => <li key={index}>{sentence}</li>)}</ul>
      : sentences.length === 1 && <p className="sf-description">{sentences[0]}</p>}
    <p className="sf-try"><Icon name="play" /><span><strong>Try it:</strong> {describeFirstStep(scenario?.steps ?? [])}</span></p>
  </header>;
}
