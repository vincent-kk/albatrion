import { expect, it, vi } from 'vitest';

import type { FieldNode, ValidationIssue } from '@/schema-form/core';

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
  const nodes = new Map([
    ['/a', a],
    ['/b', b],
    ['/retired', retired],
  ]);
  const root = {
    batch: (callback: () => void) => callback(),
    setExternalErrors: vi.fn(),
    find: vi.fn((path: string) => (path === '' ? root : nodes.get(path))),
  };

  applyFormErrors(root as unknown as FieldNode, errors, previous);

  expect(readPath).toHaveBeenCalledTimes(errors.length + previous.length);
  expect(root.setExternalErrors).toHaveBeenCalledExactlyOnceWith(errors);
  expect(a.setExternalErrors).toHaveBeenCalledExactlyOnceWith([
    errors[0],
    errors[2],
  ]);
  expect(b.setExternalErrors).toHaveBeenCalledExactlyOnceWith([errors[1]]);
  expect(retired.setExternalErrors).toHaveBeenCalledExactlyOnceWith([]);
  expect(root.find).toHaveBeenCalledTimes(5);
});

const rootWithChild = () => {
  const child = { setExternalErrors: vi.fn() };
  const root = {
    batch: (callback: () => void) => callback(),
    setExternalErrors: vi.fn(),
    find: vi.fn((path: string) => (path === '' ? root : child)),
  };
  return { root: root as unknown as FieldNode, rootMock: root, child };
};

it.each([
  ['null', null],
  ['an object', { dataPath: '/a', message: 'not a list' }],
])('178C-01 reads %s as an empty errors prop like 0.16.0', (_label, errors) => {
  const { root, rootMock, child } = rootWithChild();

  expect(() =>
    applyFormErrors(root, errors as unknown as ValidationIssue[]),
  ).not.toThrow();

  expect(rootMock.setExternalErrors).toHaveBeenCalledExactlyOnceWith([]);
  expect(child.setExternalErrors).not.toHaveBeenCalled();
});

it('178C-01 reads a null previous list as empty', () => {
  const { root, rootMock, child } = rootWithChild();
  const issue: ValidationIssue = { dataPath: '/a', message: 'first' };

  expect(() =>
    applyFormErrors(root, [issue], null as unknown as ValidationIssue[]),
  ).not.toThrow();

  expect(rootMock.setExternalErrors).toHaveBeenCalledExactlyOnceWith([issue]);
  expect(child.setExternalErrors).toHaveBeenCalledExactlyOnceWith([issue]);
});
