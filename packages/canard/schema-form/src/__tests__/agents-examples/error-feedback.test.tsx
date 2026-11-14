import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  ErrorVisibility,
  type FieldInputProps,
  FieldNodeState,
  Form,
  type FormHandle,
  type FormProps,
  type JSONSchema,
  ValidationMode,
  useChildFieldErrors,
} from '@/schema-form';

/** Schema messages are application copy; issue details supply validator parameters. */
const messageSchema = {
  type: 'string',
  presentation: {
    errorMessages: {
      minLength: { en: 'Use at least {limit} characters: {value}' },
      default: 'Check this value',
    },
  },
} satisfies JSONSchema;

/** Application formatter owns its fallback because supplying it replaces the default formatter. */
const formatError: NonNullable<FormProps['formatError']> = (
  error,
  node,
  context,
) => (
  <strong>
    {String(context.heading)}: {node.path || 'form'}: {error.message}
  </strong>
);

/** A section chooses messages per child so an untouched first sibling cannot leak its error.
 * @param props - Branch input supplied by Form, with its current children.
 * @returns Child inputs and a list of individually eligible messages. */
function SectionInput({ node, ChildFields }: FieldInputProps) {
  const { childErrorVisibleList, formattedErrors } = useChildFieldErrors(node);
  return (
    <section>
      {ChildFields.map((Child, index) => (
        <Child key={index} />
      ))}
      <ul aria-label="Section errors">
        {formattedErrors.map((message, index) =>
          childErrorVisibleList[index] && message != null ? (
            <li key={node.children![index].path}>{message}</li>
          ) : null,
        )}
      </ul>
    </section>
  );
}

afterEach(cleanup);

it('uses keyword, locale, default and original-message fallbacks without changing raw issues', () => {
  const ref = createRef<FormHandle>();
  const issue = {
    dataPath: '',
    keyword: 'minLength',
    message: 'raw',
    details: { limit: 3 },
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={messageSchema}
      defaultValue="ab"
      errors={[issue]}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
      context={{ locale: 'en' }}
    >
      <Form.ErrorMessage path="" />
    </Form>,
  );
  expect(view.getByText('Use at least 3 characters: ab')).toBeTruthy();
  expect(ref.current!.getErrors()).toEqual([issue]);
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={messageSchema}
      defaultValue="ab"
      errors={[issue]}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
      context={{ locale: 'fr' }}
    >
      <Form.ErrorMessage path="" />
    </Form>,
  );
  expect(view.getByText('raw')).toBeTruthy();
  act(() =>
    ref.current!.node!.setExternalErrors([
      { dataPath: '', keyword: 'server', message: 'original' },
    ]),
  );
  expect(view.getByText('Check this value')).toBeTruthy();
  const emptyKeyword = render(
    <Form
      jsonSchema={{
        type: 'string',
        presentation: { errorMessages: { minLength: '', default: 'Check' } },
      }}
      defaultValue="ab"
      errors={[issue]}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
    >
      <Form.ErrorMessage path="" />
    </Form>,
  );
  expect(emptyKeyword.getByText('Check')).toBeTruthy();
});

it('renders ReactNode formatter output using node and context', () => {
  const view = render(
    <Form
      jsonSchema={messageSchema}
      defaultValue="ab"
      formatError={formatError}
      context={{ heading: 'Please correct' }}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
      errors={[{ dataPath: '', keyword: 'minLength', message: 'Too short' }]}
    >
      <Form.ErrorMessage path="" />
    </Form>,
  );
  expect(view.getByText('Please correct: form: Too short').tagName).toBe(
    'STRONG',
  );
});

it('shows only eligible direct-child messages and follows cleared errors', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          first: { type: 'string' },
          second: { type: 'string' },
        },
      }}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.AfterTouch}
      fieldInputMap={{ '': SectionInput }}
      errors={[
        { dataPath: '/first', message: 'First issue' },
        { dataPath: '/second', message: 'Second issue' },
      ]}
    />,
  );
  const summary = view.getByLabelText('Section errors');
  expect(summary.textContent).toBe('');
  act(() =>
    ref
      .current!.findNode('/second')!
      .setState({ [FieldNodeState.Touched]: true }),
  );
  expect(summary.textContent).toBe('Second issue');
  expect(ref.current!.getErrors()).toHaveLength(2);
  act(() => ref.current!.findNode('/second')!.clearExternalErrors());
  expect(summary.textContent).toBe('');
});
