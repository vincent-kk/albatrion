// Loaded by Storybook CSF; named exports are the U11 Chromium gates.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { cdp, page as browserPage } from '@vitest/browser/context';
import type {} from '@vitest/browser/providers/playwright';

import { BrowserGateForm } from '../components/gates/BrowserGateForm';
import type { BrowserGateElement } from '../components/gates/types';

export default { title: 'Scenarios/Browser gates', component: BrowserGateForm } satisfies Meta<typeof BrowserGateForm>;
type Story = StoryObj<typeof BrowserGateForm>;

/** Wait for the browser's React commit without replacing real input events. */
const committed = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Read the handle installed by the fixture's committed layout effect. */
const fixture = (canvas: HTMLElement) => {
  const root = canvas.querySelector<BrowserGateElement>('[data-browser-gate]')!;
  if (!root.gate) throw new Error('Browser gate handle is not mounted');
  return { root, ...root.gate };
};

/** EVENT-065: CDP performs actual Korean IME composition in Chromium. */
export const ImeComposition: Story = {
  name: 'EVENT-065 Korean IME plain, caret formatter and Refresh during composition',
  args: { mode: 'ime' },
  play: async ({ canvasElement }) => {
    const { handle, observations } = fixture(canvasElement);
    const session = cdp();
    for (const path of ['/plain', '/formatter', '/refresh']) {
      const input = canvasElement.querySelector<HTMLInputElement>(`input[id="${path}"]`)!;
      await browserPage.elementLocator(input).click();
      let composing = false;
      let setterCalls = 0;
      let ends = 0;
      const descriptor = Object.getOwnPropertyDescriptor(input, 'value')
        ?? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!;
      const ownDescriptor = Object.getOwnPropertyDescriptor(input, 'value');
      const start = () => { composing = true; };
      const end = () => { composing = false; ends++; };
      input.addEventListener('compositionstart', start);
      input.addEventListener('compositionend', end);
      Object.defineProperty(input, 'value', {
        configurable: true,
        get: () => descriptor.get!.call(input),
        set: (value: string) => {
          if (composing) setterCalls++;
          descriptor.set!.call(input, value);
        },
      });
      const before = observations.changes.length;
      const oldBinding = handle.findNode(path)!;
      try {
        for (const text of ['ㄱ', '가', '각']) {
          await session.send('Input.imeSetComposition', { text, selectionStart: text.length, selectionEnd: text.length });
          if (path === '/refresh' && text === '가') handle.refresh(path);
          await committed();
          await expect(input.value, JSON.stringify({ path, composing, setterCalls, ends, active: (document.activeElement as HTMLInputElement)?.id })).toBe(text);
          await expect(input.selectionStart).toBe(text.length);
          await expect(input.selectionEnd).toBe(text.length);
          await expect(composing).toBe(true);
          await expect(ends).toBe(0);
          await expect(canvasElement.querySelector(`input[id="${path}"]`)).toBe(input);
          await expect(setterCalls).toBe(0);
          await expect(observations.changes.length).toBe(before);
        }
        await session.send('Input.insertText', { text: '각' });
        await committed();
        await expect(ends).toBe(1);
        if (path === '/refresh') {
          await expect(oldBinding.value).toBe('');
          await expect(handle.findNode(path)!.value).toBe('');
        } else {
          await expect(handle.findNode(path)!.value).toBe('각');
          await expect(input.value).toBe('각');
        }
      } finally {
        await session.send('Input.imeSetComposition', { text: '', selectionStart: 0, selectionEnd: 0 });
        input.removeEventListener('compositionstart', start);
        input.removeEventListener('compositionend', end);
        if (ownDescriptor) Object.defineProperty(input, 'value', ownDescriptor);
        else Reflect.deleteProperty(input, 'value');
      }
    }
  },
};

