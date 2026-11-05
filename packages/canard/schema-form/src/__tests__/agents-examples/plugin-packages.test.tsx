import { createRef } from 'react';

import {
  Form,
  type FormHandle,
  FormProvider,
  type SchemaFormPlugin,
  registerPlugin,
} from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

afterEach(cleanup);

it('passes plugin members explicitly through the public FormProvider', async () => {
  const plugin: SchemaFormPlugin = {
    ...antd5Plugin,
    validator: ajvValidatorPlugin.validator,
  };
  const ref = createRef<FormHandle>();
  const form = (
    <FormProvider
      FieldRenderer={plugin.FieldRenderer}
      FormLabelRenderer={plugin.FormLabelRenderer}
      FormInputRenderer={plugin.FormInputRenderer}
      FormErrorRenderer={plugin.FormErrorRenderer}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      formatError={plugin.formatError}
      validatorFactory={plugin.validator}
    >
      <Form
        ref={ref}
        jsonSchema={{ type: 'string', minLength: 3 }}
        defaultValue="a"
      />
    </FormProvider>
  );
  const view = render(form);

  expect(
    view.container.querySelector<HTMLInputElement>('input.ant-input')?.value,
  ).toBe('a');
  await act(async () => {
    expect(await ref.current!.validate()).toEqual([
      expect.objectContaining({ keyword: 'minLength' }),
    ]);
  });
});

it('uses the public plugin exports to render Ant Design inputs and validate', async () => {
  registerPlugin(antd5Plugin); // 1. UI
  registerPlugin(ajvValidatorPlugin); // 2. validator
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', minLength: 3 }}
      defaultValue="a"
    />,
  );

  expect(
    view.container.querySelector<HTMLInputElement>('input.ant-input')?.value,
  ).toBe('a');
  await act(async () => {
    expect(await ref.current!.validate()).toEqual([
      expect.objectContaining({ keyword: 'minLength' }),
    ]);
  });
});
