import type { ComponentProps } from 'react';

import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { liveOptions, mountVirtualization } from './helpers/liveVirtualization';

const { observeFormRef } = vi.hoisted(() => ({ observeFormRef: vi.fn() }));

// Observe the prop while the real proxy attaches it to the real form element.
vi.mock(
  '@/schema-form/components/Form/components/FormCore/components/FormRootProxy',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/schema-form/components/Form/components/FormCore/components/FormRootProxy')
      >();
    return {
      ...actual,
      FormRootProxy: (props: ComponentProps<typeof actual.FormRootProxy>) => {
        observeFormRef(props.formRef);
        return <actual.FormRootProxy {...props} />;
      },
    };
  },
);

describe.each([false, true])(
  'virtualization form ref (StrictMode=%s)',
  (strict) => {
    it('leaves a never-enabled form ref unattached and attaches it on enable', () => {
      const form = mountVirtualization(strict, false);
      const element = form.container.querySelector('form');
      expect(element).not.toBeNull();
      expect(observeFormRef).toHaveBeenLastCalledWith(null);
      act(() => form.ref.current!.findNode('/0')!.setValue('edited'));
      form.options(false);
      expect(observeFormRef.mock.calls.every(([ref]) => ref === null)).toBe(
        true,
      );

      form.options(liveOptions);
      expect(form.container.querySelector('form')).toBe(element);
      expect(observeFormRef).toHaveBeenLastCalledWith(
        expect.objectContaining({ current: element }),
      );

      form.options(false);
      expect(observeFormRef).toHaveBeenLastCalledWith(null);
    });
  },
);
