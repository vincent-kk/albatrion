import { StrictMode, useState } from 'react';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, inject } from 'vitest';

import { Form, type FormHandle } from '@/schema-form';

import { hideCommittedForm } from '../../helpers/hideCommittedForm';

/** Repeat a settled edit/blur before a retained producer clears the current form.
 * @param hidden - Disconnect the committed form's effects during the write.
 * @param writer - Clear through a handle/root, optionally refreshing after reveal.
 * @param blur - Include focus and blur around the user edit, settling its touched frame.
 * @param strict - Replay effects through StrictMode without changing the producer.
 * @returns Rejects with every stale DOM value from 20 fresh public-API mounts.
 */
export const exerciseHiddenBlur = async (
  hidden: boolean,
  writer: 'setValue' | 'reset' | 'node' | 'refresh',
  blur = true,
  strict = false,
) => {
  const failures: unknown[] = [];
  let staleAfterTimeout = false;
  const settle = (milliseconds: number) =>
    act(async () => {
      await new Promise((resolve) => setTimeout(resolve, milliseconds));
    });
  for (let run = 0; run < 20; run += 1) {
    let handle!: FormHandle;
    const schema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    } as const;
    const Harness = () => {
      const [visible, setVisible] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setVisible(false)}>
            Hide
          </button>
          <button type="button" onClick={() => setVisible(true)}>
            Show
          </button>
          <button
            type="button"
            onClick={() => {
              if (writer === 'reset') handle.reset();
              else if (writer === 'node') handle.node!.setValue({});
              else handle.setValue({});
            }}
          >
            Write
          </button>
          {hideCommittedForm(
            <Form
              ref={(current) => {
                if (current) handle = current;
              }}
              jsonSchema={schema}
            />,
            !visible,
          )}
        </>
      );
    };
    const view = render(
      strict ? (
        <StrictMode>
          <Harness />
        </StrictMode>
      ) : (
        <Harness />
      ),
    );
    const input = () =>
      view.container.querySelector<HTMLInputElement>('[data-path="/a"] input')!;
    const user = userEvent.setup();
    await settle(50);
    if (blur) fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: 'Hello' } });
    if (blur) fireEvent.blur(input());
    await settle(50);
    expect(handle.getValue()).toEqual({ a: 'Hello' });
    if (hidden) await user.click(view.getByRole('button', { name: 'Hide' }));
    await settle(50);
    await user.click(view.getByRole('button', { name: 'Write' }));
    expect(handle.getValue()).toEqual({});
    expect(handle.findNode('/a')!.value).toBeUndefined();
    if (hidden) await user.click(view.getByRole('button', { name: 'Show' }));
    if (writer === 'refresh') act(() => handle.refresh());
    await settle(100);
    if (input().value !== '') {
      failures.push({ run, actual: input().value, model: handle.getValue() });
      if (failures.length === 1)
        await waitFor(() => expect(input().value).toBe(''), {
          timeout: 1100,
        }).catch(() => {
          staleAfterTimeout = true;
        });
    } else {
      fireEvent.change(input(), { target: { value: 'after' } });
      expect(handle.getValue()).toEqual({ a: 'after' });
    }
    view.unmount();
  }
  console.info(
    `hidden-blur React ${inject('reactMajor')} hidden=${hidden} ${writer} blur=${blur} strict=${strict}: ${failures.length}/20 failures; staleAfter1100ms=${staleAfterTimeout}`,
  );
  expect(failures).toEqual([]);
};
