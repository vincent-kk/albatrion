import { createRef } from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  type FormProps,
  type JSONSchema,
  ValidationMode,
  isJSONSchemaError,
} from '@/schema-form';

import { observeErrorSink } from '../helpers/observeErrorSink';

describe('remaining discriminator mount errors through Form', () => {
  it.each([
    {
      id: 'E1 C1',
      schema: { type: 'object', controls: { discriminator: '' } },
      code: FormErrorCode.InvalidControlShape,
      schemaPath: '#/controls/discriminator',
      details: { group: 'controls', key: 'discriminator', expected: 'string' },
    },
    {
      id: 'E2 C4',
      schema: {
        type: 'object',
        controls: { discriminator: 'kind' },
        oneOf: [{ properties: { first: { type: 'string' } } }],
      },
      code: FormErrorCode.DiscriminatorMismatch,
      schemaPath: '#',
      details: { propertyName: 'kind', reason: 'missing' },
    },
    {
      id: 'E3 C6',
      schema: {
        type: 'object',
        controls: { discriminator: 'kind' },
        oneOf: [
          { properties: { kind: { const: 'a' } } },
          { properties: { kind: { const: 'a' } } },
        ],
      },
      code: FormErrorCode.DiscriminatorMismatch,
      schemaPath: '#/oneOf/1',
      details: { propertyName: 'kind', reason: 'overlap' },
    },
    {
      id: 'E4 C8',
      schema: {
        type: 'object',
        controls: { discriminator: 'kind' },
        oneOf: [
          { properties: { kind: { const: 'a' } } },
          { properties: { kind: { const: 1 } } },
        ],
      },
      code: FormErrorCode.DiscriminatorMismatch,
      schemaPath: '#/oneOf/1',
      details: { propertyName: 'kind', reason: 'kind' },
    },
  ])(
    '$id reports the original schema error, location and details before rendering the fallback',
    ({ schema, code, schemaPath, details }) => {
      const sink = observeErrorSink();
      const ref = createRef<FormHandle>();
      const records: Parameters<NonNullable<FormProps['onError']>>[0][] = [];
      const runtime: JSONSchema = JSON.parse(JSON.stringify(schema));
      const view = render(
        <Form
          ref={ref}
          jsonSchema={runtime}
          validationMode={ValidationMode.None}
          onError={(record) => records.push(record)}
        />,
      );
      expect(ref.current?.node).toBeUndefined();
      expect(view.container.textContent).toContain('Unable to load form.');
      expect(view.container.querySelector('[data-path]')).toBeNull();
      expect(records).toHaveLength(1);
      const failure = records[0];
      expect(failure).toMatchObject({
        code,
        level: 'error',
        origin: 'load',
        details: { schemaPath, ...details },
      });
      expect(failure.details).toEqual({ schemaPath, ...details });
      expect(isJSONSchemaError(failure.error)).toBe(true);
      expect(sink.errors()).toContain(failure.error);
      view.unmount();
      sink.cleanup();
    },
  );
});
