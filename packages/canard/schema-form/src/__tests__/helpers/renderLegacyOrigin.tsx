import { createRef } from 'react';

import { render } from '@testing-library/react';
import { vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type FormProps,
} from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';

/** Render the public Form through React 18's legacy root with a single load warning. */
export const renderLegacyOrigin = () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  onError.mockClear();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'number' }}
      defaultValue="bad"
      validationMode={ValidationMode.None}
      onError={onError}
    />,
    { legacyRoot: true },
  );
  return { ref, onError };
};
