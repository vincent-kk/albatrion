// Port of round 4 `optionIdentifiers.test.tsx`, "IN3: inserting an item at index 0 ..." (watch-list point: DOM ids,
// option ids and radio names). Only `nativeChecked` changed, to read DOM position instead of parsing ids.
// The second test is an RG1 neighbor: each item keeps a distinct native radio group name.
import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type ArrayNode,
  Form,
  type FormHandle,
  type JSONSchema,
} from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

/**
 * Natively checked radios, as `<item path>-<option index>`, read from DOM position: the round 4
 * probe parsed option ids, which the round 4 identifier design made opaque.
 */
const nativeChecked = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[data-path]"))
    .filter((element) => /^\/plans\/\d+$/.test(element.getAttribute("data-path")!))
    .flatMap((element) =>
      Array.from(element.querySelectorAll<HTMLInputElement>("input[type=radio]"))
        .map((input, index) => (input.checked ? `${element.getAttribute("data-path")}-${index}` : null))
        .filter((entry): entry is string => entry !== null),
    );

/** Native radio group names per item; each item must own a distinct group. */
const groupNames = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[data-path]"))
    .filter((element) => /^\/plans\/\d+$/.test(element.getAttribute("data-path")!))
    .map((element) => [...new Set(Array.from(element.querySelectorAll<HTMLInputElement>("input[type=radio]")).map((input) => input.name))]);

it('IN3: inserting an item at index 0 keeps every loaded radio selection natively checked', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          plans: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['basic', 'pro'],
              presentation: { inputType: 'radio' },
            },
          },
        },
      }}
      defaultValue={{ plans: ['basic', 'pro'] }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(nativeChecked(container)).toEqual(['/plans/0-0', '/plans/1-1']);
  await act(async () => {
    (ref.current!.findNode('/plans') as ArrayNode).insert(0, 'pro');
    await Promise.resolve();
  });
  expect(ref.current!.getValue()).toEqual({ plans: ['pro', 'basic', 'pro'] });
  expect(nativeChecked(container)).toEqual([
    '/plans/0-1',
    '/plans/1-0',
    '/plans/2-1',
  ]);
});

it('IN3: after the insert every item keeps its own native radio group name', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          plans: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['basic', 'pro'],
              presentation: { inputType: 'radio' },
            },
          },
        },
      }}
      defaultValue={{ plans: ['basic', 'pro'] }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(nativeChecked(container)).toEqual(['/plans/0-0', '/plans/1-1']);
  await act(async () => {
    (ref.current!.findNode('/plans') as ArrayNode).insert(0, 'pro');
    await Promise.resolve();
  });
  expect(ref.current!.getValue()).toEqual({ plans: ['pro', 'basic', 'pro'] });
  const names = groupNames(container);
  expect(names.every((list) => list.length === 1 && list[0] !== '')).toBe(true);
  expect(new Set(names.map((list) => list[0])).size).toBe(3);
});
