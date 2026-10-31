import * as React from 'react';
import { type ReactNode, Suspense } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import { Form, ValidationMode } from '@/schema-form';

import { settleValidation } from '../helpers/settleValidation';

/** Never-resolving work keeps a committed Suspense tree's layout effects hidden. */
const pending = new Promise<void>(() => undefined);

/**
 * Hide already committed layout effects without replacing the preserved Form load.
 * @param hidden - Whether the boundary must show its fallback.
 * @returns An empty committed sibling when the boundary may become visible.
 */
const Gate = ({ hidden }: { hidden: boolean }) => {
  if (hidden) throw pending;
  return null;
};

afterEach(() => cleanup());

it('IR-6 (d-owed) restores exactly one owed mount validation after layout effects return', async () => {
  const validate = vi.fn(() => []);
  const validator = { compile: () => validate, compileGuard: () => () => true };
  const form = (
    <Form
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.OnChange}
      validatorFactory={validator}
    />
  );
  const wrap = (hidden: boolean) => {
    if (inject('reactMajor') === '19') {
      const Activity = (
        React as typeof React & {
          Activity: React.ComponentType<{
            mode: 'hidden' | 'visible';
            children: ReactNode;
          }>;
        }
      ).Activity;
      return <Activity mode={hidden ? 'hidden' : 'visible'}>{form}</Activity>;
    }
    return (
      <Suspense fallback={<span>Loading</span>}>
        {form}
        <Gate hidden={hidden} />
      </Suspense>
    );
  };
  const view = render(wrap(false));
  view.rerender(wrap(true));
  await settleValidation();
  expect(validate).not.toHaveBeenCalled();
  view.rerender(wrap(false));
  await settleValidation();
  expect(validate).toHaveBeenCalledTimes(1);
  await settleValidation();
  expect(validate).toHaveBeenCalledTimes(1);
  view.rerender(wrap(true));
  await settleValidation();
  view.rerender(wrap(false));
  await settleValidation();
  expect(validate).toHaveBeenCalledTimes(1);
});
