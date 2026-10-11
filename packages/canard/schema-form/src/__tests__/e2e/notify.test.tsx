import { Profiler, useState } from 'react';
import { flushSync } from 'react-dom';

import { findScenarioHandle, notifyScenarios, playScenario, registerScenarioHandle } from '@aileron/schema-form-scenarios';
import { act } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, SchemaNodeEventType, ValidationMode, type FormTypeInputProps, type JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

for (const scenario of notifyScenarios) it(`EVENT-002 ${scenario.name}`, async () => {
  const validate = vi.fn(() => null);
  form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validatorFactory: { compile: () => validate, compileGuard: () => () => true }, validationMode: ValidationMode.OnChange });
  const base = findScenarioHandle(form.container).adapter;
  let deliveries: string[] = [];
  let requests = 0;
  const stops = ['', '/first', '/second'].flatMap((path) => {
    const node = form.node(path);
    return node ? [node.subscribe((event) => { if (event.type & SchemaNodeEventType.UpdateValue) deliveries.push(path); })] : [];
  });
  const unregister = registerScenarioHandle(form.container, form.handle, {
    async execute(step) { deliveries = []; requests = validate.mock.calls.length; await base.execute(step); },
    settle: base.settle,
    async assert(observation) {
      const { deliveryOrder, validationRequestCount, ...rest } = observation;
      await base.assert(rest);
      if (deliveryOrder) expect(deliveries).toEqual(deliveryOrder);
      if (validationRequestCount !== undefined) expect(validate.mock.calls.length - requests).toBe(validationRequestCount);
    },
  });
  try { await playScenario(scenario, form.container); }
  finally { stops.forEach((stop) => stop()); unregister(); }
});

/** Render a real subscription per field and count commits above the whole group. */
async function mountSubscribers(count: number) {
  let commits = 0;
  let bump = () => {};
  const Sibling = () => { const [value, setValue] = useState(0); bump = () => setValue((old) => old + 1); return <output data-sibling>{value}</output>; };
  const Input = ({ path, value }: FormTypeInputProps) => <input id={path} value={value ?? ''} readOnly />;
  const properties = Object.fromEntries(Array.from({ length: count }, (_, index) => [`f${index}`, { type: 'number' }]));
  const initial = Object.fromEntries(Array.from({ length: count }, (_, index) => [`f${index}`, 0]));
  form = await renderForm({ type: 'object', properties } as JSONSchema, {
    defaultValue: initial,
    formTypeInputDefinitions: [{ test: { type: 'number' }, Component: Input }],
    children: <Profiler id="subscribers" onRender={() => { commits++; }}><Form.Group /><Sibling /><button type="button" onClick={() => writeAll()}>write</button></Profiler>,
  });
  const nodes = Array.from({ length: count }, (_, index) => form.node(`/f${index}`)!);
  const writeAll = () => nodes.forEach((node) => node.setValue(1));
  const before = commits;
  return { writeAll, nodes, bump: () => bump(), commits: () => commits - before,
    assertDOM: () => { const fields = form.container.querySelectorAll('input'); expect(fields.length).toBe(count); expect(Array.from(fields).filter((field) => field.value !== '1')).toEqual([]); } };
}

it('EVENT-002 한 React 클릭의 1,000개 쓰기가 한 커밋에서 모든 입력에 반영된다', async () => {
  const probe = await mountSubscribers(1000);
  await form.user.click(form.container.querySelector('button')!);
  probe.assertDOM();
  expect(probe.commits()).toBe(1);
}, 60000);

it('EVENT-002 act 밖 네이티브 클릭의 1,000개 쓰기가 한 커밋으로 반영된다', async () => {
  const probe = await mountSubscribers(1000);
  const button = document.createElement('button');
  button.addEventListener('click', probe.writeAll);
  button.click();
  await form.flush();
  probe.assertDOM();
  expect(probe.commits()).toBe(1);
}, 60000);

