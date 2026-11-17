import { expect, it } from 'vitest';

import { JSONSchemaScannerAsync } from '../JSONSchemaScannerAsync';

it('rejects access while awaiting a callback and preserves the first scan', async () => {
  let release!: () => void;
  const pause = new Promise<void>((resolve) => {
    release = resolve;
  });
  const scanner = new JSONSchemaScannerAsync({
    visitor: { enter: () => pause },
  });
  const root = { type: 'string' };
  const scanning = scanner.scan(root);
  expect(() => scanner.getValue()).toThrowError(
    expect.objectContaining({ code: 'scan-in-progress' }),
  );
  await expect(scanner.scan({ type: 'number' })).rejects.toMatchObject({
    code: 'scan-in-progress',
  });
  release();
  await scanning;
  expect(scanner.getValue()).toBe(root);
});

it('resets output after an asynchronous callback failure', async () => {
  let reject = true;
  const scanner = new JSONSchemaScannerAsync({
    visitor: {
      enter: async () => {
        if (reject) {
          await Promise.resolve();
          scanner.getValue();
        }
      },
    },
  });
  await expect(scanner.scan({ type: 'string' })).rejects.toMatchObject({
    code: 'scan-in-progress',
  });
  expect(scanner.getValue()).toBeUndefined();
  reject = false;
  await scanner.scan({ type: 'number' });
  expect(scanner.getValue()).toEqual({ type: 'number' });
});
