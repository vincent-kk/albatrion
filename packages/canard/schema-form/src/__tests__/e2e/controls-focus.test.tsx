import { useState } from 'react';
import { flushSync } from 'react-dom';

import { act, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, SchemaNodeEventType, SchemaNodeRequestType, VirtualizationBackfill } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Keep every observed field deferred until the public command reveals it. */
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

/** Mount a deferred field and a consumer button in the same React form. */
const mount = async () => {
  let form: FormHarness;
  let commitConsumer = () => {};
  const Consumer = () => {
    const [count, setCount] = useState(0);
    commitConsumer = () => setCount((value) => value + 1);
    return <>
      <button type="button" data-focus onClick={() => form.handle.focus('/late')}>{count}</button>
      <Form.Render>{({ Input }) => <Input />}</Form.Render>
    </>;
  };
  form = await renderForm({ type: 'object', properties: {
    early: { type: 'string' }, late: { type: 'string' },
  } }, {
    defaultValue: { early: 'E', late: 'L' }, children: <Consumer />,
    virtualization: { threshold: 1, eagerCount: 1, backfill: VirtualizationBackfill.None },
  });
  expect(form.deferred('/late')).toBe(true);
  return { form, commitConsumer: () => commitConsumer() };
};

describe('EVENT-063 / EVENT-073 — deferred focus spike dispositions', () => {
  beforeEach(() => { vi.stubGlobal('IntersectionObserver', IntersectionObserverStub); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('EVENT-063 React 핸들러 밖 focus 명령이 지연 필드를 마운트하고 입력에 도달한다', async () => {
    const { form } = await mount();
    try {
      await act(async () => { form.node('/late')!.request(SchemaNodeRequestType.Focus); });
      expect(form.exists('/late')).toBe(true);
      expect(document.activeElement).toBe(form.field('/late'));
    } finally { form.unmount(); }
  });

  it('EVENT-063 React 클릭 안의 focus 명령이 지연 필드를 마운트하고 입력에 도달한다', async () => {
    const { form } = await mount();
    try {
      fireEvent.click(form.container.querySelector('[data-focus]')!);
      await form.flush();
      expect(form.exists('/late')).toBe(true);
      expect(document.activeElement).toBe(form.field('/late'));
    } finally { form.unmount(); }
  });

  it('EVENT-073 리스너의 focus 명령 뒤 flushSync가 있어도 노출된 입력에 포커스가 도달한다', async () => {
    const { form, commitConsumer } = await mount();
    const unsubscribe = form.node('/early')!.subscribe((event) => {
      if (event.type & SchemaNodeEventType.UpdateValue) {
        form.node('/late')!.request(SchemaNodeRequestType.Focus);
        flushSync(commitConsumer);
      }
    });
    try {
      await act(async () => { form.node('/early')!.setValue('changed'); });
      expect(form.exists('/late')).toBe(true);
      expect(document.activeElement).toBe(form.field('/late'));
    } finally { unsubscribe(); form.unmount(); }
  });

  it('EVENT-073 지연 필드 리스너가 노출 상태를 flushSync해도 입력은 focus 명령을 한 번 받는다', async () => {
    const { form, commitConsumer } = await mount();
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    const unsubscribe = form.node('/late')!.subscribe((event) => {
      if (event.type & SchemaNodeEventType.RequestFocus) flushSync(commitConsumer);
    });
    try {
      await act(async () => { form.handle.focus('/late'); });
      expect(document.activeElement).toBe(form.field('/late'));
      expect(focus.mock.contexts.filter((element) => element === form.field('/late'))).toHaveLength(1);
    } finally { unsubscribe(); focus.mockRestore(); form.unmount(); }
  });
});