it('EVENT-004 batch의 1,000개 쓰기는 한 통지 순회와 한 React 커밋으로 반영된다', async () => {
  const probe = await mountSubscribers(1000);
  const deliveries: string[] = [];
  const stops = [form.handle.node!, ...probe.nodes].map((node) => node.subscribe((event) => { if (event.type & SchemaNodeEventType.UpdateValue) deliveries.push(node.path); }));
  await act(async () => form.handle.node!.batch(probe.writeAll));
  stops.forEach((stop) => stop());
  expect(deliveries).toEqual(['', ...probe.nodes.map((node) => node.path)]);
  probe.assertDOM();
  expect(probe.commits()).toBe(1);
}, 60000);

it('EVENT-008 리스너 되먹임의 두 파동 뒤 최종 값이 찢어짐과 snapshot 경고 없이 반영된다', async () => {
  const probe = await mountSubscribers(2);
  const stop = probe.nodes[0].subscribe((event) => { if (event.type & SchemaNodeEventType.UpdateValue) probe.nodes[1].setValue(1); });
  await act(async () => probe.nodes[0].setValue(1));
  stop();
  probe.assertDOM();
  expect(form.caughtErrors().filter((message) => /snapshot|tear/i.test(message))).toEqual([]);
});

it('EVENT-007 10,000개 구독 필드의 루트 전체 쓰기 뒤 DOM에 이전 값이 남지 않는다', async () => {
  const probe = await mountSubscribers(10000);
  await form.setValue(Object.fromEntries(probe.nodes.map((node) => [node.name, 1])));
  probe.assertDOM();
}, 120000);

it('EVENT-007 리스너가 다른 컴포넌트를 flushSync해도 배달 뒤 모든 필드가 최종 커밋 값을 보인다', async () => {
  const probe = await mountSubscribers(2);
  const stop = probe.nodes[0].subscribe((event) => { if (event.type & SchemaNodeEventType.UpdateValue) flushSync(probe.bump); });
  await act(async () => form.handle.node!.batch(probe.writeAll));
  stop();
  probe.assertDOM();
  expect(form.container.querySelector('[data-sibling]')?.textContent).toBe('1');
});

it('EVENT-007 revision 일괄 증가 뒤 파동 중 flushSync에서도 1,000개 필드의 최종 DOM이 일치한다', async () => {
  const probe = await mountSubscribers(1000);
  const stop = probe.nodes[0].subscribe((event) => { if (event.type & SchemaNodeEventType.UpdateValue) flushSync(probe.bump); });
  await act(async () => form.handle.node!.batch(probe.writeAll));
  stop();
  probe.assertDOM();
}, 60000);

it('EVENT-002 flushSync 없는 한 핸들러의 1,000개 필드 변경은 한 React 커밋이다', async () => {
  const probe = await mountSubscribers(1000);
  await act(async () => probe.writeAll());
  probe.assertDOM();
  expect(probe.commits()).toBe(1);
}, 60000);

it('EVENT-005 루트 구독 부모와 필드 구독 자식이 같은 최종 값을 렌더한다', async () => {
  form = await renderForm({ type: 'object', properties: { f0: { type: 'number' } } }, { defaultValue: { f0: 0 }, children: ({ value }) => <><output>{JSON.stringify(value)}</output><Form.Input path="/f0" /></> });
  await form.setValue({ f0: 1 });
  expect(form.container.querySelector('output')?.textContent).toBe('{"f0":1}');
  expect(form.value('/f0')).toBe('1');
});

it('EVENT-007 루트 리스너의 flushSync 뒤에도 자식 DOM이 최종 값과 일치한다', async () => {
  const probe = await mountSubscribers(2);
  const stop = form.handle.node!.subscribe((event) => { if (event.type & SchemaNodeEventType.UpdateValue) flushSync(probe.bump); });
  await form.setValue({ f0: 1, f1: 1 });
  stop();
  probe.assertDOM();
});

it('EVENT-002 10,000개 동기 구독 필드의 한 핸들러 변경이 한 React 커밋으로 배달된다', async () => {
  const probe = await mountSubscribers(10000);
  await act(async () => form.handle.node!.batch(probe.writeAll));
  probe.assertDOM();
  expect(probe.commits()).toBe(1);
}, 120000);
