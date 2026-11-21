import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  FormProvider,
  ValidationMode,
} from '../../index';

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
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={ValidationMode.None}
      />
    </FormProvider>,
  );
  expect(visibleOf(ref)).toBe(false);
  view.rerender(
    <FormProvider context={{ query: new URLSearchParams('mode=advanced') }}>
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={ValidationMode.None}
      />
    </FormProvider>,
  );
  expect(visibleOf(ref)).toBe(true);
});

/** A class whose state lives in a private field and is read through a getter. */
class Session {
  private readonly __role__: string;
  constructor(role: string) {
    this.__role__ = role;
  }
  get role() {
    return this.__role__;
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
      advanced: {
        type: 'string',
        controls: { visible: '@.mode === "advanced"' },
      },
    },
  } as const;
  const ref = createRef<FormHandle<typeof plain>>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={plain}
      validationMode={ValidationMode.None}
      context={{ mode: 'basic' }}
    />,
  );
  expect(ref.current!.findNode('/advanced')!.isVisible).toBe(false);
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={plain}
      validationMode={ValidationMode.None}
      context={{ mode: 'advanced' }}
    />,
  );
  expect(ref.current!.findNode('/advanced')!.isVisible).toBe(true);
});
