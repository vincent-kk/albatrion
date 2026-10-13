// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { valuesFindingScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { findScenario } from '../components/findScenario';

/**
 * 발견(open question): these plays state what the screen would need to show for a gap the ledger does not decide,
 * and fail against the current built-in inputs. The `!test` tag keeps them out of the Vitest run; e2e
 * features-values.test.tsx pins them with it.fails until the owner decides.
 */
export default { title: 'Features/Values/Findings', component: FeatureStory, tags: ['autodocs', '!test'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/** 발견(open question): shared scenario `values.finding-restricted-input-out-of-domain`. */
export const RestrictedInputOutOfDomain: Story = createFeatureStory(findScenario(valuesFindingScenarios, 'values.finding-restricted-input-out-of-domain'));
