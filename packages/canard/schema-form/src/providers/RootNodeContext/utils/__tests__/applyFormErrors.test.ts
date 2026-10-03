import { expect, it, vi } from 'vitest';

import type { SchemaNode, ValidationIssue } from '@/schema-form/core';

import { applyFormErrors } from '../applyFormErrors';

it('79C-01 groups repeated error paths in one pass and clears retired paths', () => {
  const readPath = vi.fn();
  const issue = (path: string, message: string): ValidationIssue => ({
    get dataPath() {
      readPath(path);
      return path;
    },
    message,
  });
  const errors = [
    issue('/a', 'first'),
    issue('/b', 'second'),
    issue('/a', 'third'),
    issue('/missing', 'unmatched'),
    issue('', 'root'),
  ];
  const previous = [issue('/retired', 'old'), issue('/a', 'replaced')];
  const a = { setExternalErrors: vi.fn() };
  const b = { setExternalErrors: vi.fn() };
  const retired = { setExternalErrors: vi.fn() };
  const nodes = new Map([['/a', a], ['/b', b], ['/retired', retired]]);
  const root = {
    batch: (callback: () => void) => callback(),
    setExternalErrors: vi.fn(),
    find: vi.fn((path: string) => path === '' ? root : nodes.get(path)),
  };

  applyFormErrors(root as unknown as SchemaNode, errors, previous);

  expect(readPath).toHaveBeenCalledTimes(errors.length + previous.length);
  expect(root.setExternalErrors).toHaveBeenCalledExactlyOnceWith(errors);
  expect(a.setExternalErrors).toHaveBeenCalledExactlyOnceWith([errors[0], errors[2]]);
  expect(b.setExternalErrors).toHaveBeenCalledExactlyOnceWith([errors[1]]);
  expect(retired.setExternalErrors).toHaveBeenCalledExactlyOnceWith([]);
  expect(root.find).toHaveBeenCalledTimes(5);
});
