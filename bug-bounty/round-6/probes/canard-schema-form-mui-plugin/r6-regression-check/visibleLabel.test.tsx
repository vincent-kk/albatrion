import { writeFileSync } from 'node:fs';
import { afterAll } from 'vitest';
// Loaded by Vitest; each revision imports an unchanged archived plugin entry.
import { cleanup, render } from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, expect, it } from 'vitest';
import { Form, type JSONSchema } from '@canard/schema-form';
import { plugin as parent } from './0ce02213a-parent/src/index';
import { plugin as commit } from './0ce02213a/src/index';
afterEach(cleanup);
it.each<[string, JSONSchema, string]>([
  ['enum', { type: 'string', enum: ['a', 'b'] }, 'combobox'],
  ['slider', { type: 'number', format: 'slider', presentation: { inputType: 'slider' } }, 'slider'],
  ['boolean switch', { type: 'boolean', presentation: { inputType: 'switch' } }, 'switch'],
  ['string switch', { type: 'string', enum: ['on', 'off'], presentation: { inputType: 'switch' } }, 'switch'],
  ['text', { type: 'string' }, 'textbox'],
])('%s accessible names at parent and commit', (kind, field, role) => {
  for (const [revision, plugin] of [['0ce02213a-parent', parent], ['0ce02213a', commit]] as const) {
    const view = render(<Form jsonSchema={{ type: 'object', properties: { internalKey: { ...field, presentation: { ...field.presentation, FieldInputProps: { label: 'Volume setting' } } } } }} fieldInputDefinitions={plugin.fieldInputDefinitions} FieldRenderer={plugin.FieldRenderer} LabelRenderer={plugin.LabelRenderer} />);
    expect(view.getByText('Volume setting', { selector: 'label, label span, .MuiFormControlLabel-label' })).toBeTruthy();
    const name = computeAccessibleName(view.getByRole(role));
    observations.push({ revision, kind, name });
    if (revision.endsWith('parent')) expect(name).toContain('Volume setting');
    else expect(name).toBe('internalKey');
    view.unmount();
  }
});

const observations: unknown[] = [];
afterAll(() => writeFileSync('src/__bounty__/r6-regression-check/visibleLabel.test.observations.json', JSON.stringify(observations, null, 2) + '\n'));
