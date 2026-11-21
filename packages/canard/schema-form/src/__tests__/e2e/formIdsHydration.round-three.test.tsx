import { StrictMode } from 'react';

import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';

import { Form, ValidationMode } from '../../index';

it('round-3: sibling Form identifiers remain unique and unchanged through hydration', async () => {
  const schema = {
    type: 'object',
    properties: { email: { type: 'string' } },
  } as const;
  const element = (
    <StrictMode>
      <Form jsonSchema={schema} validationMode={ValidationMode.None} />
      <Form jsonSchema={schema} validationMode={ValidationMode.None} />
    </StrictMode>
  );
  const container = document.createElement('div');
  document.body.append(container);
  container.innerHTML = renderToString(element, {
    identifierPrefix: 'account-',
  });
  const before = [...container.querySelectorAll('[id]')].map((node) => node.id);
  expect(new Set(before).size).toBe(before.length);
  const errors: unknown[] = [];
  const root = hydrateRoot(container, element, {
    identifierPrefix: 'account-',
    onRecoverableError: (error) => errors.push(error),
  });
  await act(async () => {});
  expect(errors).toEqual([]);
  expect(
    [...container.querySelectorAll('[id]')].map((node) => node.id),
  ).toEqual(before);
  for (const form of container.querySelectorAll('form')) {
    expect(form.querySelector('label')!.control).toBe(
      form.querySelector('input'),
    );
  }
  await act(() => root.unmount());
  container.remove();
});
