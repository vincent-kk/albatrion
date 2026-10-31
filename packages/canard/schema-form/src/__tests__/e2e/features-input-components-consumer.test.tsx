import { render } from '@testing-library/react';
import { act, type ComponentType } from 'react';

import { isPlainObject } from '@winglet/common-utils/filter';
import { describe, expect, it } from 'vitest';

import {
  type FormScenario,
  type InputWinner,
  type LabeledDefinition,
  childComponentStages,
  fileAttachStages,
  inputComponentsFeatureScenarios,
  inputMapCase,
  inputResolutionCases,
  inputResolutionPluginDefinition,
  mapEntryStages,
  propsFlowAttributes,
  trimStages,
} from '@aileron/schema-form-scenarios';

import {
  type FieldInputDefinition,
  type FieldInputMap,
  type FieldInputProps,
  type JSONSchema,
  Form,
  FormProvider,
  registerPlugin,
  useChildFieldErrors,
} from '@/schema-form';

import { renderForm, setupValidatorPlugin } from '../renderForm';

import { settleValidation } from '../helpers/settleValidation';

/** GOAL-061 touched lands in the animation frame after blur; jsdom runs frames on a timer, so waits cover one. */
const BLUR_FRAME_MS = 50;

// Consumer-only checks for input-components cases; components mirror the story utilities so the two consumers stay independent.

const labelled = new Map<string, ComponentType<FieldInputProps>>();

/**
 * Return one stable text input per label that marks itself with data-winner.
 * @param label - Definition label from the scenario data.
 * @returns The same component for the same label.
 */
const labelledInput = (label: string) => {
  if (!labelled.has(label))
    labelled.set(label, ({ path, value, onChange }: FieldInputProps) => (
      <input id={path} data-winner={label} defaultValue={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} />
    ));
  return labelled.get(label)!;
};

/**
 * Build definitions from labelled data.
 * @param list - Labelled definitions in priority order.
 * @returns Real definitions.
 */
const definitions = (list: readonly LabeledDefinition[]): FieldInputDefinition[] => list.map(({ test, label }) => ({ test, Component: labelledInput(label) }));

/**
 * Build a fieldInputMap from labels.
 * @param map - Keys to labels.
 * @returns Keys to labelled components.
 */
const inputMap = (map: Readonly<Record<string, string>>): FieldInputMap => Object.fromEntries(Object.entries(map).map(([key, label]) => [key, labelledInput(label)]));

/**
 * Read which input rendered at a leaf path.
 * @param container - Render container.
 * @param path - Leaf pointer.
 * @returns The label, "default", or "none".
 */
const winner = (container: Element, path: string): InputWinner => {
  const wrapper = container.querySelector(`[data-path="${path}"]`);
  const marked = wrapper?.querySelector<HTMLElement>('[data-winner]');
  if (marked) return marked.dataset.winner!;
  return wrapper?.querySelector('input, select, textarea') ? 'default' : 'none';
};

/**
 * Find an input-components scenario by name.
 * @param name - Stable scenario name.
 * @returns The scenario; throws when the data was renamed.
 */
const scenarioNamed = (name: string): FormScenario => {
  const scenario = inputComponentsFeatureScenarios.find((item) => item.name === name);
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  return scenario;
};

/**
 * Settle React work and timers in jsdom.
 * @param ms - Timer wait.
 * @returns Completion after the act scope.
 */
const settle = (ms = 0) => act(async () => { await settleValidation(); if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms)); });

registerPlugin({ fieldInputDefinitions: definitions([inputResolutionPluginDefinition]) });

