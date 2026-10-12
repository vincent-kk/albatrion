// Loaded by Storybook CSF through the composite glob in .storybook/main.ts; each named export is one story.
import { pluginFormPlan } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import type { FormHandle, FormTypeRendererProps } from '../../src';

import { FeatureStory } from '../features/components/FeatureStory';
import { expectEventually } from '../features/components/expectEventually';
import { MultipleFileInput, ThrowOnTriggerInput } from './utils/consumerInputs';
import { createCompositeStory } from './utils/createCompositeStory';

export default { title: 'Composite/CX06PluginForm', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

/**
 * Consumer group renderer standing in for a UI plugin's: it marks every field it draws.
 * @param props - Renderer props of one node.
 * @returns The field's Input inside a marked box.
 */
const MarkedGroup = ({ Input, path }: FormTypeRendererProps) => <div data-renderer="consumer-group" data-field={path}><Input /></div>;

/**
 * Read attached file names by path.
 * @param map - The handle's attached files map.
 * @returns Names keyed by path.
 */
const readAttached = (map: ReturnType<FormHandle['getAttachedFilesMap']>) =>
  Object.fromEntries(Array.from(map.entries()).map(([path, files]) => [path, files.map((file) => file.name)]));

/** Shared composite case `composite.cx06-plugin-form` with a consumer renderer, a multi-file input, and a throwing input. */
export const Case: Story = createCompositeStory('composite.cx06-plugin-form', {
  formProps: {
    FormTypeGroupRenderer: MarkedGroup,
    formTypeInputMap: { '/broken': ThrowOnTriggerInput },
    formTypeInputDefinitions: [{ test: { formType: 'composite.files' }, Component: MultipleFileInput }],
  },
  async before({ canvasElement, handle }) {
    const files = pluginFormPlan.fileNames.map((name) => new File(['x'], name, { type: 'application/pdf' }));
    await userEvent.upload(canvasElement.querySelector<HTMLInputElement>('input[id="/attachment"]')!, files);
    await expectEventually(() => ({ marked: Boolean(canvasElement.querySelector('[data-renderer="consumer-group"][data-field="/note"]')), attached: readAttached(handle.getAttachedFilesMap()) }),
      { marked: true, attached: { '/attachment': [...pluginFormPlan.fileNames] } }, 'renderer and attached files before the shared steps');
  },
  async after({ handle }) {
    await expectEventually(() => readAttached(handle.getAttachedFilesMap()), {}, 'the switch away removed the attachment entry');
  },
});
