import { createRef, useLayoutEffect } from 'react';

import { render } from '@testing-library/react';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { useFieldErrors } from '@/schema-form/hooks';
import { useWorkspaceContext } from '@/schema-form/providers';
import type {
  FieldInputProps,
  FieldRendererProps,
  InputRendererProps,
} from '@/schema-form/types';
import { ErrorVisibility } from '@/schema-form/types';

/**
 * Mount an uncontrolled leaf whose frame changes its container's ancestry on error.
 * @param virtualized - Enable the real manager's input registration.
 * @returns The view, live node, current input props and bridge-owned attachment map.
 */
export const createRestructuringFrame = (virtualized = false) => {
  const ref = createRef<FormHandle>();
  let current!: FieldInputProps;
  let files!: ReturnType<typeof useWorkspaceContext>['attachedFilesMap'];
  let mounts = 0;
  const Input = (props: FieldInputProps) => {
    current = props;
    files = useWorkspaceContext().attachedFilesMap;
    useLayoutEffect(() => {
      mounts++;
    }, []);
    return (
      <input
        id={props.path}
        defaultValue={props.defaultValue}
        onChange={(event) => props.onChange(event.target.value)}
      />
    );
  };
  const Frame = ({ node, children }: InputRendererProps) =>
    useFieldErrors(node).errorMessage != null ? (
      <div className="error-frame">{children}</div>
    ) : (
      <span>{children}</span>
    );
  const Group = ({ isRoot, Input }: FieldRendererProps) => (
    // @ts-expect-error Binding-owned defaults reject authored overrides.
    <Input unwrapped={isRoot} defaultValue="override" />
  );
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          field: {
            type: 'string',
            presentation: { FieldInputProps: { defaultValue: 'schema' } },
          },
        },
      }}
      defaultValue={{ field: 'initial' }}
      validationMode={0}
      errorVisibility={ErrorVisibility.Always}
      FieldRenderer={Group}
      InputRenderer={Frame}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: Input }]}
      virtualization={virtualized ? { threshold: 1, eagerCount: 1 } : false}
    />,
  );
  return {
    ...view,
    ref,
    node: ref.current!.findNode('/field')!,
    props: () => current,
    mounts: () => mounts,
    files: () => files,
    input: () => view.container.querySelector('input')!,
  };
};
