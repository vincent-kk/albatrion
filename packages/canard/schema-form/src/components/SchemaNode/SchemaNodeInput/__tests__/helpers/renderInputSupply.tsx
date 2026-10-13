import { type ComponentType, createRef, memo } from 'react';

import { render } from '@testing-library/react';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type FormProps,
  FormProvider,
  type JSONSchema,
  registerPlugin,
} from '@/schema-form';

/** Resolution paths whose field boundaries must share the Refresh policy. */
export const INPUT_SUPPLIES = [
  'inline',
  'map',
  'wildcard map',
  'definitions',
  'external',
  'plugin',
  'preferred',
  'memo preferred',
] as const;

/** Render an input through its owning resolver, retaining definitions across Form key changes.
 * @param Component - Raw input whose mounts or failures the regression observes.
 * @param supply - Resolver selected for the /field node.
 * @param fieldSchema - Terminal or container schema exercised by the input.
 * @param defaultValue - Initial committed value of /field.
 * @param Peer - Optional sibling input that writes to /field.
 * @returns DOM view, current form handle ref and a Form key replacement operation.
 */
export const renderInputSupply = (
  Component: ComponentType<FieldInputProps>,
  supply: (typeof INPUT_SUPPLIES)[number],
  fieldSchema: JSONSchema = { type: 'string' },
  defaultValue: unknown = 'initial',
  Peer?: ComponentType<FieldInputProps>,
) => {
  const DefaultPeer = ({ path, defaultValue }: FieldInputProps) => (
    <input id={path} defaultValue={defaultValue} />
  );
  const ref = createRef<FormHandle>();
  const definitions = [{ test: { path: '/field' }, Component }];
  const props: FormProps = {
    jsonSchema: {
      type: 'object',
      properties: {
        field:
          supply === 'inline'
            ? { ...fieldSchema, presentation: { FieldInput: Component } }
            : fieldSchema,
        peer: {
          type: 'string',
          presentation: { FieldInput: Peer ?? DefaultPeer },
        },
      },
    },
    defaultValue: { field: defaultValue, peer: 'idle' },
    onError: () => {},
  };
  if (supply === 'map' || supply === 'wildcard map')
    props.fieldInputMap = {
      [supply === 'map' ? '^/field$' : '/*']: Component,
    };
  if (supply === 'definitions') props.fieldInputDefinitions = definitions;
  if (supply === 'plugin')
    registerPlugin({ fieldInputDefinitions: definitions });
  if (supply === 'preferred' || supply === 'memo preferred')
    props.children = (
      <>
        <Form.Input
          path="/field"
          FieldInput={supply === 'preferred' ? Component : memo(Component)}
        />
        <Form.Input path="/peer" />
      </>
    );
  const element = (key: number) => (
    <FormProvider
      fieldInputDefinitions={supply === 'external' ? definitions : undefined}
    >
      <Form key={key} ref={ref} {...props} />
    </FormProvider>
  );
  const view = render(element(0));
  return { ...view, ref, replaceForm: () => view.rerender(element(1)) };
};
