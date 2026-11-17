import { expect, it } from 'vitest';

import { JSONSchemaScanner } from '../JSONSchemaScanner';

it('rejects same-instance access during scan without disturbing a caught outer scan', () => {
  const scanner = new JSONSchemaScanner({
    visitor: {
      enter: () => {
        expect(() => scanner.getValue()).toThrowError(
          expect.objectContaining({ code: 'scan-in-progress' }),
        );
        expect(() => scanner.scan({ type: 'number' })).toThrowError(
          expect.objectContaining({ code: 'scan-in-progress' }),
        );
      },
    },
  });
  const root = { type: 'string' };
  scanner.scan(root);
  expect(scanner.getValue()).toBe(root);
});

it('resets output after an uncaught in-progress error and permits a later scan', () => {
  let reject = true;
  const scanner = new JSONSchemaScanner({
    visitor: {
      enter: () => {
        if (reject) scanner.getValue();
      },
    },
  });
  expect(() => scanner.scan({ type: 'string' })).toThrowError(
    expect.objectContaining({ code: 'scan-in-progress' }),
  );
  expect(scanner.getValue()).toBeUndefined();
  reject = false;
  expect(scanner.scan({ type: 'number' }).getValue()).toEqual({
    type: 'number',
  });
});
