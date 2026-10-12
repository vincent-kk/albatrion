import { Profiler } from 'react';

import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  type FormScenario,
  eventsFeatureScenarios,
  renderCommitStages,
  subscriptionStages,
} from '@aileron/schema-form-scenarios';

import { Form, type JSONSchema, SchemaNodeEventType, ValidationMode, isArrayNode } from '@/schema-form';

import { renderForm } from '../renderForm';

// Consumer-only checks for events cases: node subscriptions by event kind and React commits per write.

/**
 * Find an events scenario by name.
 * @param name - Stable scenario name.
 * @returns The scenario; throws when the data was renamed.
 */
const scenarioNamed = (name: string): FormScenario => {
  const scenario = eventsFeatureScenarios.find((item) => item.name === name);
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  return scenario;
};

/**
 * Name every SchemaNodeEventType bit carried by the received event types.
 * @param types - Event type bit masks in arrival order.
 * @returns Member names of the bits present in any mask, in declaration order.
 */
const readEventNames = (types: readonly number[]): string[] => {
  const union = types.reduce((all, type) => all | type, 0);
  return Object.entries(SchemaNodeEventType).flatMap(([name, bit]) => (typeof bit === 'number' && union & bit ? [name] : []));
};

// it.fails passes on any throw, so a renamed or dropped commit scenario must fail loudly here instead.
if (!eventsFeatureScenarios.some((item) => item.name === 'events.render-commits')) throw new Error('Missing scenario: events.render-commits');

/**
 * Write renderCommitStages and compare the React commits below the group with the expected counts.
 * @param validated - Whether OnChange validation runs; otherwise the mode is None.
 * @returns Completion after every stage was compared; throws on the first mismatch.
 */
const expectCommits = async (validated: boolean) => {
  const scenario = scenarioNamed('events.render-commits');
  let commits = 0;
  const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true,
    ...(!validated && { validationMode: ValidationMode.None }),
    children: () => <Profiler id="group" onRender={() => { commits++; }}><Form.Group /></Profiler> });
  try {
    for (const stage of renderCommitStages) {
      await form.flush();
      const start = commits;
      act(() => {
        if (stage.batch) form.handle.node!.batch(() => { for (const [key, value] of Object.entries(stage.value)) form.node(`/${key}`)!.setValue(value); });
        else form.handle.setValue(stage.value);
      });
      await form.flush();
      expect({ commits: commits - start, value: form.getValue() }, stage.label).toEqual({ commits: validated ? stage.commitsWithValidation : stage.commits, value: stage.value });
    }
  } finally {
    form.unmount();
  }
};

describe('features — events consumer-only', () => {
  it('EVENT-001 and EVENT-012 node.subscribe receives the event kind of each change, and state writes and commands are not value writes', async () => {
    const scenario = scenarioNamed('events.subscription-kinds');
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true });
    try {
      for (const [index, stage] of subscriptionStages.entries()) {
        const node = form.node(stage.path)!;
        const received: number[] = [];
        const stop = node.subscribe((event) => { received.push(event.type); });
        if (stage.unsubscribed) stop();
        const changeStart = form.changeLog().length;
        if (stage.act === 'validate') await form.validate();
        else
          act(() => {
            if (stage.act === 'setValue') node.setValue(stage.value);
            else if (stage.act === 'setState') node.setState({ touched: true });
            else if (stage.act === 'focus') form.handle.focus(stage.path);
            else if (stage.act === 'refresh') form.handle.refresh(stage.path);
            else if (isArrayNode(node)) node.push(stage.value);
          });
        await form.flush(20);
        stop();
        const names = readEventNames(received);
        const label = `stage ${index} ${stage.act} ${stage.path}`;
        expect(stage.includes.filter((name) => !names.includes(name)), `${label} missing kinds`).toEqual([]);
        expect(stage.excludes.filter((name) => names.includes(name)), `${label} forbidden kinds`).toEqual([]);
        if (stage.unsubscribed) expect(received, `${label} after unsubscribe`).toEqual([]);
        expect(form.changeLog().length - changeStart, `${label} onChange calls`).toBe(stage.changes);
      }
    } finally {
      form.unmount();
    }
  });

  it('EVENT-002 and EVENT-004 one write or one batch is one React commit below the group, and an unchanged write commits nothing', async () => {
    await expectCommits(false);
  });

  it.fails('Finding (round 207): an OnChange validation whose result stays empty adds a second commit instead of keeping the reference (GOAL-011)', async () => {
    await expectCommits(true);
  });
});
