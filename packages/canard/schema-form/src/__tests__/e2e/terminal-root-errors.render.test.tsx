import { createRef } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { useFieldErrors } from '@/schema-form';
import { ErrorVisibility } from '@/schema-form';
import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  isValidationError,
  useChildFieldErrors,
} from '@/schema-form';

import { createRenderValidator } from '../helpers/createRenderValidator';

afterEach(cleanup);

/** Lists the issues the root node hands to its own input.
 * @param props - FieldInput props supplied by Form for the terminal root.
 * @returns One list item per issue in `errors`. */
const RootErrorsInput = ({ node }: FieldInputProps) => {
  const { errors } = useFieldErrors(node);
  return (
    <ul aria-label="root errors">
      {errors.map((issue, index) => (
        <li key={index}>{`${issue.dataPath}|${issue.keyword}`}</li>
      ))}
    </ul>
  );
};

/** Reports what the child-error hook sees on a childless terminal root.
 * @param props - FieldInput props supplied by Form for the terminal root.
 * @returns The hook's list lengths. */
const ChildErrorsInput = ({ node }: FieldInputProps) => {
  const { childErrorVisibleList, formattedErrors } = useChildFieldErrors(node);
  return (
    <p data-testid="child-errors">{`${childErrorVisibleList.length}|${formattedErrors.length}`}</p>
  );
};

const schemaWith = (FieldInput: typeof RootErrorsInput): JSONSchema => ({
  type: 'object',
  presentation: { FieldInput },
  properties: { name: { type: 'string', minLength: 3 } },
});

it('a terminal root receives an inner-path issue in its node errors and its input error hook', async () => {
  const ref = createRef<FormHandle>();
  const onSubmit = vi.fn();
  render(
    <Form
      ref={ref}
      jsonSchema={schemaWith(RootErrorsInput)}
      defaultValue={{ name: 'ab' }}
      validationMode={ValidationMode.OnRequest}
      validatorFactory={createRenderValidator()}
      onSubmit={onSubmit}
      errorVisibility={ErrorVisibility.Always}
    />,
  );
  await act(async () => {});

  let returned: Awaited<ReturnType<FormHandle['validate']>> = [];
  await act(async () => {
    returned = await ref.current!.validate();
  });
  expect(returned).toHaveLength(1);

  const rootErrors = ref.current!.node!.errors;
  expect(rootErrors).toHaveLength(1);
  expect(rootErrors[0]).toMatchObject({
    dataPath: '/name',
    keyword: 'minLength',
  });
  expect(
    screen.getAllByRole('listitem').map((item) => item.textContent),
  ).toEqual(['/name|minLength']);

  const all = ref.current!.getErrors();
  expect(all.filter((issue) => issue.dataPath === '/name')).toHaveLength(1);
  expect(all).toHaveLength(1);

  let rejection: unknown;
  await act(async () => {
    await ref.current!.submit().catch((error: unknown) => {
      rejection = error;
    });
  });
  expect(isValidationError(rejection)).toBe(true);
  expect(onSubmit).not.toHaveBeenCalled();
});

it('useChildFieldErrors on a childless terminal root stays empty while the root holds the issue', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={schemaWith(ChildErrorsInput)}
      defaultValue={{ name: 'ab' }}
      validationMode={ValidationMode.OnRequest}
      validatorFactory={createRenderValidator()}
      errorVisibility={ErrorVisibility.Always}
    />,
  );
  await act(async () => {
    await ref.current!.validate();
  });
  expect(screen.getByTestId('child-errors').textContent).toBe('0|0');
  expect(ref.current!.node!.errors).toHaveLength(1);
});