describe('features — input-components consumer-only', () => {
  it.each(inputResolutionCases)('input resolution $label picks the winner at each probe field', async (item) => {
    const base = scenarioNamed('input-components.input-resolution');
    const schema: unknown = structuredClone(base.schema);
    const properties = isPlainObject<Record<string, unknown>>(schema) ? schema.properties : undefined;
    for (const [path, label] of Object.entries(item.inline ?? {})) {
      const property = isPlainObject<Record<string, unknown>>(properties) ? properties[path.slice(1)] : undefined;
      if (!isPlainObject<Record<string, unknown>>(property)) throw new Error(`Inline input needs a top-level property: ${path}`);
      property.presentation = { ...(isPlainObject(property.presentation) ? property.presentation : {}), FieldInput: label === null ? null : labelledInput(label) };
    }
    setupValidatorPlugin();
    const form = <Form<JSONSchema> jsonSchema={schema as JSONSchema} defaultValue={base.initialValue}
      fieldInputMap={item.map && inputMap(item.map)} fieldInputDefinitions={item.form && definitions(item.form)} />;
    const { container, unmount } = render(item.provider ? <FormProvider fieldInputDefinitions={definitions(item.provider)}>{form}</FormProvider> : form);
    try {
      await settle();
      expect(Object.fromEntries(Object.keys(item.winners).map((path) => [path, winner(container, path)]))).toEqual(item.winners);
    } finally {
      unmount();
    }
  });

  it('fieldInputMap matches an exact pointer, an unanchored pattern, and `*` over items and declared children', async () => {
    const scenario = scenarioNamed('input-components.input-map');
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, fieldInputMap: inputMap(inputMapCase.map) });
    try {
      expect(Object.fromEntries(Object.keys(inputMapCase.winners).map((path) => [path, winner(form.container, path)]))).toEqual(inputMapCase.winners);
    } finally {
      form.unmount();
    }
  });

  it('CONTROLS-005 options.trim keeps spaces while typing and trims on blur only', async () => {
    const scenario = scenarioNamed('input-components.trim-on-blur');
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true });
    try {
      for (const [index, stage] of trimStages.entries()) {
        if (stage.act === 'type') await form.user.type(form.field(stage.path)!, stage.text!);
        else await form.user.tab();
        await form.flush(BLUR_FRAME_MS);
        expect(Object.fromEntries(Object.keys(stage.values).map((path) => [path, form.node(path)?.value])), `values after stage ${index}`).toEqual(stage.values);
      }
    } finally {
      form.unmount();
    }
  });

  it('attached files follow the input: one or many by path, removed on unmount, cleared on reset', async () => {
    const scenario = scenarioNamed('input-components.file-attach');
    const fileInput = (multiple: boolean) => ({ path, onChange, onFileAttach }: FieldInputProps) => (
      <input id={path} type="file" multiple={multiple} onChange={(event) => {
        const files = Array.from(event.target.files ?? []);
        onFileAttach(multiple ? files : files[0]);
        onChange(multiple ? files.map((file) => file.name) : files[0]?.name);
      }} />
    );
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, fieldInputDefinitions: [
      { test: { inputType: 'input-components.file' }, Component: fileInput(false) },
      { test: { inputType: 'input-components.files' }, Component: fileInput(true) },
    ] });
    try {
      for (const [index, stage] of fileAttachStages.entries()) {
        if (stage.act === 'upload') await form.user.upload(form.field(stage.path!)!, stage.fileNames!.map((name) => new File([name], name)));
        else if (stage.act === 'hideGallery') await form.user.click(form.field('/showGallery')!);
        else await form.reset();
        await form.flush();
        expect(Object.fromEntries(Array.from(form.attachedFilesMap(), ([path, files]) => [path, files.map((file) => file.name)])), `attached after stage ${index}`).toEqual(stage.attached);
      }
    } finally {
      form.unmount();
    }
  });

  it('CONTROLS-023 presentation props and control states reach the built-in inputs as attributes', async () => {
    const scenario = scenarioNamed('input-components.props-flow');
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true });
    try {
      for (const [path, expected] of Object.entries(propsFlowAttributes)) {
        const input = form.field(path);
        if (!(input instanceof HTMLInputElement)) throw new Error(`No text input at ${path}`);
        const read: Readonly<Record<string, unknown>> = { placeholder: input.placeholder, className: input.className, readOnly: input.readOnly, disabled: input.disabled };
        expect(Object.fromEntries(Object.keys(expected).map((key) => [key, read[key]])), `attributes at ${path}`).toEqual(expected);
      }
    } finally {
      form.unmount();
    }
  });

  it('a card input draws ChildFields and useChildFieldErrors reports showErrors by child state', async () => {
    const scenario = scenarioNamed('input-components.child-components');
    const Card = ({ path, node, ChildFields }: FieldInputProps) => {
      const { showErrors, errorMatrix } = useChildFieldErrors(node);
      return <div id={path} data-card-fields={ChildFields.map((Child) => Child.field).join(',')}
        data-show-errors={JSON.stringify(showErrors)} data-error-counts={JSON.stringify(errorMatrix.map((errors) => errors.length))}>
        {ChildFields.map((Child) => <Child key={Child.field} />)}
      </div>;
    };
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true,
      fieldInputDefinitions: [{ test: { inputType: 'input-components.card' }, Component: Card }] });
    try {
      await form.validate();
      for (const [index, stage] of childComponentStages.entries()) {
        if (stage.act === 'edit') {
          await form.user.type(form.field(stage.path!)!, stage.text!);
          await form.user.tab();
        }
        await form.flush(BLUR_FRAME_MS);
        const card = form.container.querySelector<HTMLElement>('[id="/address"][data-card-fields]')!;
        expect({ fields: card.dataset.cardFields!.split(','), showErrors: JSON.parse(card.dataset.showErrors!), errorCounts: JSON.parse(card.dataset.errorCounts!) },
          `card after stage ${index}`).toEqual({ fields: stage.fields, showErrors: stage.showErrors, errorCounts: stage.errorCounts });
      }
    } finally {
      form.unmount();
    }
  });

  it('SCHEMA-040 an open object stays one node edited as a whole by a terminal input', async () => {
    const scenario = scenarioNamed('input-components.child-components');
    const MapEntry = ({ path, value, onChange }: FieldInputProps) => (
      <input id={path} onBlur={(event) => {
        const [key, ...rest] = event.target.value.split('=');
        if (key && rest.length) onChange({ ...(isPlainObject(value) ? value : {}), [key]: rest.join('=') });
        event.target.value = '';
      }} />
    );
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: { labels: { a: 'A', b: 'B' } }, validator: true,
      fieldInputDefinitions: [{ test: { inputType: 'input-components.map' }, Component: MapEntry }] });
    try {
      for (const [index, stage] of mapEntryStages.entries()) {
        await form.user.type(form.field('/labels')!, stage.entry);
        await form.user.tab();
        await form.flush();
        expect({ value: form.node('/labels')?.value, keyNodes: Object.keys(stage.value).filter((key) => form.node(`/labels/${key}`)) },
          `labels after entry ${index}`).toEqual({ value: stage.value, keyNodes: [] });
      }
    } finally {
      form.unmount();
    }
  });
});
