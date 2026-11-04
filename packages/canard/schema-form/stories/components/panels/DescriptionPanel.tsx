import type { FormScenario } from '@aileron/schema-form-scenarios';

import { describeFirstStep } from './utils/describeFirstStep';

/**
 * Introduce a scenario using display-only prose and its first operation.
 * @param props - Optional authored scenario; its ledger-prefixed data stays intact.
 * @returns A heading, explanation and short instruction above the form.
 */
export function DescriptionPanel({ scenario }: { scenario?: FormScenario }) {
  const description = (scenario?.description ?? 'No description')
    .replace(/^(?:[A-Z][A-Z0-9]*-\d+[A-Z]?(?:[ -]\d+)?\s*)+:\s*/, '');
  return <header className="sf-story-header">
    <h2>{scenario?.name}</h2>
    <p className="sf-description">{description.charAt(0).toUpperCase() + description.slice(1)}</p>
    <p className="sf-try"><span>Try this</span>{describeFirstStep(scenario?.steps ?? [])}</p>
  </header>;
}
