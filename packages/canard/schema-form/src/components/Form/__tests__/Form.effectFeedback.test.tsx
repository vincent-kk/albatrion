import { useEffect, useLayoutEffect } from 'react';

import { describe, expect, it } from 'vitest';

import type { FormTypeInputProps } from '@/schema-form';
import { type FormHarness, renderForm } from '@/schema-form/__tests__/renderForm';

/** EVENT-070: preserve the design spike's watchdog and React-stop assertions. */
const runFeedback = async (useFeedbackEffect: typeof useEffect) => {
  let writes = 0;
  let form: FormHarness | undefined;
  const records: string[] = [];
  const watchdog = 'EVENT_070_WATCHDOG_REACHED';
  const Field = ({ node, value, path }: FormTypeInputProps) => {
    useFeedbackEffect(() => {
      writes++;
      // Continuing passive feedback must fail instead of hanging the runner.
      if (writes >= 200) throw new Error(watchdog);
      node.parentNode!.find(path === '/a' ? './b' : './a')!.setValue(Number(value ?? 0) + 1);
    }, [node, value, path]);
    return <input id={path} readOnly value={value ?? 0} />;
  };
  try {
    form = await renderForm({
      type: 'object',
      properties: {
        a: { type: 'number', presentation: { FormTypeInput: Field } },
        b: { type: 'number', presentation: { FormTypeInput: Field } },
      },
    }, {
      defaultValue: { a: 0, b: 0 },
      onError: (record) => { records.push(String(record.error)); },
    });
  } catch (error) {
    records.push(String(error));
  }
  if (form) {
    try {
      records.push(...form.caughtErrors());
      const stoppedAt = writes;
      await form.flush();
      expect(writes, 'React stopped further effect entries').toBe(stoppedAt);
    } finally {
      form.unmount();
    }
  }
  expect(writes, 'Both fields must have entered feedback').toBeGreaterThan(2);
  expect(writes, 'The watchdog is a failure, not React stopping the cycle').toBeLessThan(200);
  expect(records.join('\n')).not.toContain(watchdog);
  if (records.length) expect(records.join('\n')).toMatch(/maximum update depth|too many re-renders/i);
};

describe('EVENT-070 cross-entry feedback', () => {
  it('EVENT-070 React stops two fields writing back through useLayoutEffect', async () => {
    await runFeedback(useLayoutEffect);
  });
  it('EVENT-070 React stops two fields writing back through useEffect', async () => {
    await runFeedback(useEffect);
  });
});
