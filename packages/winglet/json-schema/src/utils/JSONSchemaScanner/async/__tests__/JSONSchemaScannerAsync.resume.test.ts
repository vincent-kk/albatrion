import { expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { createTestResolver } from '../../__tests__/fixtures/createTestResolver';
import { JSONSchemaScannerAsync } from '../JSONSchemaScannerAsync';

it('resumes after every awaited callback without replaying any completed stage', async () => {
  const trace: string[] = [];
  const scanner = new JSONSchemaScannerAsync<UnknownSchema>({
    options: {
      filter: async (entry) => {
        await Promise.resolve();
        trace.push(`filter ${entry.path}`);
        return true;
      },
      mutate: async (entry) => {
        await Promise.resolve();
        trace.push(`mutate ${entry.path}`);
      },
      resolveReference: createTestResolver(async (reference, entry) => {
        await Promise.resolve();
        trace.push(`resolve ${entry.path} ${reference}`);
        return { properties: { child: { type: 'string' } } };
      }),
    },
    visitor: {
      enter: async (entry) => {
        await Promise.resolve();
        trace.push(`enter ${entry.path}`);
      },
      exit: async (entry) => {
        await Promise.resolve();
        trace.push(`exit ${entry.path}`);
      },
    },
  });
  await scanner.scan({ $ref: '#/target' });
  expect(trace).toEqual([
    'filter #',
    'mutate #',
    'enter #',
    'resolve # #/target',
    'filter #/properties/child',
    'mutate #/properties/child',
    'enter #/properties/child',
    'exit #/properties/child',
    'exit #',
  ]);
  expect(scanner.getValue()).toEqual({
    properties: { child: { type: 'string' } },
  });
});
