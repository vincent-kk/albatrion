import { useEffect, useState } from 'react';

import RjsfForm from '@rjsf/core';
import type { RegistryWidgetsType, WidgetProps } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { createRoot } from 'react-dom/client';

import { drainTicks } from '../../utils/setup-env';
import { fireReactChange } from './fire';
import type { CompetitorAdapter } from './harness';
import { flatFieldName, flatRjsfSchema } from './schema';

type Values = Record<string, string>;
type Updater = (prev: Values) => Values;

export const rjsfAdapter: CompetitorAdapter = {
  name: '@rjsf/core',
  async mount(container, fieldCount) {
    let renders = 0;
    const api: { current: ((updater: Updater) => void) | null } = {
      current: null,
    };
    const schema = flatRjsfSchema(fieldCount);

    // rjsf is controlled by formData. A keystroke bubbles to the root
    // onChange → setState → the whole Form re-renders → every TextWidget
    // re-renders. We count exactly that.
    const CountingWidget = (props: WidgetProps) => {
      renders++;
      return (
        <input
          id={props.id}
          value={String(props.value ?? '')}
          onChange={(event) => props.onChange(event.target.value)}
        />
      );
    };
    const widgets: RegistryWidgetsType = { TextWidget: CountingWidget };

    const App = () => {
      const [data, setData] = useState<Values>(() => {
        const initial: Values = {};
        for (let i = 0; i < fieldCount; i++)
          initial[flatFieldName(i)] = `value_${i}`;
        return initial;
      });
      useEffect(() => {
        api.current = (updater) => setData(updater);
      }, []);
      return (
        <RjsfForm
          schema={schema}
          validator={validator}
          formData={data}
          widgets={widgets}
          onChange={(event) => setData((event.formData ?? {}) as Values)}
        >
          {/* empty children suppress rjsf's default submit button (fairness) */}
          <></>
        </RjsfForm>
      );
    };

    const root = createRoot(container);
    root.render(<App />);
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
        api.current?.((prev) => ({ ...prev, [flatFieldName(index)]: value }));
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
