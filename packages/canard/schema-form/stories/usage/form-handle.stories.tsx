// Loaded by Storybook CSF; each named export documents the current public handle.
import { useRef, useState } from 'react';

import { inputComponentsFeatureScenarios, packageEntryRenderScenario, submitOutcomes, validationStateFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Form, FieldNodeState, type FormHandle, type JSONSchema } from '../../src';

import { shouldSkipUnfocusedPlay } from '../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../components/play/skipPlay';
import { unfocusedPlayReason } from '../components/play/unfocusedPlayReason';
import { findScenario } from '../features/components/findScenario';
import { HandleWorkbench } from './components/HandleWorkbench';
import { readHandleCall } from './components/readHandleCall';

/**
 * Demonstrate live node lookup, value and state writes, reset, and validation.
 * @returns A shared-data form and buttons that use the current ref handle.
 */
function HandleExample() {
  const handle = useRef<FormHandle>(null);
  const [snapshot, setSnapshot] = useState<unknown>();
  return <>
    <Form ref={handle} jsonSchema={packageEntryRenderScenario.schema as JSONSchema} defaultValue={packageEntryRenderScenario.initialValue} />
    <button onClick={() => setSnapshot(handle.current?.getValue())}>Read output</button>
    <button onClick={() => handle.current?.findNode('/title')?.setValue('Changed by handle')}>Write title</button>
    <button onClick={() => handle.current?.setState({ [FieldNodeState.ErrorVisible]: true })}>Show errors</button>
    <button onClick={() => handle.current?.clearState()}>Clear interaction state</button>
    <button onClick={() => handle.current?.reset()}>Reset from props</button>
    <button onClick={() => handle.current?.focus('/title')}>Focus title</button>
    <button onClick={() => { void handle.current?.validate().then(setSnapshot); }}>Validate</button>
    <output>{JSON.stringify(snapshot)}</output>
  </>;
}

export default { title: 'Usage/Form handle', component: HandleExample } satisfies Meta<typeof HandleExample>;
/** Documentation only; interaction assertions belong to shared scenarios. */
export const Handle: StoryObj<typeof HandleExample> = {};

/** CSF story shape preserving the existing Usage/Form handle meta and Handle export. */
type Story = StoryObj;
/** Shared invalid form used for validation and submission readouts. */
const invalidScenario = findScenario(validationStateFeatureScenarios, 'validation-state.submit-rejected');
/** Shared single/multiple attachment form; native inputs remain consumer wiring. */
const filesScenario = findScenario(inputComponentsFeatureScenarios, 'input-components.file-attach');

/** Read the public root's identity and current value into the Call log. */
export const RootNode: Story = {
  render: () => <HandleWorkbench scenario={packageEntryRenderScenario} example="RootNode" />,
  parameters: { docs: { description: { story: 'Click Read root node to record its root path, type and current value.' } } },
  async play({ canvasElement }) {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Read root node' }));
    await expect((await readHandleCall(canvasElement, 'node')).result).toEqual({ path: '', type: 'object', value: packageEntryRenderScenario.initialValue });
  },
};

/** Read one exact pointer and the ordered immediate-child wildcard results. */
export const FindNodes: Story = {
  render: () => <HandleWorkbench scenario={packageEntryRenderScenario} example="FindNodes" />,
  parameters: { docs: { description: { story: 'Click Find title node, then Find child nodes. findNode uses /title; findNodes uses /* for immediate children. The node pointer syntax accepts path segments and a wildcard, not a list of independent pointers.' } } },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Find title node' }));
    await expect((await readHandleCall(canvasElement, 'findNode')).result).toEqual({ path: '/title' });
    await userEvent.click(canvas.getByRole('button', { name: 'Find child nodes' }));
    await expect((await readHandleCall(canvasElement, 'findNodes')).result).toEqual(['/title', '/count', '/enabled']);
  },
};

