import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, expect, it } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  type JSONSchema,
  registerPlugin,
} from '@canard/schema-form';
import { plugin as ajvPlugin } from '@canard/schema-form-ajv8-plugin';

import { plugin } from '../../index';

beforeAll(() => {
  registerPlugin(ajvPlugin);
});
afterEach(cleanup);

/** A checkbox group that needs two choices; the AJV message is the default one. */
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3 },
    topics: {
      type: 'array',
      minItems: 2,
      items: { type: 'string', enum: ['news', 'sports', 'tech'] },
      presentation: { inputType: 'checkbox' },
    },
  },
} satisfies JSONSchema;

const mount = (withPlugin: boolean) => {
  const ref = createRef<FormHandle>();
  const utils = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ name: 'ab', topics: ['news'] }}
      errorVisibility={ErrorVisibility.Always}
      {...(withPlugin
        ? {
            fieldInputDefinitions: plugin.fieldInputDefinitions,
            FieldRenderer: plugin.FieldRenderer,
            ErrorMessageRenderer: plugin.ErrorMessageRenderer,
          }
        : {})}
    />,
  );
  return { ref, ...utils };
};

it('control: the core fallback renderer shows the checkbox group error', async () => {
  const { ref, container } = mount(false);
  await act(async () => {
    await ref.current!.validate();
  });
  const paths = ref.current!.getErrors().map((error) => error.dataPath);
  expect(paths).toContain('/topics');
  expect(container.textContent).toContain('must NOT have fewer than 2 items');
});

it('the antd-mobile renderer shows the checkbox group error that blocks submission', async () => {
  const { ref, container } = mount(true);
  await act(async () => {
    await ref.current!.validate();
  });
  const paths = ref.current!.getErrors().map((error) => error.dataPath);
  expect(paths).toContain('/topics');
  // control: a terminal field's error is shown by the same renderer
  expect(container.textContent).toContain('fewer than 3 characters');
  expect(container.textContent).toContain('must NOT have fewer than 2 items');
});
