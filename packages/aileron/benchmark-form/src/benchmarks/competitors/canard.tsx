import { createRef } from 'react';

import { createRoot } from 'react-dom/client';

import {
  Form,
  type FormHandle,
  type FormTypeRendererProps,
  type JsonSchema,
} from '@canard/schema-form';

import { drainTicks, drainUntilReady } from '../../utils/setup-env';
import { fireReactChange } from './fire';
import type { CompetitorAdapter } from './harness';
import { buildFlatSchema, flatFieldName } from './schema';

export const canardAdapter: CompetitorAdapter = {
  name: '@canard/schema-form',
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
};
