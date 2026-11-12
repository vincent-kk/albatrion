// @vitest-environment jsdom
// Loaded by vitest.bench.config.ts; per-sample hooks exclude preparation and disposal.
import { createElement } from 'react';

import { fireEvent } from '@testing-library/dom';
import { flushSync } from 'react-dom';
import { afterAll, bench, describe, expect, vi } from 'vitest';

import { ValidationMode, isArrayNode } from '@/schema-form/core';
import { VirtualizationBackfill } from '@/schema-form/helpers/virtualization';
import { ErrorVisibility } from '@/schema-form/types';

import type { FormProps } from '../components/FormCore';
import { BenchIntersectionObserver } from './helpers/BenchIntersectionObserver';
import { InlineFormatErrorForm } from './helpers/InlineFormatErrorForm';
import { LifecycleBenchForm } from './helpers/LifecycleBenchForm';
import {
  arraySchema,
  flatSchema,
  labeledArraySchema,
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
/** Errors are replaced on every terminal field without writing values or state. */
let replaceErrors: () => void;
/** Form props stay stable while the parent creates its formatter inline. */
let formatterProps: FormProps;

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
    'replace visible errors on 1000 fields',
    () => flushSync(replaceErrors),
    sampleOptions(
      () => {
        form = new LifecycleBenchForm();
        form.mount(flatSchema, false, {
          errorVisibility: ErrorVisibility.Always,
        });
        const fields = Array.from({ length: 1000 }, (_, index) => {
          const node = form.handle.current?.findNode(`/f${index}`);
          if (!node) throw new Error(`missing field /f${index}`);
          return node;
        });
        flushSync(() => {
          for (const node of fields)
            node.setExternalErrors([
              { dataPath: node.path, message: 'initial error' },
            ]);
        });
        expect(form.container.textContent).toContain('initial error');
        replaceErrors = () => {
          for (const node of fields)
            node.setExternalErrors([
              { dataPath: node.path, message: 'replacement error' },
            ]);
        };
      },
      () => {
        expect(form.handle.current?.getErrors()).toHaveLength(1000);
        expect(form.container.textContent).toContain('replacement error');
        form.dispose();
      },
    ),
  );
  bench(
    'replace hidden errors on 1000 fields',
    () => flushSync(replaceErrors),
    sampleOptions(
      () => {
        form = new LifecycleBenchForm();
        form.mount(flatSchema, false, {
          errorVisibility: ErrorVisibility.Never,
        });
        const fields = Array.from({ length: 1000 }, (_, index) => {
          const node = form.handle.current?.findNode(`/f${index}`);
          if (!node) throw new Error(`missing field /f${index}`);
          return node;
        });
        flushSync(() => {
          for (const node of fields)
            node.setExternalErrors([
              { dataPath: node.path, message: 'initial error' },
            ]);
        });
        expect(form.container.textContent).not.toContain('initial error');
        replaceErrors = () => {
          for (const node of fields)
            node.setExternalErrors([
              { dataPath: node.path, message: 'replacement error' },
            ]);
        };
      },
      () => {
        expect(form.handle.current?.getErrors()).toHaveLength(1000);
        expect(form.container.textContent).not.toContain('replacement error');
        form.dispose();
      },
    ),
  );
  bench(
    'parent re-render with inline formatError on 1000 fields',
    () =>
      flushSync(() =>
        form.root.render(
          createElement(InlineFormatErrorForm, {
            ...formatterProps,
            ref: form.handle,
          }),
        ),
      ),
    sampleOptions(
      () => {
        form = new LifecycleBenchForm();
        formatterProps = {
          jsonSchema: flatSchema,
          errorVisibility: ErrorVisibility.Always,
          errors: Array.from({ length: 1000 }, (_, index) => ({
            dataPath: `/f${index}`,
            message: 'formatter error',
          })),
        };
        flushSync(() =>
          form.root.render(
            createElement(InlineFormatErrorForm, {
              ...formatterProps,
              ref: form.handle,
            }),
          ),
        );
        expect(form.container.textContent).toContain('formatter error');
      },
      () => {
        expect(form.container.querySelectorAll('input')).toHaveLength(1000);
        expect(form.container.textContent).toContain('formatter error');
        form.dispose();
      },
    ),
  );
  bench(
    'revealErrors on 1000 fields',
    () => flushSync(() => form.handle.current?.revealErrors()),
    sampleOptions(
      () => {
        form = new LifecycleBenchForm();
        form.mount(flatSchema, false, {
          validationMode: ValidationMode.None,
          errorVisibility: ErrorVisibility.Never,
          errors: Array.from({ length: 1000 }, (_, index) => ({
            dataPath: `/f${index}`,
            message: 'revealed error',
          })),
        });
        expect(form.handle.current?.getErrors()).toHaveLength(1000);
        expect(form.container.textContent).not.toContain('revealed error');
      },
      () => {
        expect(form.container.textContent).toContain('revealed error');
        form.dispose();
      },
    ),
  );
  bench(
    'remove first of 300 object items with labeled child fields',
    () => flushSync(write),
    sampleOptions(
      () => {
        form = new LifecycleBenchForm();
        form.mount(labeledArraySchema);
        const node = form.handle.current?.node;
        if (!node || !isArrayNode(node)) throw new Error('missing array root');
        expect(
          form.container.querySelectorAll(
            'label[for$="/name"], label[for$="/email"]',
          ),
        ).toHaveLength(600);
        write = () => {
          node.remove(0);
        };
      },
      () => {
        expect(form.handle.current?.node?.value).toHaveLength(299);
        expect(
          form.container.querySelectorAll(
            'label[for$="/name"], label[for$="/email"]',
          ),
        ).toHaveLength(598);
        expect(
          form.container.querySelector('input[id="/0/name"]'),
        ).toHaveProperty('value', 'Name 1');
        form.dispose();
      },
    ),
  );
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
