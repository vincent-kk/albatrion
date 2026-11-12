import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';
import { FieldInputRadioGroupDefinition } from '../FieldInputRadioGroup';
import { FieldInputStringCheckboxDefinition } from '../FieldInputStringCheckbox';
beforeEach(() => vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('keeps null and the string null independently selected in checkboxes', () => {
  const ref = createRef<FormHandle<JSONSchema, string | null | Array<string | null>>>();
  render(<Form<JSONSchema, string | null | Array<string | null>> ref={ref} jsonSchema={{ type: 'array', items: { type: ['string', 'null'], enum: [null, 'null'] }, presentation: { inputType: 'checkbox' } }} defaultValue={[null]} fieldInputDefinitions={[FieldInputStringCheckboxDefinition]} />);
  const controls = screen.getAllByRole<HTMLInputElement>('checkbox');
  expect(controls[0].checked).toBe(true);
  expect(controls[1].checked).toBe(false);
  fireEvent.click(controls[1]);
  expect(ref.current?.getValue()).toEqual([null, 'null']);
  fireEvent.click(controls[0]);
  expect(ref.current?.getValue()).toEqual(['null']);
});
it('distinguishes nullable radio options', () => {
  const ref = createRef<FormHandle<JSONSchema, string | null | Array<string | null>>>();
  render(<Form<JSONSchema, string | null | Array<string | null>> ref={ref} jsonSchema={{ type: ['string', 'null'], enum: [null, 'null'], presentation: { inputType: 'radio' } }} defaultValue={null} fieldInputDefinitions={[FieldInputRadioGroupDefinition]} />);
  const controls = screen.getAllByRole<HTMLInputElement>('radio');
  fireEvent.click(controls[1]);
  expect(ref.current?.getValue()).toBe('null');
  fireEvent.click(controls[0]);
  expect(ref.current?.getValue()).toBeNull();
});
