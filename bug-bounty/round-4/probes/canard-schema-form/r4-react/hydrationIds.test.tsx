import { act } from '@testing-library/react';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';

import { Form, FormProvider, ValidationMode } from '@/schema-form';

/** EQ5: renderToString then hydrateRoot with the round 3 scoped identifiers on richer layouts. */
const schema = {
  type: 'object',
  properties: {
    plan: {
      type: 'string',
      enum: ['free', 'pro'],
      presentation: { inputType: 'radio' },
    },
    tags: {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: {
            type: 'string',
            enum: ['x', 'y'],
            presentation: { inputType: 'radio' },
          },
        },
      },
    },
    agree: { type: 'boolean' },
  },
} as const;

const defaultValue = {
  plan: 'pro',
  tags: ['b'],
  rows: [{ kind: 'x' }, { kind: 'y' }],
  agree: true,
};

const hydrate = async (element: JSX.Element) => {
  const container = document.createElement('div');
  document.body.append(container);
  container.innerHTML = renderToString(element);
  const before = [...container.querySelectorAll('[id],[for],[name]')].map(
    (node) =>
      [
        node.getAttribute('id'),
        node.getAttribute('for'),
        node.getAttribute('name'),
      ].join('|'),
  );
  const errors: unknown[] = [];
  // Hydration starts inside act: started outside it, the first React 18 run after the dependency
  // optimizer rebuilds its cache reported "This root received an early update" (see the report).
  let root!: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, element, {
      onRecoverableError: (error) => errors.push(error),
    });
  });
  const after = [...container.querySelectorAll('[id],[for],[name]')].map(
    (node) =>
      [
        node.getAttribute('id'),
        node.getAttribute('for'),
        node.getAttribute('name'),
      ].join('|'),
  );
  const checked = [...container.querySelectorAll('input:checked')].map(
    (node) => (node as HTMLInputElement).value,
  );
  await act(async () => root.unmount());
  container.remove();
  return { errors: errors.map(String), same: after.join() === before.join(), checked };
};

/** Environment control: the same hydration helper on markup that contains no schema-form code. */
it('control: plain markup hydrates without recoverable errors', async () => {
  const Plain = () => (
    <form>
      <label htmlFor="plain">plain</label>
      <input id="plain" name="plain" defaultValue="x" />
    </form>
  );
  const result = await hydrate(
    <StrictMode>
      <Plain />
      <Plain />
    </StrictMode>,
  );
  if (result.errors.length)
    throw new Error('recoverable: ' + result.errors.join(' || ').slice(0, 600));
  expect(result.same).toBe(true);
});

it('an automatic layout hydrates with the same identifiers and selections', async () => {
  const result = await hydrate(
    <StrictMode>
      <Form
        jsonSchema={schema}
        defaultValue={defaultValue}
        validationMode={ValidationMode.None}
      />
      <Form
        jsonSchema={schema}
        defaultValue={defaultValue}
        validationMode={ValidationMode.None}
      />
    </StrictMode>,
  );
  if (result.errors.length)
    throw new Error('recoverable: ' + result.errors.join(' || ').slice(0, 600));
  expect(result.same).toBe(true);
  expect(result.checked.join(',')).toBe('pro,b,x,y,on,pro,b,x,y,on');
});

/**
 * Diagnostic: a slow sibling makes the concurrent hydration render yield between units of work,
 * as it does on a slow device, so tasks queued by schema-form during render can run mid-hydration.
 */
it('a Form hydrated beside slow components does not switch the root to client rendering', async () => {
  const Slow = () => {
    const end = performance.now() + 15;
    while (performance.now() < end);
    return <span>slow</span>;
  };
  const element = (
    <StrictMode>
      <Slow />
      <Form
        jsonSchema={schema}
        defaultValue={defaultValue}
        validationMode={ValidationMode.None}
      />
      <Slow />
      <Form
        jsonSchema={schema}
        defaultValue={defaultValue}
        validationMode={ValidationMode.None}
      />
      <Slow />
    </StrictMode>
  );
  const container = document.createElement('div');
  document.body.append(container);
  container.innerHTML = renderToString(element);
  const errors: string[] = [];
  const root = hydrateRoot(container, element, {
    onRecoverableError: (error) => errors.push(String(error)),
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  await act(async () => {});
  await act(async () => root.unmount());
  container.remove();
  expect(errors).toEqual([]);
});

it('a composed layout under FormProvider hydrates with the same identifiers', async () => {
  const result = await hydrate(
    <StrictMode>
      <FormProvider>
        <Form
          jsonSchema={schema}
          defaultValue={defaultValue}
          validationMode={ValidationMode.None}
        >
          <Form.Label path="/plan" />
          <Form.Input path="/plan" />
          <Form.Label path="/agree" />
          <Form.Input path="/agree" />
          <Form.Field path="/rows" />
        </Form>
      </FormProvider>
    </StrictMode>,
  );
  expect(result.errors).toEqual([]);
  expect(result.same).toBe(true);
});
