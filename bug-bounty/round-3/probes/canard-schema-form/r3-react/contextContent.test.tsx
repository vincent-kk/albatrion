import { cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, FormProvider, ValidationMode } from '@/schema-form';

afterEach(cleanup);

/**
 * expressions.md "Context (@)": when `context` changes, dependent controls expressions recompute.
 * field-input.md: context is compared by content; changed content propagates.
 */
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    advanced: {
      type: 'string',
      controls: { visible: '(@).query?.get("mode") === "advanced"' },
    },
  },
} as const;

const visibleOf = (ref: React.RefObject<FormHandle<typeof schema> | null>) =>
  ref.current!.findNode('/advanced')!.isVisible;

it('a new URLSearchParams with different content in Form context recomputes visible', () => {
  const ref = createRef<FormHandle<typeof schema>>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={ValidationMode.None}
      context={{ query: new URLSearchParams('mode=basic') }}
    />,
  );
  expect(visibleOf(ref)).toBe(false);
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={ValidationMode.None}
      context={{ query: new URLSearchParams('mode=advanced') }}
    />,
  );
  expect(visibleOf(ref)).toBe(true);
});

it('a new URLSearchParams with different content in FormProvider context recomputes visible', () => {
  const ref = createRef<FormHandle<typeof schema>>();
  const view = render(
    <FormProvider context={{ query: new URLSearchParams('mode=basic') }}>
      <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None} />
    </FormProvider>,
  );
  expect(visibleOf(ref)).toBe(false);
  view.rerender(
    <FormProvider context={{ query: new URLSearchParams('mode=advanced') }}>
      <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None} />
    </FormProvider>,
  );
  expect(visibleOf(ref)).toBe(true);
});

/** A class whose state lives in a private field and is read through a getter. */
class Session {
  readonly #role: string;
  constructor(role: string) {
    this.#role = role;
  }
  get role() {
    return this.#role;
  }
}

const roleSchema = {
  type: 'object',
  properties: {
    audit: {
      type: 'string',
      controls: { visible: '(@).session?.role === "admin"' },
    },
  },
} as const;

it('a new class instance with different private state in context recomputes visible', () => {
  const ref = createRef<FormHandle<typeof roleSchema>>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={roleSchema}
      validationMode={ValidationMode.None}
      context={{ session: new Session('viewer') }}
    />,
  );
  expect(ref.current!.findNode('/audit')!.isVisible).toBe(false);
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={roleSchema}
      validationMode={ValidationMode.None}
      context={{ session: new Session('admin') }}
    />,
  );
  expect(ref.current!.findNode('/audit')!.isVisible).toBe(true);
});

it('control: a plain string change in context recomputes visible', () => {
  const plain = {
    type: 'object',
    properties: {
      advanced: { type: 'string', controls: { visible: '@.mode === "advanced"' } },
    },
  } as const;
  const ref = createRef<FormHandle<typeof plain>>();
  const view = render(
    <Form ref={ref} jsonSchema={plain} validationMode={ValidationMode.None} context={{ mode: 'basic' }} />,
  );
  expect(ref.current!.findNode('/advanced')!.isVisible).toBe(false);
  view.rerender(
    <Form ref={ref} jsonSchema={plain} validationMode={ValidationMode.None} context={{ mode: 'advanced' }} />,
  );
  expect(ref.current!.findNode('/advanced')!.isVisible).toBe(true);
});

// Diagnostic (internal): the engine itself recomputes when it receives the new context object,
// so the stale result comes from the React-layer content snapshot.
import { setContext } from '@/schema-form/core';

it('diagnostic: engine setContext with a new URLSearchParams recomputes visible', () => {
  const ref = createRef<FormHandle<typeof schema>>();
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={ValidationMode.None}
      context={{ query: new URLSearchParams('mode=basic') }}
    />,
  );
  setContext(ref.current!.node!, { query: new URLSearchParams('mode=advanced') });
  expect(visibleOf(ref)).toBe(true);
});
