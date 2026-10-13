// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { type RendererCase, playScenario, pluginsFeatureScenarios, rendererCases } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { Form } from '../../../src';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';
import { createMarkedRenderers } from './utils/createMarkedRenderers';
import { toRendererProps } from './utils/toRendererProps';

export default { title: 'Features/Plugins/RendererReplacement', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(pluginsFeatureScenarios, 'plugins.renderer-replacement');
const formRenderers = createMarkedRenderers('form');
const providerRenderers = createMarkedRenderers('provider');

/**
 * Draw /title with the composition API so the label and error renderers are called.
 * @returns The layout for FeatureStory's children function.
 */
const composedLayout = () => <><Form.Label path="/title" /><Form.Input path="/title" /><Form.Error path="/title" /></>;

/**
 * Build a story that places consumer renderers as one case says and checks the markers drawn in the form.
 * @param label - Label of a rendererCases entry.
 * @returns The story object.
 */
const createRendererStory = (label: string): Story => {
  const item: RendererCase = rendererCases.find((entry) => entry.label === label)!;
  const probe = createHandleProbe();
  return {
    args: {
      scenario, onHandle: probe.onHandle, ...(item.composed && { layout: composedLayout }),
      formProps: { showError: true, ...toRendererProps(item.form, formRenderers) },
      ...(item.provider.length > 0 && { providerProps: toRendererProps(item.provider, providerRenderers) }),
    },
    parameters: { docs: { description: { story: `${scenario.description} Case: ${item.label}.` } } },
    async play({ args, canvasElement, step }) {
      if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
      await playScenario(args.scenario, canvasElement);
      await expectEventually(() => {
        const drawn = new Set(Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-renderer]')).map((element) => element.dataset.renderer));
        return {
          markers: item.markers.filter((marker) => drawn.has(marker)),
          absent: item.absent.filter((marker) => canvasElement.querySelector(`[data-renderer="${marker}"]`)),
        };
      }, { markers: [...item.markers], absent: [] }, item.label);
    },
  };
};

/** Case `form label and error`. */
export const FormLabelAndError: Story = createRendererStory('form label and error');

/** Case `provider group`. */
export const ProviderGroup: Story = createRendererStory('provider group');

/** Case `form group over provider group`. */
export const FormGroupOverProvider: Story = createRendererStory('form group over provider group');
