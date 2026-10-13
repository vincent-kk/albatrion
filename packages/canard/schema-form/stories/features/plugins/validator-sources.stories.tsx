// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { pluginsFeatureScenarios, validatorSourceCases } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';
import { createKeywordFactory } from './utils/createKeywordFactory';

export default { title: 'Features/Plugins/ValidatorSources', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(pluginsFeatureScenarios, 'plugins.validator-sources');
const factoryCase = validatorSourceCases.find((item) => item.source === 'factory')!;
const probe = createHandleProbe();

/** Shared scenario `plugins.validator-sources` with the registered ajv8 plugin. */
export const Plugin: Story = createFeatureStory(scenario);

/** The Form validatorFactory prop precedes the registered plugin; the 'none' cases run in e2e, where no plugin is global. */
export const FactoryOverPlugin: Story = {
  args: { scenario, formProps: { validatorFactory: createKeywordFactory(factoryCase.factoryKeyword!) }, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ canvasElement }) {
    const handle = await probe.handle(canvasElement);
    await handle.validate();
    await expectEventually(() => handle.findNode('/name')!.errors.map((issue) => issue.keyword), [...factoryCase.keywords], factoryCase.label);
  },
};
