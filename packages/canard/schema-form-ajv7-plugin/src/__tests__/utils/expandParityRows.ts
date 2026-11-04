import type {
  ValidatorScenario,
  ValidatorScenarioDraft,
  ValidatorScenarioEntry,
  ValidatorScenarioFeature,
  ValidatorScenarioProfile,
} from '@aileron/schema-form-scenarios/validator';

/** What one plugin offers: its entries with their dialects, and its optional capabilities. */
export interface ParitySupport {
  /** Entries the plugin runs, each with the dialect it validates. */
  readonly entries: readonly { readonly entry: ValidatorScenarioEntry; readonly draft: ValidatorScenarioDraft }[];
  /** Capabilities the plugin declares. */
  readonly features: readonly ValidatorScenarioFeature[];
}

/** One test row: scenario id, entry, profile and guard compile path. */
export type ParityRow = readonly [
  id: string,
  entry: ValidatorScenarioEntry,
  profile: ValidatorScenarioProfile,
  directGuardCompile: boolean,
];

/**
 * Expand shared scenarios into the rows this plugin runs: an entry runs a scenario when
 * the scenario lists the entry and the entry's dialect, and the plugin has every feature.
 * @param scenarios - A bundle of `@aileron/schema-form-scenarios/validator`
 * @param support - The plugin's entries and features
 * @returns Rows in scenario order, one per entry, profile and guard compile path
 */
export const expandParityRows = (
  scenarios: readonly ValidatorScenario[],
  support: ParitySupport,
): ParityRow[] =>
  scenarios.flatMap((scenario) => {
    const { applies } = scenario;
    if (!applies.features.every((feature) => support.features.includes(feature))) return [];
    const paths = applies.directGuardCompile === 'both' ? [true, false] : [applies.directGuardCompile];
    return support.entries
      .filter(({ entry, draft }) => applies.entries.includes(entry) && scenario.drafts.includes(draft))
      .flatMap(({ entry }) => applies.profiles.flatMap((profile) =>
        paths.map((directGuardCompile): ParityRow => [scenario.id, entry, profile, directGuardCompile])));
  });
