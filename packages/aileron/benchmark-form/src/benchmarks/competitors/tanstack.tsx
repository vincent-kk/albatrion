import { useEffect } from 'react';

import { useForm } from '@tanstack/react-form';
import { createRoot } from 'react-dom/client';

import { drainTicks } from '../../utils/setup-env';
import { fireReactChange } from './fire';
import type { CompetitorAdapter } from './harness';
import { flatDefaults, flatFieldName } from './schema';

export const tanstackAdapter: CompetitorAdapter = {
  name: '@tanstack/react-form',
  async mount(container, fieldCount) {
    let renders = 0;
    // setFieldValue captured as a plain closure to avoid threading TanStack's
    // deep generic form-api type through a ref.
    let setField: ((name: string, value: string) => void) | null = null;
    const names = Array.from({ length: fieldCount }, (_, i) =>
      flatFieldName(i),
    );

    const App = () => {
      const form = useForm({ defaultValues: flatDefaults(fieldCount) });
      useEffect(() => {
        setField = (name, value) => form.setFieldValue(name, value);
      }, [form]);
      return (
        <>
          {names.map((name) => (
            <form.Field key={name} name={name}>
              {(field) => {
                renders++;
                return (
                  <input
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                );
              }}
            </form.Field>
          ))}
        </>
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
        setField?.(flatFieldName(index), value);
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
