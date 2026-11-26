import { act } from 'react';

import { Form, type FormHandle, type FormProps } from '@canard/schema-form';
import { createRoot } from 'react-dom/client';

/** One occurrence the Form delivers through `onError`. */
type FormErrorRecord = Parameters<NonNullable<FormProps['onError']>>[0];

/** A mounted form as a case observes it. */
interface MountedForm {
  /** Handle received through the Form `ref`. */
  form: FormHandle;
  /** Every `onError` record, in delivery order. */
  records: FormErrorRecord[];
  /** Unmounts the Form and removes its container. */
  unmount: () => Promise<void>;
}

/**
 * Mounts a Form the way a consumer renders it and keeps every `onError` record.
 * The caller's test file sets `IS_REACT_ACT_ENVIRONMENT`.
 * @param props - Schema, default value and validation settings; without `validatorFactory` the Form uses the registered plugin
 * @returns The mounted form's handle, records and unmount function
 */
export const mountForm = async (
  props: Pick<
    FormProps,
    'jsonSchema' | 'defaultValue' | 'validatorFactory' | 'validationMode'
  >,
): Promise<MountedForm> => {
  const container = document.body.appendChild(document.createElement('div'));
  const reactRoot = createRoot(container);
  const records: FormErrorRecord[] = [];
  let handle: FormHandle | null = null;
  await act(async () => {
    reactRoot.render(
      <Form
        {...props}
        ref={(form) => void (handle = form)}
        onError={(record) => records.push(record)}
      />,
    );
  });
  const unmount = async () => {
    await act(async () => reactRoot.unmount());
    container.remove();
  };
  return { form: handle!, records, unmount };
};
