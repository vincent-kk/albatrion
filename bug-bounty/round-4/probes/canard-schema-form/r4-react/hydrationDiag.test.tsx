import { act } from '@testing-library/react';
import { StrictMode, useLayoutEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';

import { Form, ValidationMode } from '@/schema-form';

/**
 * Diagnostic for the React 18 failure of hydrationIds.test.tsx: the original helper shape
 * (hydrateRoot started outside act, then an empty act), with every observation printed.
 */
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

const read = (container: HTMLElement) =>
  [...container.querySelectorAll('[id],[for],[name]')].map((node) =>
    [
      node.getAttribute('id'),
      node.getAttribute('for'),
      node.getAttribute('name'),
    ].join('|'),
  );

/**
 * Mechanism check: started outside act, hydration waits for a Scheduler task; unmounting before
 * that task runs enqueues `element: null` on the still dehydrated root. Markup without
 * schema-form shows whether the message depends on schema-form at all.
 */
it.each([
  ['plain markup', () => <input id="plain" name="plain" defaultValue="x" />],
  [
    'two automatic Forms',
    () => (
      <>
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
      </>
    ),
  ],
])(
  '[diagnostic] unmounting %s before its hydration task runs reports the early update',
  async (_label, Content) => {
    const element = (
      <StrictMode>
        <Content />
      </StrictMode>
    );
    const container = document.createElement('div');
    document.body.append(container);
    container.innerHTML = renderToString(element);
    const before = read(container);
    const serverChecked = container.querySelectorAll('input:checked').length;
    const errors: string[] = [];
    const root = hydrateRoot(container, element, {
      onRecoverableError: (error) => errors.push(String(error)),
    });
    // What the original helper read at this point: the untouched server markup.
    const same = read(container).join() === before.join();
    const checked = [...container.querySelectorAll('input:checked')].length;
    await act(async () => root.unmount());
    container.remove();
    expect({ same, errorsBeforeUnmount: 0 }).toEqual({
      same: true,
      errorsBeforeUnmount: 0,
    });
    expect(checked).toBe(serverChecked);
    expect(errors).toEqual([
      'Error: This root received an early update, before anything was able hydrate. Switched the entire root to client rendering.',
    ]);
  },
);

it('[diagnostic] React 18 hydration of two automatic Forms in one root, started outside act', async () => {
  const commit = { done: false };
  const CommitMarker = () => {
    useLayoutEffect(() => {
      commit.done = true;
    }, []);
    return null;
  };
  const element = (
    <StrictMode>
      <CommitMarker />
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
    </StrictMode>
  );
  const container = document.createElement('div');
  document.body.append(container);
  container.innerHTML = renderToString(element);
  const serverMarkup = container.innerHTML;
  const before = read(container);
  const errors: string[] = [];
  const renderCalls: string[] = [];
  const started = performance.now();
  let reportedAt: number | undefined;
  const root = hydrateRoot(container, element, {
    onRecoverableError: (error) => {
      reportedAt ??= performance.now() - started;
      errors.push(String(error));
    },
  });
  const originalRender = root.render.bind(root);
  root.render = (children) => {
    renderCalls.push(new Error('root.render').stack ?? '');
    originalRender(children);
  };
  const beforeAct = performance.now() - started;
  await act(async () => {});
  // Whether hydration committed before the unmount below: an error reported only after this
  // point comes from unmounting a root that was still dehydrated.
  const errorsBeforeUnmount = errors.length;
  const hydratedBeforeUnmount = commit.done;
  const after = read(container);
  const checked = [...container.querySelectorAll('input:checked')].map(
    (node) => (node as HTMLInputElement).value,
  );
  const sameMarkupNodes =
    container.querySelector('form') !== null &&
    container.innerHTML.length > 0 &&
    serverMarkup.length > 0;
  await act(async () => root.unmount());
  container.remove();
  const differing = before
    .map((entry, index) => [entry, after[index]] as const)
    .filter(([left, right]) => left !== right)
    .slice(0, 6);
  const report = {
    errors,
    errorsBeforeUnmount,
    hydratedBeforeUnmount,
    same: before.join() === after.join(),
    checked,
    differing,
    counts: [before.length, after.length],
    renderCalls: renderCalls.length,
    beforeActMs: Math.round(beforeAct),
    reportedAtMs: reportedAt === undefined ? undefined : Math.round(reportedAt),
    sameMarkupNodes,
  };
  // A thrown message is printed whole; assertion messages truncate long strings.
  if (report.errors.length || !report.same || !report.hydratedBeforeUnmount)
    throw new Error('DIAG ' + JSON.stringify(report));
  expect(report.checked.join(',')).toBe('pro,b,x,y,on,pro,b,x,y,on');
});
