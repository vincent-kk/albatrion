import { createRef } from 'react';

import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import type {
  FieldInputProps,
  FieldRendererProps,
  InputRendererProps,
} from '@/schema-form/types';
import { ErrorVisibility } from '@/schema-form/types';

/**
 * Count a leaf's frame and raw input while its group displays Touched eligibility.
 * @param withError - Use the visible-state group and an existing issue; false exercises a pristine default group.
 * @returns The mounted form, live leaf and independent render counters.
 */
export const createStateDeliveryForm = (withError = true) => {
  const ref = createRef<FormHandle>();
  const frames = vi.fn(({ path, children }: InputRendererProps) => (
    <section data-frame={path}>{children}</section>
  ));
  let change!: FieldInputProps['onChange'];
  const inputs = vi.fn(({ path, defaultValue, onChange }: FieldInputProps) => {
    change = onChange;
    return (
      <input
        id={path}
        defaultValue={defaultValue}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  });
  const Group = ({
    isRoot,
    Input,
    errorVisible,
    errorMessage,
  }: FieldRendererProps) =>
    isRoot ? (
      <Input />
    ) : (
      <>
        <Input />
        <output data-testid="visibility">
          {errorVisible ? 'visible' : 'hidden'}
        </output>
        <span data-testid="message">{errorMessage}</span>
      </>
    );
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'object', properties: { field: { type: 'string' } } }}
      defaultValue={{ field: 'initial' }}
      validationMode={0}
      errorVisibility={ErrorVisibility.AfterTouch}
      errors={
        withError ? [{ dataPath: '/field', message: 'Issue' }] : undefined
      }
      FieldRenderer={withError ? Group : undefined}
      InputRenderer={frames}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: inputs }]}
    />,
  );
  frames.mockClear();
  inputs.mockClear();
  return {
    ...view,
    frames,
    inputs,
    node: ref.current!.findNode('/field')!,
    change: (value: string) => change(value),
  };
};
