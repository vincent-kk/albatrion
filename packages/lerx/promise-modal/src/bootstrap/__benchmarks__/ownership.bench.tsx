// Loaded by Vitest bench; setup and disposal stay outside timed ownership samples.
import {
  type RenderResult,
  act,
  cleanup,
  render,
} from '@testing-library/react';
import { afterAll, bench, describe, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { confirmHandler } from '@/promise-modal/core';

import { BootstrapProvider } from '../BootstrapProvider';

/** Stable options keep provider configuration out of the measured work. */
const options = { duration: 0 };
/** Each handoff sample starts with an owner and a waiting provider. */
let view: RenderResult;
/** Duplicate-provider warnings are expected during ownership measurements. */
const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
afterAll(() => warning.mockRestore());

describe('ownership', () => {
  bench(
    'open and destroy',
    () => {
      act(() => {
        confirmHandler({}).modalNode!.onDestroy();
      });
    },
    {
      time: 1000,
      iterations: 100,
      warmupIterations: 10,
      setup: () => {
        render(<BootstrapProvider options={options} />);
      },
      teardown: () => {
        cleanup();
        ModalManager.reset();
      },
    },
  );
  bench(
    'queued owner handoff',
    () => {
      view.rerender(<BootstrapProvider key="waiter" options={options} />);
    },
    {
      time: 1000,
      iterations: 100,
      warmupIterations: 10,
      setup: (task) => {
        // Vitest 4.1.12 omits FnOptions when constructing Tinybench 2.9.0 tasks.
        // Install per-iteration hooks here so setup and disposal are not timed.
        task.bench.throws = true;
        task.opts.beforeEach = () => {
          view = render(
            <>
              <BootstrapProvider key="owner" options={options} />
              <BootstrapProvider key="waiter" options={options} />
            </>,
          );
          view.rerender(
            <>
              <BootstrapProvider key="owner" root={null} options={options} />
              <BootstrapProvider key="waiter" options={options} />
            </>,
          );
          confirmHandler({});
          if (ModalManager.prerender.length !== 1)
            throw new Error(
              'Expected one queued request before owner handoff.',
            );
        };
        task.opts.afterEach = () => {
          cleanup();
          ModalManager.reset();
        };
      },
    },
  );
});
