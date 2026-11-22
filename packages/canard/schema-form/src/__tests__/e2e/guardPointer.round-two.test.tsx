import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  ValidationMode,
  type ValidatorFactory,
} from '../../index';

afterEach(cleanup);
describe('round-2 schema-form 8: compileGuard receives RFC 6901', () => {
  it.each(['*', '.', '..', '@', 'a/b', 'a~b'])(
    'preserves property %j without form escapes',
    (name) => {
      const pointers: string[] = [];
      const validator: ValidatorFactory = {
        compile: () => () => null,
        compileGuard: (schema, pointer) => {
          pointers.push(pointer);
          let value: unknown = schema;
          for (const part of pointer.slice(1).split('/')) {
            const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
            if (value === null || typeof value !== 'object' || !(key in value))
              throw new Error('invalid RFC pointer');
            value = Reflect.get(value, key);
          }
          return () => true;
        },
      };
      const ref = createRef<FormHandle>();
      const onError = vi.fn();
      render(
        <Form
          ref={ref}
          onError={onError}
          validatorFactory={validator}
          validationMode={ValidationMode.None}
          jsonSchema={{
            type: 'object',
            properties: {
              [name]: {
                type: 'object',
                allOf: [
                  {
                    if: { required: ['receipt'] },
                    then: {
                      properties: { email: { type: 'string', default: 'ok' } },
                    },
                  },
                ],
              },
            },
          }}
        />,
      );
      expect(pointers).toEqual([
        '/properties/' +
          name.replace(/~/g, '~0').replace(/\//g, '~1') +
          '/allOf/0/if',
      ]);
      expect(onError).not.toHaveBeenCalled();
    },
  );
});
describe('round-2 schema-form 12: equivalent dialect identifiers', () => {
  it('treats an empty fragment as equivalent while retaining real mismatch warnings', () => {
    const run = ($schema: string) => {
      const onError = vi.fn();
      const validator: ValidatorFactory = {
        dialect: 'http://json-schema.org/draft-07/schema#',
        compile: () => () => null,
        compileGuard: () => () => true,
      };
      const view = render(
        <Form
          onError={onError}
          validatorFactory={validator}
          validationMode={ValidationMode.None}
          jsonSchema={{ $schema, type: 'string' }}
        />,
      );
      const codes = onError.mock.calls.map(([record]) => record.code);
      view.unmount();
      return codes;
    };
    const exact = run('http://json-schema.org/draft-07/schema#');
    expect(exact).toEqual([]);
    expect(run('http://json-schema.org/draft-07/schema')).toEqual(exact);
    expect(run('https://json-schema.org/draft/2020-12/schema')).toContain(
      'SCHEMA_FORM_WARNING.DIALECT_MISMATCH',
    );
  });
});
