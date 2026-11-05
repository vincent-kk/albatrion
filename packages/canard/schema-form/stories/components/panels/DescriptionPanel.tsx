import type { FormScenario } from '@aileron/schema-form-scenarios';

import { describeFirstStep } from './utils/describeFirstStep';
import { formatScenarioDescription } from './utils/formatScenarioDescription';

/**
 * Introduce a scenario using display-only prose and its first operation.
 * @param props - Optional authored scenario; its authored data stays intact.
 * @returns A heading, explanation and short instruction above the form.
 */
export function DescriptionPanel({ scenario }: { scenario?: FormScenario }) {
  const description = formatScenarioDescription(
    scenario?.description ?? 'No description',
  );
  return (
    <header className="sf-story-header">
      <h2>{scenario?.name}</h2>
      <p className="sf-description">{description}</p>
      <p className="sf-try">
        <span>Try this</span>
        {describeFirstStep(scenario?.steps ?? [])}
      </p>
    </header>
  );
}
