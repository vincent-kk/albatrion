import * as React from 'react';
import { createRef, useLayoutEffect, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';
import { readFieldNodeRuntime } from '@/schema-form/__tests__/helpers/readFieldNodeRuntime';
import { settleValidation } from '@/schema-form/__tests__/helpers/settleValidation';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import { releaseFieldNodeRevealHistory } from '@/schema-form/core/engine/validation';
import {
  type FieldInputProps,
  type FieldRendererProps,
  ShowError,
} from '@/schema-form/types';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** A single pristine field exposes both display surfaces without branch rendering. */
const schema = { type: 'string' as const };
/** Keep validation unresolved so only the explicit history release can reveal. */
const pendingValidator = {
  compileGuard: () => () => true,
  compile: () => () => new Promise<readonly []>(() => undefined),
};

it('catches a display release between its held render and passive subscription', async () => {
  const ref = createRef<FormHandle>();
  const rendererVisibility: boolean[] = [];
  const inputVisibility: boolean[] = [];
  let releaseInLayout = false;
  let releases = 0;
  const Release = () => {
    useLayoutEffect(() => {
      if (!releaseInLayout || releases) return;
      const field = ref.current!.node!;
      const entry = readFieldNodeRuntime(field)
        .revealBaselineNodes?.values()
        .next().value;
      expect(entry).toBeDefined();
      expect(rendererVisibility.at(-1)).toBe(false);
      expect(inputVisibility.at(-1)).toBe(false);
      if (entry) {
        expect(entry.rootNode).toBe(field.rootNode);
        expect(entry.rootNode.runtime).toBe(readFieldNodeRuntime(field));
        releaseFieldNodeRevealHistory(entry.rootNode);
      }
      releases++;
    });
    return null;
  };
  const Renderer = ({ Input, errorVisible }: FieldRendererProps) => {
    rendererVisibility.push(errorVisible);
    return (
      <>
        <Input />
        <Release />
      </>
    );
  };
  const Input = ({ value, onChange, errorVisible }: FieldInputProps) => {
    inputVisibility.push(errorVisible);
    return (
      <input
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue=""
      showError={ShowError.Dirty}
      validationMode={ValidationMode.OnChange}
      validatorFactory={pendingValidator}
      FieldRenderer={Renderer}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: Input }]}
    />,
  );
  releaseInLayout = true;
  // Dirty's first input write holds the display; unresolved validation prevents a competing release.
  fireEvent.change(view.container.querySelector('input')!, {
    target: { value: 'x' },
  });
  expect(releases).toBe(1);
  expect(rendererVisibility.at(-1)).toBe(true);
  expect(inputVisibility.at(-1)).toBe(true);
});

it('keeps input identity, focus and both mounts through hold start and release', async () => {
  const ref = createRef<FormHandle>();
  let rendererMounts = 0;
  let inputMounts = 0;
  let rendererVisible = false;
  let inputVisible = false;
  const Renderer = ({ Input, errorVisible }: FieldRendererProps) => {
    useState(() => ++rendererMounts);
    rendererVisible = errorVisible;
    return <Input />;
  };
  const Input = ({ value, onChange, errorVisible }: FieldInputProps) => {
    useState(() => ++inputMounts);
    inputVisible = errorVisible;
    return (
      <input
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue=""
      showError={ShowError.Dirty}
      FieldRenderer={Renderer}
      validatorFactory={{
        compileGuard: () => () => true,
        compile: () => () => [],
      }}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: Input }]}
    />,
  );
  await settleValidation(() => ref.current?.node);
  const input = view.container.querySelector('input')!;
  input.focus();
  fireEvent.change(input, { target: { value: 'x' } });
  expect(rendererVisible).toBe(false);
  expect(inputVisible).toBe(false);
  expect(view.container.querySelector('input')).toBe(input);
  expect(document.activeElement).toBe(input);
  expect([rendererMounts, inputMounts]).toEqual([1, 1]);
  await settleValidation(() => ref.current?.node);
  expect(rendererVisible).toBe(true);
  expect(inputVisible).toBe(true);
  expect(view.container.querySelector('input')).toBe(input);
  expect(document.activeElement).toBe(input);
  expect([rendererMounts, inputMounts]).toEqual([1, 1]);
});

it('catches an event-free release while a held display is hidden by Activity', async (context) => {
  if (inject('reactMajor') !== '19') context.skip();
  const ref = createRef<FormHandle>();
  let rendererVisible = false;
  let inputVisible = false;
  const Renderer = ({ Input, errorVisible }: FieldRendererProps) => {
    rendererVisible = errorVisible;
    return <Input />;
  };
  const Input = ({ value, onChange, errorVisible }: FieldInputProps) => {
    inputVisible = errorVisible;
    return (
      <input
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  };
  const form = (
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue=""
      showError={ShowError.Dirty}
      validatorFactory={pendingValidator}
      FieldRenderer={Renderer}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: Input }]}
    />
  );
  const wrap = (hidden: boolean) => (
    <React.Activity mode={hidden ? 'hidden' : 'visible'}>{form}</React.Activity>
  );
  const view = render(wrap(false));
  // Freeze the state-only write's post-paint drop until the explicit release while hidden.
  createValidationFrameClock();
  act(() => ref.current!.node!.setState({ 1: true }));
  expect(rendererVisible).toBe(false);
  expect(inputVisible).toBe(false);
  const field = ref.current!.node!;
  view.rerender(wrap(true));
  const entry = readFieldNodeRuntime(field)
    .revealBaselineNodes?.values()
    .next().value;
  expect(entry).toBeDefined();
  let events = 0;
  const unsubscribe = field.subscribe(() => events++);
  act(() => {
    if (entry) {
      expect(entry.rootNode).toBe(field.rootNode);
      expect(entry.rootNode.runtime).toBe(readFieldNodeRuntime(field));
      releaseFieldNodeRevealHistory(entry.rootNode);
    }
  });
  expect(events).toBe(0);
  unsubscribe();
  view.rerender(wrap(false));
  expect(rendererVisible).toBe(true);
  expect(inputVisible).toBe(true);
});
