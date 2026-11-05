// @vitest-environment jsdom
// Loaded by vitest.bench.config.ts; per-sample hooks exclude preparation and disposal.
import { fireEvent } from '@testing-library/dom';
import { flushSync } from 'react-dom';
import { afterAll, bench, describe, expect, vi } from 'vitest';

import { VirtualizationBackfill } from '@/schema-form/helpers/virtualization';

import { BenchIntersectionObserver } from './helpers/BenchIntersectionObserver';
import { LifecycleBenchForm } from './helpers/LifecycleBenchForm';
import {
  arraySchema,
  flatSchema,
  nestedSchema,
} from './helpers/lifecycleSchemas';
import { sampleOptions } from './helpers/sampleOptions';

if (typeof document === 'undefined')
  throw new Error('fieldLifecycle requires a DOM');
vi.stubGlobal('IntersectionObserver', BenchIntersectionObserver);
afterAll(() => vi.unstubAllGlobals());

/** Only intersection callbacks reveal fields; idle work is disabled. */
const virtualized = { backfill: VirtualizationBackfill.None };
/** Every branch with two children leaves its second child behind a gate. */
const nestedOptions = { ...virtualized, threshold: 2, eagerCount: 1 };
/** Each timed sample owns a fresh form except repeated writes to a mounted input. */
let form: LifecycleBenchForm;
/** Targets selected before the timed natural reveal sample. */
let placeholders: Element[];
/** Input event target is resolved before timing. */
let write: () => void;
/** Alternating writes avoid equality fast paths. */
let value = 0;

describe('fieldLifecycle', () => {
  bench(
    'mount 1000 inputs',
    () => form.mount(flatSchema),
    sampleOptions(
      () => {
        form = new LifecycleBenchForm();
      },
      () => {
        expect(form.container.querySelectorAll('input')).toHaveLength(1000);
        form.dispose();
      },
    ),
  );
  bench(
    'mount 1000 items virtualized',
    () => form.mount(arraySchema, virtualized),
    sampleOptions(
      () => {
        form = new LifecycleBenchForm();
      },
      () => {
        expect(form.container.querySelectorAll('[data-deferred]')).toHaveLength(
          980,
        );
        form.dispose();
      },
    ),
  );
  bench('input write', () => flushSync(write), {
    iterations: 10,
    setup: () => {
      form = new LifecycleBenchForm();
      form.mount(flatSchema);
      const input = form.container.querySelector('input[id="/f0"]');
      if (!input) throw new Error('missing write target');
      write = () => {
        fireEvent.change(input, { target: { value: String(++value) } });
      };
    },
    teardown: () => {
      expect(form.handle.current?.findNode('/f0')?.value).toBe(String(value));
      form.dispose();
    },
  });
  bench(
    'natural reveal of 100 placeholders',
    () => {
      flushSync(() => BenchIntersectionObserver.current.reveal(placeholders));
    },
    sampleOptions(
      () => {
        form = new LifecycleBenchForm();
        form.mount(arraySchema, virtualized);
        placeholders = Array.from(
          form.container.querySelectorAll('[data-deferred]'),
        ).slice(0, 100);
      },
      () => {
        expect(form.container.querySelectorAll('[data-deferred]')).toHaveLength(
          880,
        );
        form.dispose();
      },
    ),
  );
  bench(
    'natural reveal of 3 nested gates',
    () => {
      for (const path of ['/outer', '/outer/middle', '/outer/middle/inner']) {
        const gate = form.container.querySelector(
          `[data-deferred][data-path="${path}"]`,
        );
        if (!gate) throw new Error(`missing gate ${path}`);
        flushSync(() => BenchIntersectionObserver.current.reveal([gate]));
      }
    },
    sampleOptions(
      () => {
        form = new LifecycleBenchForm();
        form.mount(nestedSchema, nestedOptions);
      },
      () => {
        expect(
          form.container.querySelector(
            'input[id="/outer/middle/inner/target"]',
          ),
        ).not.toBeNull();
        form.dispose();
      },
    ),
  );
  bench(
    'focus reveal of 3 nested gates',
    () =>
      flushSync(() => form.handle.current?.focus('/outer/middle/inner/target')),
    sampleOptions(
      () => {
        form = new LifecycleBenchForm();
        form.mount(nestedSchema, nestedOptions);
      },
      () => {
        expect(document.activeElement?.id).toBe('/outer/middle/inner/target');
        form.dispose();
      },
    ),
  );
});
