// Loaded by Storybook CSF; this export documents the current public handle.
import { useRef, useState } from 'react';

import { packageEntryRenderScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Form, SchemaNodeState, type FormHandle, type JSONSchema } from '../../src';

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
    <button onClick={() => handle.current?.setState({ [SchemaNodeState.ShowError]: true })}>Show errors</button>
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
