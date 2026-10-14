import type { FormScenario } from '@aileron/schema-form-scenarios';

/**
 * Display the shared scenario's authored name and explanation.
 * @param props - Optional scenario data for parameter-only panel consumers.
 * @returns A fieldset that introduces the form without adding interactive DOM.
 */
export function DescriptionPanel({ scenario }: { scenario?: FormScenario }) {
  return <fieldset><legend>Description</legend><strong>{scenario?.name}</strong><p>{scenario?.description ?? 'No description'}</p></fieldset>;
}
