import { render } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';

import {
  type KeywordsByPath,
  externalErrorStages,
  forcedShowErrorCase,
  formatErrorCases,
  nodeExternalError,
  showErrorCases,
  validationStateFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import { type FormHandle, type FormatError, Form, type JSONSchema, ShowError } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

import { settleValidation } from '../helpers/settleValidation';

/** GOAL-061 touched lands in the animation frame after blur; jsdom runs frames on a timer, so waits cover one. */
const BLUR_FRAME_MS = 50;

// Consumer-only checks for validation-state cases: display policy, message formatting, and external errors.

/**
 * Find a validation-state scenario by name.
 * @param name - Stable scenario name.
 * @returns The scenario; throws when the data was renamed.
 */
const scenarioNamed = (name: string) => {
  const scenario = validationStateFeatureScenarios.find((item) => item.name === name);
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  return scenario;
};

/**
 * Read the message the default group renderer draws under one leaf field.
 * @param container - Render container.
 * @param path - JSON Pointer of a leaf field.
 * @returns Trimmed message text, or an empty string when nothing is drawn.
 */
const shown = (container: Element, path: string) => container.querySelector(`[data-path="${path}"] em`)?.textContent?.trim() ?? '';

/**
 * Read issue keywords held by each listed node.
 * @param find - Node lookup by path.
 * @param expected - Paths to read; only its keys are used.
 * @returns Keywords per path in issue order.
 */
const keywords = (find: (path: string) => { errors?: readonly { keyword?: string }[] } | null, expected: KeywordsByPath): KeywordsByPath =>
  Object.fromEntries(Object.keys(expected).map((path) => [path, (find(path)?.errors ?? []).map((issue) => issue.keyword ?? '')]));

/**
 * Build a formatError from a keyword-to-template catalog, as the story helper does.
 * @param catalog - Templates by keyword; `{name}` reads the issue detail of that name.
 * @returns A formatter returning null for a keyword missing from the catalog.
 */
const catalogFormatError = (catalog: Readonly<Record<string, string>>): FormatError => (issue) => {
  const template = issue.keyword === undefined ? undefined : catalog[issue.keyword];
  if (template === undefined) return null;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(issue.details?.[name] ?? ''));
};

/**
 * Render a scenario with display props and run its first step's validation.
 * @param name - Scenario name.
 * @param props - Display props for the Form.
 * @returns The settled harness.
 */
const renderValidated = async (name: string, props: { showError?: boolean | ShowError; formatError?: FormatError }): Promise<FormHarness> => {
  const scenario = scenarioNamed(name);
  const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, ...props });
  await form.validate();
  await form.flush();
  return form;
};

describe('features — validation-state display (consumer-only)', () => {
  it.each(showErrorCases)('ShowError.$policy draws messages on load, after input, after blur, and after focus alone', async (item) => {
    const form = await renderValidated('validation-state.show-error', { showError: ShowError[item.policy] });
    try {
      expect(shown(form.container, '/code') !== '', 'message on load').toBe(item.atLoad);
      await form.user.type(form.field('/code')!, 'd');
      await form.flush();
      expect(shown(form.container, '/code') !== '', 'message after input').toBe(item.afterInput);
      await form.user.tab();
      await form.flush(BLUR_FRAME_MS);
      expect(shown(form.container, '/code') !== '', 'message after blur').toBe(item.afterBlur);
      await form.user.tab();
      await form.flush(BLUR_FRAME_MS);
      expect(shown(form.container, '/tag') !== '', 'message under /tag after focus only').toBe(item.afterTouchOnly);
    } finally {
      form.unmount();
    }
  });

  it('the handle showError overrides a Never policy and showError(false) hides the message again', async () => {
    const form = await renderValidated('validation-state.show-error', { showError: ShowError[forcedShowErrorCase.policy] });
    try {
      act(() => form.handle.showError());
      await form.flush();
      expect(shown(form.container, '/code') !== '').toBe(forcedShowErrorCase.afterShow);
      act(() => form.handle.showError(false));
      await form.flush();
      expect(shown(form.container, '/code') !== '').toBe(forcedShowErrorCase.afterHide);
    } finally {
      form.unmount();
    }
  });

  it.each(formatErrorCases)('REACT-026 formatError catalog $label draws the expected /nickname message', async (item) => {
    const form = await renderValidated('validation-state.format-error', { showError: true, formatError: catalogFormatError(item.catalog) });
    try {
      expect(shown(form.container, '/nickname')).toBe(item.shown);
    } finally {
      form.unmount();
    }
  });

  it('without formatError the first issue message is drawn', async () => {
    const form = await renderValidated('validation-state.format-error', { showError: true });
    try {
      const first = form.node('/nickname')!.errors![0];
      expect(first.message).toBeTruthy();
      expect(shown(form.container, '/nickname')).toBe(first.message);
    } finally {
      form.unmount();
    }
  });

  it('LANDING-210, 79C-01 and 178C-01 errors prop stages route, clear dropped paths, and read a non-array as empty', async () => {
    const scenario = scenarioNamed('validation-state.external-errors');
    let handle: FormHandle | null = null;
    // Staged values stay untyped so malformed input reaches the Form as an untyped JavaScript caller would send it.
    const view = (errors: unknown) => {
      const staged: Record<string, unknown> = { errors };
      return <Form<JSONSchema> ref={(next) => { handle = next; }} jsonSchema={scenario.schema as JSONSchema} defaultValue={scenario.initialValue} showError {...staged} />;
    };
    const { container, rerender, unmount } = render(view(externalErrorStages[0].errors));
    try {
      for (const [index, stage] of externalErrorStages.entries()) {
        if (index > 0) rerender(view(stage.errors));
        await act(async () => { await settleValidation(); });
        expect(keywords((path) => handle!.findNode(path), stage.expected), `issues at stage ${stage.label}`).toEqual(stage.expected);
        for (const [path, text] of Object.entries(stage.shown)) expect(shown(container, path), `message at ${path}, stage ${stage.label}`).toBe(text);
      }
    } finally {
      unmount();
    }
  });

  it('setExternalErrors and clearExternalErrors change only the node they are called on', async () => {
    const scenario = scenarioNamed('validation-state.external-errors');
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, showError: true });
    try {
      const node = form.node(nodeExternalError.path)!;
      act(() => node.setExternalErrors(nodeExternalError.issues));
      await form.flush();
      expect(keywords(form.node, { [nodeExternalError.path]: [], '/name': [] })).toEqual({ [nodeExternalError.path]: ['server'], '/name': [] });
      expect(shown(form.container, nodeExternalError.path)).toBe(nodeExternalError.issues[0].message);
      act(() => node.clearExternalErrors());
      await form.flush();
      expect(keywords(form.node, { [nodeExternalError.path]: [] })).toEqual({ [nodeExternalError.path]: [] });
      expect(shown(form.container, nodeExternalError.path)).toBe('');
    } finally {
      form.unmount();
    }
  });
});