/** Record whole-value writes, updater writes and subsequent reads. */
export const ReadAndWriteValue: Story = {
  render: () => <HandleWorkbench scenario={packageEntryRenderScenario} example="ReadAndWriteValue" />,
  parameters: { docs: { description: { story: 'Click Write value and Read value, then Update value and Read value. The log captures both direct and updater writes and the value returned by getValue after each.' } } },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Write value' }));
    await readHandleCall(canvasElement, 'setValue');
    await userEvent.click(canvas.getByRole('button', { name: 'Read value' }));
    await expect((await readHandleCall(canvasElement, 'getValue')).result).toEqual({ title: 'Written', count: 2, enabled: true });
    await userEvent.click(canvas.getByRole('button', { name: 'Update value' }));
    await readHandleCall(canvasElement, 'setValue', 1);
    await userEvent.click(canvas.getByRole('button', { name: 'Read value' }));
    await expect((await readHandleCall(canvasElement, 'getValue', 1)).result).toEqual({ title: 'Updated', count: 2, enabled: true });
  },
};

/** Record public Dirty, Touched and ErrorVisible (show-error) state flags. */
export const InteractionState: Story = {
  render: () => <HandleWorkbench scenario={packageEntryRenderScenario} example="InteractionState" />,
  parameters: { docs: { description: { story: 'Click Set interaction flags and Read state to see Dirty, Touched and the ShowError flag (public name ErrorVisible). Click Clear state and Read state to see an empty state bag.' } } },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Set interaction flags' }));
    await readHandleCall(canvasElement, 'setState');
    await userEvent.click(canvas.getByRole('button', { name: 'Read state' }));
    await expect((await readHandleCall(canvasElement, 'getState')).result).toEqual({ [FieldNodeState.Dirty]: true, [FieldNodeState.Touched]: true, [FieldNodeState.ErrorVisible]: true });
    await userEvent.click(canvas.getByRole('button', { name: 'Clear state' }));
    await expect((await readHandleCall(canvasElement, 'clearState')).result).toEqual({});
    await userEvent.click(canvas.getByRole('button', { name: 'Read state' }));
    await expect((await readHandleCall(canvasElement, 'getState', 1)).result).toEqual({});
  },
};

/** Record validation issues and error-visibility snapshots in the workbench's Call log. */
export const Errors: Story = {
  render: () => <HandleWorkbench scenario={invalidScenario} example="Errors" />,
  parameters: { docs: { description: { story: 'Click Validate and Read errors to record the invalid email issue. Show errors records visible messages in the Call log; Restore error prop records the hidden result. showError(false) returns to the Form showError prop (false here), rather than forcing every configuration to hide errors.' } } },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Validate' }));
    const validation = await readHandleCall(canvasElement, 'validate');
    await expect(validation.kind).toBe('async');
    await expect(validation.result).toEqual(expect.arrayContaining([expect.objectContaining({ dataPath: '/email', keyword: 'minLength' })]));
    await userEvent.click(canvas.getByRole('button', { name: 'Read errors' }));
    await expect((await readHandleCall(canvasElement, 'getErrors')).result).toEqual(validation.result);
    await userEvent.click(canvas.getByRole('button', { name: 'Show errors' }));
    const message = validation.result[0].message as string;
    await expect((await readHandleCall(canvasElement, 'showError')).result).toEqual({ visible: true, messages: [message] });
    await userEvent.click(canvas.getByRole('button', { name: 'Restore error prop' }));
    await expect((await readHandleCall(canvasElement, 'showError', 1)).result).toEqual({ visible: false, messages: [] });
  },
};

