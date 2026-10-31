import { startTransition, useLayoutEffect, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { settleValidation } from '@/schema-form/__tests__/helpers/settleValidation';
import { ValidationMode } from '@/schema-form/core';

import { FieldRendererContextProvider } from '../components/FieldRendererProvider';
import { useErrorVisibility } from '../hooks/useErrorVisibility';
import { useFieldRendererContext } from '../hooks/useFieldRendererContext';

afterEach(cleanup);
it('IR-6 H same-commit transition reveal stays hidden before a child layout normalizes', async () => {
  const node = nodeFromJSONSchema({
    jsonSchema: { type: 'string' },
    defaultValue: '',
    validationMode: ValidationMode.OnChange,
    validator: {
      compile: () => (value) =>
        value === 'valid' ? [] : [{ dataPath: '', message: 'old error' }],
      compileGuard: () => () => true,
    },
  });
  await settleValidation(node);
  const probes: string[] = [];
  let reveal!: () => void;
  const Normalizer = () => {
    useLayoutEffect(() => {
      node.setValue('valid');
    }, []);
    return null;
  };
  const Display = () => {
    const context = useFieldRendererContext();
    const [visible] = useErrorVisibility(
      [node],
      [context.checkShowError(node.state)],
    );
    return (
      <>
        <Normalizer />
        <span data-testid="message">
          {visible ? node.errors[0]?.message : ''}
        </span>
      </>
    );
  };
  const Probe = () => {
    useLayoutEffect(() => {
      probes.push(
        document.querySelector('[data-testid="message"]')?.textContent ?? '',
      );
    });
    return null;
  };
  const App = () => {
    const [shown, setShown] = useState(false);
    reveal = () =>
      startTransition(() => {
        node.setState({ 4: true });
        setShown(true);
      });
    return (
      <FieldRendererContextProvider>
        {shown ? <Display /> : null}
        <Probe />
      </FieldRendererContextProvider>
    );
  };
  const view = render(<App />);
  probes.length = 0;
  await act(async () => reveal());
  expect(probes.length).toBeGreaterThan(0);
  expect(probes).not.toContain('old error');
  expect(view.getByTestId('message').textContent).toBe('');
  await settleValidation(node);
  expect(view.getByTestId('message').textContent).toBe('');
});
