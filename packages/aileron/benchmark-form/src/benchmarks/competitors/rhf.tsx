import { memo, useEffect } from 'react';

import { createRoot } from 'react-dom/client';
import { type UseFormReturn, useForm } from 'react-hook-form';

import { drainTicks } from '../../utils/setup-env';
import { fireReactChange } from './fire';
import type { CompetitorAdapter } from './harness';
import { flatDefaults, flatFieldName } from './schema';

type Values = Record<string, string>;

export const rhfAdapter: CompetitorAdapter = {
  name: 'react-hook-form',
  async mount(container, fieldCount) {
    let renders = 0;
    const api: { current: UseFormReturn<Values> | null } = { current: null };
    const names = Array.from({ length: fieldCount }, (_, i) =>
      flatFieldName(i),
    );

    // Uncontrolled register — each field is its own memo component so its
    // commits are countable. RHF keeps inputs out of React's render cycle,
    // so a keystroke should commit ~0 field components by design.
    const Field = memo(
      ({
        name,
        register,
      }: {
        name: string;
        register: UseFormReturn<Values>['register'];
      }) => {
        renders++;
        return <input {...register(name)} />;
      },
    );

    const RhfForm = () => {
      const methods = useForm<Values>({
        defaultValues: flatDefaults(fieldCount),
      });
      useEffect(() => {
        api.current = methods;
      }, [methods]);
      return (
        <>
          {names.map((name) => (
            <Field key={name} name={name} register={methods.register} />
          ))}
        </>
      );
    };

    const root = createRoot(container);
    root.render(<RhfForm />);
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
        api.current?.setValue(flatFieldName(index), value);
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
