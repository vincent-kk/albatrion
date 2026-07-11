import { createRef } from 'react';

import { createRoot } from 'react-dom/client';

import {
  Form,
  type FormHandle,
  type FormProps,
  type FormTypeRendererProps,
  type JsonSchema,
  VirtualizationBackfill,
} from '@canard/schema-form';

import { drainTicks, drainUntilReady } from '../../utils/setup-env';
import { fireReactChange } from './fire';
import type { CompetitorAdapter } from './harness';
import { buildFlatSchema, flatFieldName } from './schema';

const createCanardAdapter = (
  name: string,
  virtualization?: FormProps['virtualization'],
): CompetitorAdapter => ({
  name,
  async mount(container, fieldCount) {
    let renders = 0;
    // Count leaf-field commits only (depth 0 is the root object container,
    // which has no counterpart in RHF/Formik/TanStack).
    const Renderer = ({ depth, Input }: FormTypeRendererProps) => {
      if (depth > 0) renders++;
      return <Input />;
    };
    const ref = createRef<FormHandle<JsonSchema>>();
    const root = createRoot(container);
    root.render(
      <Form
        ref={ref}
        jsonSchema={buildFlatSchema(fieldCount)}
        CustomFormTypeRenderer={Renderer}
        onChange={() => {}}
        virtualization={virtualization}
      />,
    );
    await drainUntilReady(
      () => ref.current?.findNode(`/${flatFieldName(0)}`) != null,
    );
    await drainTicks(2);

    return {
      async fireChange(index, value) {
        fireReactChange(
          container.querySelectorAll('input')[index] as HTMLInputElement,
          value,
        );
        await drainTicks(1);
      },
      async setValueProgrammatic(index, value) {
        const node = ref.current?.findNode(`/${flatFieldName(index)}`);
        if (node?.type === 'string') node.setValue(value);
        await drainTicks(1);
      },
      renderCount: () => renders,
      resetRenderCount: () => {
        renders = 0;
      },
      unmount: () => root.unmount(),
    };
  },
});

export const canardAdapter = createCanardAdapter('@canard/schema-form');

/**
 * Virtualized variant: placeholders stay deferred under the never-firing
 * IntersectionObserver stub (setup-env), so mount measures the eager-only
 * cost — default options mount the leading 20 fields per gated branch.
 * Keystroke/setValue target field 0, which is inside the eager window.
 */
export const canardVirtualizedAdapter = createCanardAdapter(
  '@canard/schema-form (virtualized)',
  { backfill: VirtualizationBackfill.None },
);