/** REACT-027: an incomplete exponent is a native number-input badInput draft. */
export const NumberBadInput: Story = {
  name: 'REACT-027 number badInput stays local and blur restores node display',
  args: { mode: 'number' },
  play: async ({ canvasElement }) => {
    const { handle } = fixture(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="number"]')!;
    await userEvent.clear(input);
    await expect(handle.getValue()).toBeUndefined();
    await userEvent.type(input, '1');
    await expect(handle.getValue()).toBe(1);
    await cdp().send('Input.insertText', { text: 'e' });
    await expect(input.validity.badInput).toBe(true);
    await expect(handle.getValue()).toBe(1);
    await userEvent.tab();
    await expect(input.value).toBe('1');
    await expect(input.validity.badInput).toBe(false);
    await expect(handle.getValue()).toBe(1);
  },
};

/** REACT-028: reset uses committed child-proxy presence under StrictMode. */
export const InputRemountJudgment: Story = {
  name: 'REACT-028 reset and Refresh remount judgment in StrictMode and virtualization',
  args: { mode: 'remount' },
  play: async ({ canvasElement }) => {
    const { handle, observations } = fixture(canvasElement);
    const rootContainer = canvasElement.querySelector('[data-container=""]');
    const branch = canvasElement.querySelector('[data-container="/branch"]');
    const terminal = canvasElement.querySelector('input[id="/terminal"]');
    const whole = canvasElement.querySelector('input[id="/whole"]');
    const collapsed = canvasElement.querySelector('input[id="/collapsed"]');
    const empty = canvasElement.querySelector('[data-container="/empty"]');
    const deferred = canvasElement.querySelector<HTMLElement>('[data-deferred][data-path^="/virtual/"]');
    await expect(deferred).not.toBeNull();
    const virtualPath = deferred!.dataset.path!;
    handle.refresh(virtualPath);
    await committed();
    await expect(canvasElement.querySelector(`[data-path="${virtualPath}"][data-deferred]`)).not.toBeNull();
    handle.focus(virtualPath);
    await waitFor(() => expect(canvasElement.querySelector(`input[id="${virtualPath}"]`)).not.toBeNull());
    const virtualInput = canvasElement.querySelector(`input[id="${virtualPath}"]`);
    const before = { ...observations.mounts };
    handle.reset();
    await committed();
    await expect(canvasElement.querySelector('[data-container=""]')).toBe(rootContainer);
    await expect(canvasElement.querySelector('[data-container="/branch"]')).toBe(branch);
    await expect(canvasElement.querySelector('input[id="/terminal"]')).not.toBe(terminal);
    await expect(canvasElement.querySelector('input[id="/whole"]')).not.toBe(whole);
    await expect(canvasElement.querySelector('input[id="/collapsed"]')).not.toBe(collapsed);
    await expect(canvasElement.querySelector('[data-container="/empty"]')).not.toBe(empty);
    await expect(canvasElement.querySelector(`input[id="${virtualPath}"]`)).not.toBe(virtualInput);
    await expect(observations.mounts['']).toBe(before['']);
    await expect(observations.mounts['/branch']).toBe(before['/branch']);
    await expect(observations.mounts['/terminal']).toBeGreaterThan(before['/terminal']);
    const stale = observations.inputs['/terminal'];
    handle.refresh('/terminal');
    stale.onChange('stale');
    await committed();
    await expect(handle.findNode('/terminal')!.value).toBe('initial');
  },
};

/** 18C-73: record the cost of repeated detected reads without inventing a budget. */
export const EmptyChildDetectionCost: Story = {
  name: '18C-73 empty ChildNodeComponents detection cost',
  args: { mode: 'cost' },
  play: async ({ canvasElement }) => {
    const { root, observations } = fixture(canvasElement);
    await waitFor(() => expect(observations.childReads.length).toBeGreaterThan(0));
    await expect(observations.warnings.filter((code) => code === 'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL')).toHaveLength(1);
    for (const sample of observations.childReads) {
      await expect(sample.reads).toBe(100_000);
      await expect(Number.isFinite(sample.detectedMs)).toBe(true);
      await expect(Number.isFinite(sample.plainMs)).toBe(true);
    }
    const output = document.createElement('output');
    output.setAttribute('aria-label', 'ChildNodeComponents detection timing');
    output.textContent = JSON.stringify(observations.childReads);
    root.append(output);
    console.info('18C-73 detection timing', observations.childReads);
  },
};
