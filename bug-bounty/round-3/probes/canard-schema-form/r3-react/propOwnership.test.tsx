import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, FormProvider, ValidationMode } from '@/schema-form';

afterEach(cleanup);

/** IN2: two Forms receive the same application-owned objects; neither Form may freeze or mutate them. */
it('Forms leave application-owned prop objects unfrozen and unmodified', () => {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', default: 'd' },
      tags: { type: 'array', items: { type: 'string' } },
    },
  };
  const defaultValue = { name: 'shared', tags: ['a'] };
  const context = { role: 'admin', nested: { flag: true } };
  const errors = [{ dataPath: '/name', keyword: 'server', message: 'taken' }];
  const before = JSON.stringify({ schema, defaultValue, context, errors });
  const first = createRef<FormHandle<any>>();
  const view = render(
    <FormProvider context={context}>
      <Form
        ref={first}
        jsonSchema={schema}
        defaultValue={defaultValue}
        context={context}
        errors={errors}
        validationMode={ValidationMode.None}
      />
      <Form
        jsonSchema={schema}
        defaultValue={defaultValue}
        context={context}
        errors={errors}
        validationMode={ValidationMode.None}
      />
    </FormProvider>,
  );
  const input = view.container.querySelector<HTMLInputElement>('input')!;
  act(() => {
    fireEvent.change(input, { target: { value: 'edited' } });
  });
  act(() => {
    first.current!.setValue({ name: 'x', tags: ['b', 'c'] });
  });
  const frozen = {
    schema: Object.isFrozen(schema),
    properties: Object.isFrozen(schema.properties),
    defaultValue: Object.isFrozen(defaultValue),
    tags: Object.isFrozen(defaultValue.tags),
    context: Object.isFrozen(context),
    nested: Object.isFrozen(context.nested),
    errors: Object.isFrozen(errors),
    issue: Object.isFrozen(errors[0]),
  };
  expect(frozen).toEqual({
    schema: false,
    properties: false,
    defaultValue: false,
    tags: false,
    context: false,
    nested: false,
    errors: false,
    issue: false,
  });
  expect(JSON.stringify({ schema, defaultValue, context, errors })).toBe(before);
});
