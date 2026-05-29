import { Field, type FieldProps, Formik, type FormikProps } from 'formik';
import { createRoot } from 'react-dom/client';

import { drainTicks } from '../../utils/setup-env';
import { fireReactChange } from './fire';
import type { CompetitorAdapter } from './harness';
import { flatDefaults, flatFieldName } from './schema';

type Values = Record<string, string>;

export const formikAdapter: CompetitorAdapter = {
  name: 'formik',
  async mount(container, fieldCount) {
    let renders = 0;
    const api: { current: FormikProps<Values> | null } = { current: null };
    const names = Array.from({ length: fieldCount }, (_, i) =>
      flatFieldName(i),
    );

    // <Field> render-prop is Formik's canonical pattern. Each Field subscribes
    // to FormikContext, so a single value change re-runs EVERY Field's render
    // prop (context bypasses memo) — Formik's well-known full re-render.
    const App = () => (
      <Formik<Values>
        initialValues={flatDefaults(fieldCount)}
        innerRef={(instance) => {
          api.current = instance;
        }}
        onSubmit={() => {}}
      >
        {() => (
          <>
            {names.map((name) => (
              <Field key={name} name={name}>
                {({ field }: FieldProps) => {
                  renders++;
                  return <input {...field} />;
                }}
              </Field>
            ))}
          </>
        )}
      </Formik>
    );

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
        await api.current?.setFieldValue(flatFieldName(index), value);
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
