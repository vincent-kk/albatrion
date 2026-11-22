// @vitest-environment jsdom
import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import type { InputPositions } from '@/schema-form/helpers/focusTarget';

import { isInputMounted } from '../isInputMounted';

it('uses actual registered input containers and their first non-disabled focus target', () => {
  const positions: InputPositions = new Map();
  const target = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const first = document.createElement('div');
  first.innerHTML = '<input disabled><button>later</button>';
  const second = document.createElement('div');
  second.innerHTML = '<button>actual input</button>';
  expect(isInputMounted(positions, target)).toBe(false);
  positions.set(first, { node: target, focusTarget: null });
  expect(isInputMounted(positions, target)).toBe(false);
  positions.set(second, { node: target, focusTarget: null });
  expect(isInputMounted(positions, target)).toBe(true);
  positions.delete(second);
  expect(isInputMounted(positions, target)).toBe(false);
});

it('recognizes marked targets and rejects aria-disabled targets', () => {
  const target = nodeFromJSONSchema({ jsonSchema: { type: 'boolean' } });
  const container = document.createElement('div');
  container.innerHTML =
    '<div role="switch" tabindex="0" data-focus-target></div>';
  const positions: InputPositions = new Map([
    [container, { node: target, focusTarget: null }],
  ]);
  expect(isInputMounted(positions, target)).toBe(true);
  container.firstElementChild!.setAttribute('aria-disabled', 'true');
  expect(isInputMounted(positions, target)).toBe(false);
  container.innerHTML = '<button aria-disabled="true">native</button>';
  expect(isInputMounted(positions, target)).toBe(false);
  container.firstElementChild!.setAttribute('aria-disabled', 'false');
  expect(isInputMounted(positions, target)).toBe(true);
});

it('uses connected handles and keeps the native disabled check for same-document anchors', () => {
  const target = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const container = document.createElement('div');
  const native = document.createElement('input');
  const positions: InputPositions = new Map([
    [container, { node: target, focusTarget: native }],
  ]);
  expect(isInputMounted(positions, target)).toBe(false);
  document.body.append(native);
  try {
    expect(isInputMounted(positions, target)).toBe(true);
    native.disabled = true;
    expect(isInputMounted(positions, target)).toBe(false);
    positions.set(container, { node: target, focusTarget: { focus() {} } });
    expect(isInputMounted(positions, target)).toBe(true);
    const other = document.implementation.createHTMLDocument();
    const foreign = other.createElement('input');
    other.body.append(foreign);
    positions.set(container, { node: target, focusTarget: foreign });
    expect(isInputMounted(positions, target)).toBe(false);
  } finally {
    native.remove();
  }
});

it('rejects an iframe element as a focus anchor', () => {
  const target = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const container = document.createElement('div');
  const frame = document.createElement('iframe');
  document.body.append(frame);
  try {
    const iframe = frame.contentDocument!;
    const native = iframe.createElement('button');
    iframe.body.append(native);
    const positions: InputPositions = new Map([
      [container, { node: target, focusTarget: native }],
    ]);
    expect(isInputMounted(positions, target)).toBe(false);
  } finally {
    frame.remove();
  }
});
