import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, ValidationMode } from '../../index';
import type { FieldInputProps, FieldNode } from '../../index';

afterEach(cleanup);

// Exercises the package entry's Form, input mapping and public node/error APIs.
it('finds, validates and renders the empty-name child through the same slash address', async () => {
  let root: FieldNode | undefined;
  let mapped: FieldNode | undefined;
  const issues = [{ dataPath: '/', message: 'empty-name issue' }];
  const EmptyInput = ({ node, value }: FieldInputProps) => {
    mapped = node;
    return (
      <input
        data-testid="empty-name-input"
        value={String(value ?? '')}
        readOnly
      />
    );
  };
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { '': { type: 'string' }, name: { type: 'string' } },
      }}
      defaultValue={{ '': 'empty', name: 'ordinary' }}
      fieldInputMap={{ '/': EmptyInput }}
      validationMode={ValidationMode.OnRequest}
      validatorFactory={{
        compile: () => () => issues,
        compileGuard: () => () => true,
      }}
    >
      {({ node }) => {
        root = node;
        return (
          <>
            <Form.Input path="/" />
            <Form.Input path="/name" />
          </>
        );
      }}
    </Form>,
  );
  await waitFor(() => expect(mapped).toBeDefined());
  expect(root!.find('/')).toBe(mapped);
  expect(root!.find('#/')).toBe(mapped);
  expect(mapped!.name).toBe('');
  expect(mapped!.path).toBe('/');
  expect(screen.getAllByTestId('empty-name-input')).toHaveLength(1);
  await act(async () => {
    await root!.validate();
  });
  expect(mapped!.errors).toEqual(issues);
  expect(root!.errors).toEqual([]);
  expect(root!.find('/name')!.errors).toEqual([]);
});

it('maps a hash fieldInputMap key to the root of an ordinary form', async () => {
  let root: FieldNode | undefined;
  let mapped: FieldNode | undefined;
  const RootInput = ({ node }: FieldInputProps) => {
    mapped = node;
    return <span data-testid="root-input" />;
  };
  render(
    <Form
      jsonSchema={{ type: 'object', properties: { name: { type: 'string' } } }}
      fieldInputMap={{ '#': RootInput }}
      validationMode={ValidationMode.OnRequest}
    >
      {({ node }) => {
        root = node;
        return <Form.Input path="#" />;
      }}
    </Form>,
  );
  await waitFor(() => expect(mapped).toBeDefined());
  expect(mapped).toBe(root);
  expect(root!.find('#')).toBe(root);
  expect(mapped!.path).toBe('');
  expect(screen.getByTestId('root-input')).toBeTruthy();
});

it('does not attach a slash issue to the root when no empty-name child exists', async () => {
  let root: FieldNode | undefined;
  const issues = [{ dataPath: '/', message: 'unresolved empty name' }];
  render(
    <Form
      jsonSchema={{ type: 'object', properties: { name: { type: 'string' } } }}
      validatorFactory={{
        compile: () => () => issues,
        compileGuard: () => () => true,
      }}
      validationMode={ValidationMode.OnRequest}
    >
      {({ node }) => {
        root = node;
        return <Form.Input path="/name" />;
      }}
    </Form>,
  );
  await waitFor(() => expect(root).toBeDefined());
  await act(async () => {
    await root!.validate();
  });
  expect(root!.find('/')).toBeNull();
  expect(root!.errors).toEqual([]);
  expect(root!.find('/name')!.errors).toEqual([]);
  expect(root!.globalErrors).toEqual(issues);
});
