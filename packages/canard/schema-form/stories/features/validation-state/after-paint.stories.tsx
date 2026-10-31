// Loaded by Storybook's features CSF glob; play checks real Chromium frames.
import { useLayoutEffect, useRef } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
  ShowError,
} from '../../../src';
import { readFieldNodeRuntime } from '../../helpers/readFieldNodeRuntime';

const handles = new WeakMap<HTMLElement, FormHandle>();
const blurPending = new WeakMap<object, boolean>();
interface StoryControl {
  hold: boolean;
  pending: (() => void)[];
  onWrite?: () => void;
  started?: () => void;
}
const controls = new WeakMap<object, StoryControl>();
const Input = ({ node, value, onChange }: FieldInputProps) => (
  <input
    aria-label="code"
    value={String(value ?? '')}
    onChange={(event) => {
      controls.get(node)?.onWrite?.();
      onChange(event.target.value);
    }}
    onBlur={() =>
      blurPending.set(node, !!readFieldNodeRuntime(node).validationPending)
    }
  />
);
const Renderer = ({
  Input,
  errorVisible,
  errorMessage,
}: FieldRendererProps) => (
  <>
    <Input />
    <span data-testid="error">{errorVisible ? errorMessage : null}</span>
  </>
);
const Harness = ({
  touched = false,
  same = false,
}: {
  touched?: boolean;
  same?: boolean;
}) => {
  const element = useRef<HTMLDivElement>(null);
  const ref = useRef<FormHandle>(null);
  const control = useRef<StoryControl>({ hold: false, pending: [] });
  useLayoutEffect(() => {
    const host = element.current!;
    handles.set(host, ref.current!);
    controls.set(ref.current!.node!, control.current);
    return () => {
      handles.delete(host);
      if (ref.current?.node) controls.delete(ref.current.node);
    };
  }, []);
  return (
    <div data-cadence-harness ref={element}>
      <Form
        ref={ref}
        jsonSchema={{ type: 'string', minLength: 3 }}
        defaultValue={same ? '' : 'ab'}
        showError={touched ? ShowError.Touched : ShowError.DirtyTouched}
        FieldRenderer={Renderer}
        fieldInputMap={{ '': Input }}
        formatError={(error) => error.message ?? null}
        validatorFactory={{
          compileGuard: () => () => true,
          compile: () => (value) => {
            const result =
              String(value ?? '').length < 3
                ? [{ dataPath: '', message: 'too short' }]
                : [];
            if (!control.current.hold) return result;
            return new Promise<typeof result>((resolve) => {
              control.current.pending.push(() => resolve(result));
              control.current.started?.();
            });
          },
        }}
      />
      <button type="button">After input</button>
    </div>
  );
};
export default {
  title: 'Features/ValidationState/AfterPaint',
  component: Harness,
} satisfies Meta<typeof Harness>;
type Story = StoryObj<typeof Harness>;
const frame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Observe every error mutation and rendering opportunity from the real key through settlement. */
const check = async (canvas: HTMLElement, touched: boolean, same: boolean) => {
  const handle = handles.get(
    canvas.querySelector<HTMLElement>('[data-cadence-harness]')!,
  )!;
  await frame();
  await frame();
  const input = canvas.querySelector<HTMLInputElement>('input')!;
  if (!touched) {
    await userEvent.click(input);
    await userEvent.tab();
    await frame();
    await frame();
  }
  await userEvent.click(input);
  const error = canvas.querySelector<HTMLElement>('[data-testid="error"]')!;
  expect(error.textContent).toBe('');
  const mutations: string[] = [];
  const samples: string[] = [];
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.oldValue) mutations.push(record.oldValue);
      for (const added of record.addedNodes)
        mutations.push(added.textContent ?? '');
    }
  });
  observer.observe(error, {
    childList: true,
    characterData: true,
    characterDataOldValue: true,
    subtree: true,
  });
  let active = true;
  let frames = 0;
  const sampling = async () => {
    while (active && frames < 12) {
      await frame();
      frames++;
      samples.push(error.textContent ?? '');
    }
  };
  const control = controls.get(handle.node!)!;
  let samplingDone = Promise.resolve();
  control.hold = touched;
  const started = new Promise<void>((resolve) => {
    control.started = resolve;
  });
  control.onWrite = () => {
    control.onWrite = undefined;
    samplingDone = sampling();
  };
  try {
    await userEvent.keyboard(touched ? 'c{Tab}' : same ? 'a' : 'c');
    if (touched)
      expect(
        blurPending.get(handle.node!),
        'Tab lands while the key verdict is pending',
      ).toBe(true);
    if (touched) {
      await started;
      await frame();
      expect(handle.node!.state[2]).toBe(true);
      expect(!!readFieldNodeRuntime(handle.node!).validationPending).toBe(true);
      expect(error.textContent).toBe('');
      control.hold = false;
      control.pending.splice(0).forEach((resolve) => resolve());
    }
    for (let round = 0; round < 12; round++) {
      await frame();
      if (!!!readFieldNodeRuntime(handle.node!).validationPending) break;
    }
    expect(!!readFieldNodeRuntime(handle.node!).validationPending).toBe(false);
    if (same) {
      expect(error.textContent).toBe('too short');
      const firstShown = samples.findIndex((value) => value === 'too short');
      expect(firstShown).toBeGreaterThanOrEqual(0);
      expect(firstShown).toBeLessThan(3);
    } else {
      expect(error.textContent).toBe('');
      expect(mutations.filter(Boolean)).toEqual([]);
      expect(samples.filter(Boolean)).toEqual([]);
    }
  } finally {
    control.onWrite = undefined;
    control.started = undefined;
    control.hold = false;
    control.pending.splice(0).forEach((resolve) => resolve());
    active = false;
    await samplingDone;
    observer.disconnect();
  }
};

export const DirtyTouched: Story = {
  play: async ({ canvasElement }) => check(canvasElement, false, false),
};
export const TouchedKeyThenTab: Story = {
  args: { touched: true },
  play: async ({ canvasElement }) => check(canvasElement, true, false),
};
export const SameMessageWithinThreeFrames: Story = {
  args: { same: true },
  play: async ({ canvasElement }) => check(canvasElement, false, true),
};
