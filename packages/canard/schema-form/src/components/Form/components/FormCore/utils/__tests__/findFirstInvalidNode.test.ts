import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import {
  type AuthoredSchema,
  FieldNodeState,
  type ValidationIssue,
  ValidationMode,
} from '@/schema-form/core';

import { findFirstInvalidNode } from '../findFirstInvalidNode';

/**
 * Mount a tree whose validator reports one issue at each listed path, then validate it.
 * @param jsonSchema - Authored schema of the tree.
 * @param paths - Data paths that receive an issue, in validator order.
 * @param defaultValue - Initial value.
 * @returns The validated root.
 */
const validatedRoot = async (
  jsonSchema: AuthoredSchema,
  paths: string[],
  defaultValue?: unknown,
) => {
  const root = nodeFromJSONSchema({
    jsonSchema,
    defaultValue,
    validator: {
      compile: () => (): ValidationIssue[] =>
        paths.map((dataPath) => ({ dataPath, keyword: 'k', message: 'm' })),
      compileGuard: () => () => true,
    },
    validationMode: ValidationMode.OnRequest,
    deferMountValidation: true,
  });
  await root.validate();
  return root;
};

const twoFields = {
  type: 'object',
  properties: { a: { type: 'string' }, b: { type: 'string' } },
} as const;

it('ERROR-139 picks the first invalid node in preorder', async () => {
  const root = await validatedRoot(twoFields, ['/b', '/a']);
  expect(findFirstInvalidNode(root)?.path).toBe('/a');
});

it('ERROR-139 prefers a field error over a root error', async () => {
  const root = await validatedRoot(twoFields, ['', '/b']);
  expect(findFirstInvalidNode(root)?.path).toBe('/b');
});

it('ERROR-139 falls back to the root when only the root is invalid', async () => {
  const root = await validatedRoot(twoFields, ['']);
  expect(findFirstInvalidNode(root)).toBe(root);
});

it('ERROR-139 returns null when no node has an error', async () => {
  const root = await validatedRoot(twoFields, []);
  expect(findFirstInvalidNode(root)).toBeNull();
});

it.each([
  ['read-only', { type: 'string', readOnly: true }],
  ['disabled', { type: 'string', controls: { disabled: true } }],
] as const)('ERROR-139 skips a %s node', async (_, a) => {
  const root = await validatedRoot(
    { type: 'object', properties: { a, b: { type: 'string' } } },
    ['/a', '/b'],
  );
  expect(findFirstInvalidNode(root)?.path).toBe('/b');
});

it('ERROR-139 skips a node whose own ErrorVisible is false, but not its children', async () => {
  const root = await validatedRoot(
    {
      type: 'object',
      properties: {
        a: { type: 'string' },
        g: { type: 'object', properties: { x: { type: 'string' } } },
      },
    },
    ['/a', '/g', '/g/x'],
  );
  root.find('/a')!.setState({ [FieldNodeState.ErrorVisible]: false });
  root.find('/g')!.setState({ [FieldNodeState.ErrorVisible]: false });
  expect(findFirstInvalidNode(root)?.path).toBe('/g/x');
});

it('ERROR-139 skips the subtree of a node that is not present', async () => {
  const root = await validatedRoot(
    {
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        g: {
          type: 'object',
          controls: { visible: '../show === true' },
          properties: { x: { type: 'string' } },
        },
        b: { type: 'string' },
      },
    },
    ['/g/x', '/b'],
    { show: false },
  );
  expect(root.find('/g')!.isPresent).toBe(false);
  expect(findFirstInvalidNode(root)?.path).toBe('/b');
});
