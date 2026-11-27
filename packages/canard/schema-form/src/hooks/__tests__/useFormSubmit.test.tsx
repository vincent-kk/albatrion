import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';

import { hideCommittedForm } from '../../__tests__/helpers/hideCommittedForm';
import { useFormSubmit } from '../form/useFormSubmit';

afterEach(cleanup);

it.each([true, false])(
  'rechecks submit pending=%s after the consumer reconnects',
  async (pending) => {
    const ref = createRef<FormHandle>();
    let finish!: () => void;
    let operation!: ReturnType<FormHandle['submit']>;
    const submitted = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const form = (
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        validationMode={ValidationMode.None}
        onSubmit={() => submitted}
      >
        <span />
      </Form>
    );
    const Probe = ({ tick }: { tick: number }) => {
      const { pending } = useFormSubmit(ref);
      return <output data-tick={tick}>{String(pending)}</output>;
    };
    const tree = (tick: number, hidden: boolean) => (
      <>
        {form}
        {hideCommittedForm(probe[tick], hidden)}
      </>
    );
    const probe = [
      <Probe key="probe" tick={0} />,
      <Probe key="probe" tick={1} />,
    ];
    const view = render(tree(0, false));
    if (!pending)
      await act(async () => {
        operation = ref.current!.submit();
      });
    view.rerender(tree(1, false));
    view.rerender(tree(1, true));
    await act(async () => {
      if (pending) operation = ref.current!.submit();
      else {
        finish();
        await operation;
      }
    });
    expect(ref.current!.submit.pending).toBe(pending);
    view.rerender(tree(1, false));
    expect(view.container.querySelector('output')!.textContent).toBe(
      String(pending),
    );
    await act(async () => {
      finish();
      await operation;
    });
  },
);