/** Record focus identity and selection range for the workbench title input. */
export const FocusAndSelect: Story = {
  render: () => <HandleWorkbench scenario={packageEntryRenderScenario} example="FocusAndSelect" />,
  parameters: { docs: { description: { story: 'Click Focus title and Select title to record document.activeElement and selection offsets. Run the play in a focused canvas; an unfocused docs preview records the standard skip step.' } } },
  async play({ canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Focus title' }));
    await expect((await readHandleCall(canvasElement, 'focus')).result).toEqual({ activeElement: '/title' });
    await userEvent.click(canvas.getByRole('button', { name: 'Select title' }));
    await expect((await readHandleCall(canvasElement, 'select')).result).toEqual({ activeElement: '/title', selectionStart: 0, selectionEnd: packageEntryRenderScenario.initialValue.title.length });
  },
};

/** Record refresh preservation and the consumer-observed remount identity change. */
export const RefreshAndRemount: Story = {
  render: () => <HandleWorkbench scenario={packageEntryRenderScenario} example="RefreshAndRemount" />,
  parameters: { docs: { description: { story: 'Click Refresh title to record the preserved value; this is a weak check and does not prove a render occurred. Click Remount title to record whether its native input DOM object was replaced.' } } },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Refresh title' }));
    await expect((await readHandleCall(canvasElement, 'refresh')).result).toEqual(packageEntryRenderScenario.initialValue);
    await userEvent.click(canvas.getByRole('button', { name: 'Remount title' }));
    await expect((await readHandleCall(canvasElement, 'remount')).result).toEqual({ replaced: true, value: packageEntryRenderScenario.initialValue });
  },
};

/** Record both reset overloads after writing a different value. */
export const Reset: Story = {
  render: () => <HandleWorkbench scenario={packageEntryRenderScenario} example="Reset" />,
  parameters: { docs: { description: { story: 'Click Change value and Reset defaults to record the loaded defaults. Repeat Change value and Reset without automatic writes to call reset(DisableAutomaticWrites); this scenario has no automatic derivations, so both readouts show the same defaults.' } } },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Change value' }));
    await readHandleCall(canvasElement, 'setValue');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset defaults' }));
    await expect((await readHandleCall(canvasElement, 'reset')).result).toEqual(packageEntryRenderScenario.initialValue);
    await userEvent.click(canvas.getByRole('button', { name: 'Change value' }));
    await readHandleCall(canvasElement, 'setValue', 1);
    await userEvent.click(canvas.getByRole('button', { name: 'Reset without automatic writes' }));
    await expect((await readHandleCall(canvasElement, 'reset', 1)).result).toEqual(packageEntryRenderScenario.initialValue);
  },
};

/** Record rejected submit and the consumer callback from a subsequent valid submit. */
export const Submit: Story = {
  render: () => <HandleWorkbench scenario={invalidScenario} example="Submit" />,
  parameters: { docs: { description: { story: 'Click Submit invalid value: submitForm rejects with ValidationError, recorded as throw in the Call log. Click Write valid value and Submit valid value to see the onSubmit callback record and async completion.' } } },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Submit invalid value' }));
    const failed = await readHandleCall(canvasElement, 'submit');
    await expect(failed.kind).toBe('throw');
    await expect(failed.result.code).toBe(submitOutcomes.rejectionCode);
    await expect(within(canvas.getByRole('table', { name: 'Call log' })).queryByText('onSubmit', { exact: true })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Write valid value' }));
    await readHandleCall(canvasElement, 'setValue');
    await userEvent.click(canvas.getByRole('button', { name: 'Submit valid value' }));
    await expect((await readHandleCall(canvasElement, 'onSubmit')).result).toEqual({ email: submitOutcomes.validEmail });
    await expect((await readHandleCall(canvasElement, 'submit', 1)).kind).toBe('async');
  },
};

/** Upload native files and record the handle's map size, paths and file names. */
export const AttachedFiles: Story = {
  render: () => <HandleWorkbench scenario={filesScenario} example="AttachedFiles" />,
  parameters: { docs: { description: { story: 'Choose two files in the gallery input, then click Read attached files. The Call log records the Map size, /gallery path and attached file names using the shared file-attach schema.' } } },
  async play({ canvasElement }) {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"][id="/gallery"]')!;
    await userEvent.upload(input, [new File(['a'], 'a.png', { type: 'image/png' }), new File(['b'], 'b.png', { type: 'image/png' })]);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Read attached files' }));
    await expect((await readHandleCall(canvasElement, 'getAttachedFilesMap')).result).toEqual({ size: 1, paths: ['/gallery'], files: { '/gallery': ['a.png', 'b.png'] } });
  },
};
