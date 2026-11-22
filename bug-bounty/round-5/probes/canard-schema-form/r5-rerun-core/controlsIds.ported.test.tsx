import { type ReactElement, StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Root, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '@/schema-form';

/**
 * Ports of control tests that the round 4 identifier design broke (they selected
 * `input[id="<path>"]` or compared ids with paths):
 * - r2-react/composition.test.tsx "Form.Input follows a changed path prop and writes to the new field"
 *   (the id expectation becomes: the id changes and the label still names the input);
 * - r2-react/unionInput.test.tsx (both rows);
 * - r2-react/ssr.test.tsx "hydrated inputs accept typing, report onChange and keep the server DOM nodes";
 * - r3-react/jsdocExamples.test.tsx "control: format password in the schema renders a masked input".
 * Elements are found through `data-path` wrappers; assertions are otherwise unchanged.
 */

let root: Root | undefined;
afterEach(async () => {
  cleanup();
  await act(async () => root?.unmount());
  root = undefined;
  vi.restoreAllMocks();
});

const inputAt = (scope: ParentNode, path: string) =>
  Array.from(scope.querySelectorAll<HTMLElement>('[data-path]'))
    .find((element) => element.getAttribute('data-path') === path)
    ?.querySelector<HTMLInputElement>('input') ?? null;

it('Form.Input follows a changed path prop and writes to the new field', async () => {
  const schema = {
    type: 'object',
    properties: { a: { type: 'string', default: 'A' }, b: { type: 'string', default: 'B' } },
  } as const;
  const ref = createRef<FormHandle>();
  const user = userEvent.setup();
  const tree = (path: string) => (
    <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None}>
      <Form.Label path={path} />
      <Form.Input path={path} />
    </Form>
  );
  const view = render(tree('/a'));
  const firstId = (view.container.querySelector('input') as HTMLInputElement).id;
  view.rerender(tree('/b'));
  const input = view.container.querySelector('input') as HTMLInputElement;
  expect(input.id).not.toBe(firstId);
  expect(input.value).toBe('B');
  expect(view.container.querySelector('label')?.getAttribute('for')).toBe(input.id);
  await user.clear(input);
  await user.type(input, 'x');
  expect(ref.current!.getValue()).toEqual({ a: 'A', b: 'x' });
});

it.for([false, true])(
  'built-in union input follows a programmatic write after the user typed (StrictMode=%s)',
  async (strict) => {
    const schema = { type: 'object', properties: { u: { type: ['string', 'number'] } } } as const;
    const ref = createRef<FormHandle>();
    const user = userEvent.setup();
    const form = <Form ref={ref} jsonSchema={schema as any} validationMode={ValidationMode.None} />;
    const { container } = render(strict ? <StrictMode>{form}</StrictMode> : form);
    const input = () => inputAt(container, '/u') as HTMLInputElement;
    await user.click(input());
    await user.type(input(), 'abc');
    await user.tab();
    expect(ref.current!.getValue()).toEqual({ u: 'abc' });
    await act(async () => {
      ref.current!.setValue({ u: 5 });
    });
    expect(ref.current!.getValue()).toEqual({ u: 5 });
    expect(input().value).toBe('5');
  },
);

it.for([false, true])(
  'hydrated inputs accept typing, report onChange and keep the server DOM nodes (StrictMode=%s)',
  async (strict) => {
    const recoverable: string[] = [];
    const consoleErrors: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      consoleErrors.push(args.map((a) => String(a).split('\n')[0]).join(' '));
    });
    const container = document.createElement('div');
    document.body.append(container);
    const ref = createRef<FormHandle>();
    const changes: unknown[] = [];
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', default: 'n' },
        list: { type: 'array', items: { type: 'string' }, default: ['a'] },
      },
    } as const;
    const form = (
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={ValidationMode.None}
        onChange={(v) => changes.push(v)}
      />
    );
    const element: ReactElement = strict ? <StrictMode>{form}</StrictMode> : form;
    container.innerHTML = renderToString(element);
    consoleErrors.length = 0;
    await act(async () => {
      root = hydrateRoot(container, element, {
        onRecoverableError: (error) => recoverable.push(String(error).split('\n')[0]),
      });
    });
    const input = inputAt(container, '/name') as HTMLInputElement;
    const user = userEvent.setup();
    await user.type(input, 'X');
    expect(inputAt(container, '/name')).toBe(input);
    expect(ref.current!.getValue()).toEqual({ name: 'nX', list: ['a'] });
    expect(changes.at(-1)).toEqual({ name: 'nX', list: ['a'] });
    await user.click(container.querySelector('button[title="add item"]')!);
    expect([inputAt(container, '/list/0'), inputAt(container, '/list/1')].every(Boolean)).toBe(true);
    expect({ recoverable, consoleErrors }).toEqual({ recoverable: [], consoleErrors: [] });
    container.remove();
  },
);

it('control: format password in the schema renders a masked input', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties: { password: { type: 'string', format: 'password' } } } as const}
      validationMode={ValidationMode.None}
    />,
  );
  expect(inputAt(view.container, '/password')!.type).toBe('password');
});
