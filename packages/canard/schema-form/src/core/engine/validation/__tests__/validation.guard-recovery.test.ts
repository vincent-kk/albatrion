import { expect, it, vi } from 'vitest';

import type { Validator } from '../types/validator';
import { compileValidationEntry } from '../utils/cache/compileValidationEntry';
import { readValidationEntry } from '../utils/cache/readValidationEntry';

it('G recovery clears only duplicate guard failures after the first successful whole compile', () => {
  const root = { type: 'object' };
  const validator: Validator = {
    compile: vi.fn(() => () => null),
    compileGuard: () => () => true,
  };
  const entry = readValidationEntry(validator, root);
  const failure = new Error('unsupported guard keyword');
  const guard = () => true;
  entry.guards.set('/duplicate/if', {
    failure: new Error('schema with key or id "urn:recovery" already exists'),
  });
  entry.guards.set('/ordinary/if', { failure });
  entry.guards.set('/successful/if', { guard });

  compileValidationEntry(validator, root, entry);

  expect(entry.guards.has('/duplicate/if')).toBe(false);
  expect(entry.guards.get('/ordinary/if')).toEqual({ failure });
  expect(entry.guards.get('/successful/if')).toEqual({ guard });
  expect(entry.validate?.({})).toBeNull();
});

it('G recovery leaves every guard outcome intact when the whole compile fails', () => {
  const root = { type: 'object' };
  const failure = new Error('whole schema unavailable');
  const validator: Validator = {
    compile: () => { throw failure; },
    compileGuard: () => () => true,
  };
  const entry = readValidationEntry(validator, root);
  const duplicate = { failure: new Error('schema with key already exists') };
  const ordinary = { failure: new Error('unsupported guard keyword') };
  const successful = { guard: () => true };
  entry.guards.set('/duplicate/if', duplicate);
  entry.guards.set('/ordinary/if', ordinary);
  entry.guards.set('/successful/if', successful);

  compileValidationEntry(validator, root, entry);

  expect(entry.failure).toBe(failure);
  expect(entry.guards.get('/duplicate/if')).toBe(duplicate);
  expect(entry.guards.get('/ordinary/if')).toBe(ordinary);
  expect(entry.guards.get('/successful/if')).toBe(successful);
});
