import { describe, expect, it } from 'vitest';

import {
  dispatchMount,
  dispatchRemove,
  dispatchResetForm,
  dispatchSetExternalErrors,
  dispatchSetValue,
  dispatchValidate,
  subscribeSchemaNode,
} from '../../dispatch';
import {
  type DispatchTestNode,
  createDispatchTree,
} from '../../dispatch/__tests__/fixtures/createDispatchTree';
import { SchemaNodeEventType } from '../../record';
import { ValidationMode } from '../../types/state';
import { readSchemaNodeErrors, requestSchemaNodeValidation } from '../index';
import type { ValidationIssue, Validator } from '../type';

/** Error bits a validation wave may deliver. */
const ERROR_BITS =
  SchemaNodeEventType.UpdateError | SchemaNodeEventType.UpdateGlobalError;

/**
 * Build a validator whose result is produced fresh on every call, as an AJV adapter does.
 * @param read - Issue list for the value being validated
 * @returns Validator returning new issue objects on each run
 */
const freshValidator = (
  read: (value: any) => readonly ValidationIssue[],
): Validator => ({
  compile: () => (value) => read(value).map((issue) => ({ ...issue })),
  compileGuard: () => () => true,
});

/**
 * Record the error bits delivered to a node.
 * @param node - Subscribed node
 * @returns The received error bit masks
 */
const recordErrorBits = (node: DispatchTestNode): number[] => {
  const received: number[] = [];
  subscribeSchemaNode(node, (event) => {
    if (event.type & ERROR_BITS) received.push(event.type & ERROR_BITS);
  });
  return received;
};

/** Let the coalesced validation microtask and its wave run. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Object form with one string field, the target of every issue below. */
const nameSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
};
/**
 * Build the minLength issue for `/name`.
 * @param limit - Value of `details.limit`
 * @returns A fresh issue object
 */
const tooShort = (limit: number): ValidationIssue => ({
  dataPath: '/name',
  keyword: 'minLength',
  message: 'too short',
  details: { limit },
});

