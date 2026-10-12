// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { fileAttachStages, inputComponentsFeatureScenarios, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';
import { MultipleFileInput, SingleFileInput } from './utils/FileInput';

export default { title: 'Features/InputComponents/FileAttach', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(inputComponentsFeatureScenarios, 'input-components.file-attach');
const probe = createHandleProbe();
const fileDefinitions = [
  { test: { formType: 'input-components.file' }, Component: SingleFileInput },
  { test: { formType: 'input-components.files' }, Component: MultipleFileInput },
];

/** Shared scenario `input-components.file-attach`, driven through fileAttachStages. */
export const AttachUnmountAndReset: Story = {
  args: { scenario, formProps: { formTypeInputDefinitions: fileDefinitions }, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    for (const [index, stage] of fileAttachStages.entries()) {
      if (stage.act === 'upload') {
        const files = stage.fileNames!.map((name) => new File([name], name, { type: 'image/png' }));
        await userEvent.upload(canvasElement.querySelector<HTMLInputElement>(`input[id="${stage.path}"]`)!, files);
      } else if (stage.act === 'hideGallery') await userEvent.click(canvasElement.querySelector<HTMLInputElement>('input[id="/showGallery"]')!);
      else handle.reset();
      await expectEventually(
        () => Object.fromEntries(Array.from(handle.getAttachedFilesMap(), ([path, files]) => [path, files.map((file) => file.name)])),
        stage.attached,
        `attached files after stage ${index} ${stage.act}`,
      );
    }
  },
};
