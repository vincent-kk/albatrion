import { useLayoutEffect } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { settleValidation } from '@/schema-form/__tests__/helpers/settleValidation';
import { ValidationMode } from '@/schema-form/core';

import { FieldRendererContextProvider } from '../components/FieldRendererProvider';
import { useErrorVisibility } from '../hooks/useErrorVisibility';
import { useFieldRendererContext } from '../hooks/useFieldRendererContext';

afterEach(cleanup);

it('IR-6 W2 commit-time pending recheck rejects a reveal after child layout normalization', async () => {
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
  const NormalizingInput = ({ normalize }: { normalize: boolean }) => {
    useLayoutEffect(() => {
      if (normalize) node.setValue('valid');
    }, [normalize]);
    return null;
  };
  const Display = ({ reveal }: { reveal: boolean }) => {
    const context = useFieldRendererContext();
    const [visible] = useErrorVisibility(
      [node],
      [reveal],
      context.errorVisibility?.renderer,
    );
    return (
      <>
        <NormalizingInput normalize={reveal} />
        <span data-testid="message">
          {visible ? node.errors[0]?.message : ''}
        </span>
      </>
    );
  };
  const view = render(
    <FieldRendererContextProvider>
      <Display reveal={false} />
    </FieldRendererContextProvider>,
  );
  view.rerender(
    <FieldRendererContextProvider>
      <Display reveal={true} />
    </FieldRendererContextProvider>,
  );
  expect(view.getByTestId('message').textContent).toBe('');
  await settleValidation(node);
  expect(view.getByTestId('message').textContent).toBe('');
});