// filid:contract validation-route
describe('207C-01 deep-equal root results keep references and send no error wave', () => {
  it('keeps globalErrors and node errors and delivers nothing for the same issues', async () => {
    const { root, runtime } = createDispatchTree(
      nameSchema,
      undefined,
      freshValidator(() => [tooShort(3)]),
    );
    dispatchMount(root, { name: 'a' });
    runtime.validationMode = ValidationMode.OnChange;
    const name = root.structure!.name!;
    dispatchSetValue(name, 'b');
    await settle();
    const globalErrors = runtime.globalErrors;
    const nodeErrors = readSchemaNodeErrors(name);
    const rootBits = recordErrorBits(root);
    const nameBits = recordErrorBits(name);
    dispatchSetValue(name, 'c');
    await settle();
    expect(runtime.globalErrors).toBe(globalErrors);
    expect(readSchemaNodeErrors(name)).toBe(nodeErrors);
    expect(rootBits).toEqual([]);
    expect(nameBits).toEqual([]);
  });

  it('delivers when only the details of an issue change', async () => {
    let limit = 3;
    const { root, runtime } = createDispatchTree(
      nameSchema,
      undefined,
      freshValidator(() => [tooShort(limit)]),
    );
    dispatchMount(root, { name: 'a' });
    runtime.validationMode = ValidationMode.OnChange;
    const name = root.structure!.name!;
    dispatchSetValue(name, 'b');
    await settle();
    const globalErrors = runtime.globalErrors;
    const rootBits = recordErrorBits(root);
    limit = 4;
    dispatchSetValue(name, 'c');
    await settle();
    expect(runtime.globalErrors).not.toBe(globalErrors);
    expect(rootBits).toContain(SchemaNodeEventType.UpdateGlobalError);
  });

  it('keeps the merged errors of a node with external errors for the same issues', async () => {
    const { root, runtime } = createDispatchTree(
      nameSchema,
      undefined,
      freshValidator(() => [tooShort(3)]),
    );
    dispatchMount(root, { name: 'a' });
    runtime.validationMode = ValidationMode.OnChange;
    const name = root.structure!.name!;
    dispatchSetExternalErrors(name, [{ dataPath: '/name', message: 'taken' }]);
    dispatchSetValue(name, 'b');
    await settle();
    const merged = readSchemaNodeErrors(name);
    expect(merged).toHaveLength(2);
    dispatchSetValue(name, 'c');
    await settle();
    expect(readSchemaNodeErrors(name)).toBe(merged);
  });

  it('resolves a repeated explicit validate() with the same list', async () => {
    const { root } = createDispatchTree(
      nameSchema,
      undefined,
      freshValidator(() => [tooShort(3)]),
    );
    dispatchMount(root, { name: 'a' });
    const first = await dispatchValidate(root);
    const rootBits = recordErrorBits(root);
    expect(await dispatchValidate(root)).toBe(first);
    expect(rootBits).toEqual([]);
  });

  it('publishes the same result again after a form reset', async () => {
    const { root } = createDispatchTree(
      nameSchema,
      undefined,
      freshValidator(() => [tooShort(3)]),
    );
    dispatchMount(root, { name: 'a' });
    await dispatchValidate(root);
    dispatchResetForm(root, { name: 'a' });
    const rootBits = recordErrorBits(root);
    await dispatchValidate(root);
    expect(rootBits).toContain(SchemaNodeEventType.UpdateGlobalError);
  });

  it('keeps the list a subtree validation routed when the next root verdict is the same', async () => {
    const { root, runtime } = createDispatchTree(
      nameSchema,
      undefined,
      freshValidator(() => [tooShort(3)]),
    );
    dispatchMount(root, { name: 'a' });
    await dispatchValidate(root);
    const name = root.structure!.name!;
    requestSchemaNodeValidation(name, () => undefined);
    await settle();
    const globalErrors = runtime.globalErrors;
    const nodeErrors = readSchemaNodeErrors(name);
    const rootBits = recordErrorBits(root);
    await dispatchValidate(root);
    expect(runtime.globalErrors).toBe(globalErrors);
    expect(readSchemaNodeErrors(name)).toBe(nodeErrors);
    expect(rootBits).toEqual([]);
  });

  it('moves an unchanged issue to the node that now owns its path after an item removal', async () => {
    const { root } = createDispatchTree(
      { type: 'array', items: { type: 'string' } },
      undefined,
      freshValidator(() => [{ dataPath: '/0', message: 'bad first item' }]),
    );
    dispatchMount(root, ['a', 'b']);
    await dispatchValidate(root);
    const removed = root.structure![0]!;
    const successor = root.structure![1]!;
    expect(readSchemaNodeErrors(removed)).toHaveLength(1);
    dispatchRemove(root, 0);
    const successorBits = recordErrorBits(successor);
    await dispatchValidate(root);
    expect(root.structure![0]).toBe(successor);
    expect(
      readSchemaNodeErrors(successor).map((issue) => issue.message),
    ).toEqual(['bad first item']);
    expect(successorBits).toContain(SchemaNodeEventType.UpdateError);
  });

  it('routes an unchanged list again after a oneOf branch switch', async () => {
    const offWhenY: ValidationIssue = {
      dataPath: '/value',
      schemaPath: '#/oneOf/0/properties/value/minLength',
      keyword: 'minLength',
      message: 'x rule',
    };
    const { root } = createDispatchTree(
      {
        type: 'object',
        controls: { discriminator: 'kind' },
        properties: { kind: { type: 'string' }, value: { type: 'string' } },
        oneOf: [
          { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
          { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
        ],
      },
      undefined,
      freshValidator(() => [offWhenY]),
    );
    dispatchMount(root, { kind: 'x', value: 'a' });
    await dispatchValidate(root);
    const value = root.structure!.value!;
    expect(readSchemaNodeErrors(value)).toHaveLength(1);
    dispatchSetValue(root.structure!.kind!, 'y');
    await dispatchValidate(root);
    expect(root.structure!.value).toBe(value);
    expect(readSchemaNodeErrors(value)).toEqual([]);
  });
});
