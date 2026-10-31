import type { ComponentType } from 'react';

import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  type FormScenario,
  type RendererSlot,
  pluginsFeatureScenarios,
  rendererCases,
  validatorSourceCases,
} from '@aileron/schema-form-scenarios';

import { type FormHandle, type FieldRendererProps, Form, FormProvider, type JSONSchema, ValidationMode } from '@/schema-form';

import { renderForm, setupValidatorPlugin } from '../renderForm';

import { settleValidation } from '../helpers/settleValidation';

// Consumer-only checks for plugins cases. The 'none' validator cases run first, before any test registers the plugin.

/**
 * Find a plugins scenario by name.
 * @param name - Stable scenario name.
 * @returns The scenario; throws when the data was renamed.
 */
const scenarioNamed = (name: string): FormScenario => {
  const scenario = pluginsFeatureScenarios.find((item) => item.name === name);
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  return scenario;
};

/**
 * Build renderers that mark which source drew them, as the stories do.
 * @param source - Marker prefix.
 * @returns Renderers keyed by slot.
 */
const markedRenderers = (source: string): Record<RendererSlot, ComponentType<FieldRendererProps>> => ({
  group: ({ Input, path }) => <div data-renderer={`${source}-group`} data-field={path}><Input /></div>,
  label: ({ name, path }) => <label data-renderer={`${source}-label`} htmlFor={path}>{name}</label>,
  error: ({ errorVisible, errors }) => (errorVisible && errors?.length ? <em data-renderer={`${source}-error`}>{errors.map((issue) => issue.keyword).join(',')}</em> : null),
});

/**
 * Pick renderer props for the slots a case sets.
 * @param slots - Slots to set.
 * @param source - Marker prefix of the renderers.
 * @returns Props keyed by renderer prop name.
 */
const rendererProps = (slots: readonly RendererSlot[], source: string) => {
  const renderers = markedRenderers(source);
  return {
    ...(slots.includes('group') && { FieldRenderer: renderers.group }),
    ...(slots.includes('label') && { FormLabelRenderer: renderers.label }),
    ...(slots.includes('error') && { FormErrorRenderer: renderers.error }),
  };
};

/**
 * Settle React work and timers in jsdom.
 * @returns Completion after the act scope.
 */
const settle = () => act(async () => { await settleValidation(); });

describe('features — plugins consumer-only', () => {
  it('VALIDATE-042 and ERROR-024 a form with no validator warns once, and validation mode None removes the warning', async () => {
    const scenario = scenarioNamed('plugins.validator-sources');
    for (const item of validatorSourceCases.filter((entry) => entry.source === 'none')) {
      const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue,
        ...(item.validationMode && { validationMode: ValidationMode[item.validationMode] }) });
      try {
        await form.validate();
        expect({ warnings: form.errorRecords().map(({ code }) => code), keywords: (form.node('/name')?.errors ?? []).map((issue) => issue.keyword) }, item.label)
          .toEqual({ warnings: item.warnings, keywords: item.keywords });
      } finally {
        form.unmount();
      }
    }
  });

  it('VALIDATE-041 the Form validatorFactory precedes the registered plugin', async () => {
    const scenario = scenarioNamed('plugins.validator-sources');
    for (const item of validatorSourceCases.filter((entry) => entry.source !== 'none')) {
      const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true,
        ...(item.factoryKeyword && { validatorFactory: {
          compile: () => () => [{ dataPath: '/name', keyword: item.factoryKeyword }],
          compileGuard: () => () => true,
        } }) });
      try {
        await form.validate();
        expect({ warnings: form.errorRecords().map(({ code }) => code), keywords: (form.node('/name')?.errors ?? []).map((issue) => issue.keyword) }, item.label)
          .toEqual({ warnings: item.warnings, keywords: item.keywords });
      } finally {
        form.unmount();
      }
    }
  });

  it('SURFACE-002 and SURFACE-003 Form renderers replace the plugin ones and a provider group applies when the Form sets none', async () => {
    const scenario = scenarioNamed('plugins.renderer-replacement');
    setupValidatorPlugin();
    for (const item of rendererCases) {
      let handle: FormHandle | null = null;
      const { container, unmount } = render(<FormProvider {...rendererProps(item.provider, 'provider')}>
        <Form<JSONSchema> ref={(next) => { handle = next; }} jsonSchema={scenario.schema as JSONSchema} defaultValue={scenario.initialValue}
          showError {...rendererProps(item.form, 'form')}>
          {item.composed ? <><Form.Label path="/title" /><Form.Input path="/title" /><Form.Error path="/title" /></> : undefined}
        </Form>
      </FormProvider>);
      try {
        await settle();
        await act(async () => { await handle!.validate(); });
        await settle();
        const drawn = new Set(Array.from(container.querySelectorAll<HTMLElement>('[data-renderer]')).map((element) => element.dataset.renderer));
        expect({ markers: item.markers.filter((marker) => drawn.has(marker)), absent: item.absent.filter((marker) => drawn.has(marker)) }, item.label)
          .toEqual({ markers: [...item.markers], absent: [] });
      } finally {
        unmount();
      }
    }
  });
});
