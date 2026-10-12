// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { formatErrorCases, playScenario, validationStateFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { FeatureStory } from '../components/FeatureStory';
import { findScenario } from '../components/findScenario';
import { createCatalogFormatError } from './utils/createCatalogFormatError';
import { createHandleProbe } from './utils/createHandleProbe';
import { expectEventually } from './utils/expectEventually';
import { readShownMessage } from './utils/readShownMessage';

export default { title: 'Features/ValidationState/FormatError', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(validationStateFeatureScenarios, 'validation-state.format-error');

/**
 * Build one catalog story: the message drawn under /nickname with that catalog's formatError.
 * @param label - Case label in formatErrorCases.
 * @returns A story that shows every error and checks the drawn text.
 */
const catalogStory = (label: string): Story => {
  const item = formatErrorCases.find((entry) => entry.label === label)!;
  return {
    args: { scenario, formProps: { showError: true, formatError: createCatalogFormatError(item.catalog) } },
    parameters: { docs: { description: { story: `${scenario.description} Catalog: ${JSON.stringify(item.catalog)}.` } } },
    async play({ args, canvasElement }) {
      await playScenario(args.scenario, canvasElement);
      await expectEventually(() => readShownMessage(canvasElement, '/nickname'), item.shown, 'message under /nickname');
    },
  };
};

/** Shared scenario `validation-state.format-error` with a catalog for both keywords. */
export const Translated: Story = catalogStory('Translated');
/** Shared scenario `validation-state.format-error` whose catalog lacks the first keyword. */
export const NullFallsThrough: Story = catalogStory('NullFallsThrough');
/** Shared scenario `validation-state.format-error` whose catalog formats nothing. */
export const AllNull: Story = catalogStory('AllNull');

const defaultProbe = createHandleProbe();

/** Shared scenario `validation-state.format-error` without formatError: the first issue's validator message is drawn. */
export const DefaultMessage: Story = {
  args: { scenario, formProps: { showError: true }, onHandle: defaultProbe.onHandle },
  parameters: { docs: { description: { story: `${scenario.description} No formatError: the default formatter draws the validator message.` } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    const handle = await defaultProbe.handle(canvasElement);
    const first = handle.findNode('/nickname')!.errors![0];
    expect(first.message).toBeTruthy();
    await expectEventually(() => readShownMessage(canvasElement, '/nickname'), first.message, 'validator message under /nickname');
  },
};
