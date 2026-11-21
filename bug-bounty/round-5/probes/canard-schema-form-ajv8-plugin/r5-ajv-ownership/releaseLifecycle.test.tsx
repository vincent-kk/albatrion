import { Activity, StrictMode, act } from 'react';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  type ValidatorFactory,
} from '@canard/schema-form';
import Ajv from 'ajv';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';

import { createValidator } from '../../default/index';

/**
 * Round 5, hunter r5-ajv-ownership (angles LC3, LC4, IN3): when the core calls `release`, and
 * what the application instance holds afterwards, under StrictMode, `<Activity>`, unmount, and
 * two separately evaluated plugin copies.
 */
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const schemaWithId = (index: number): JSONSchema => ({
  $id: `https://r5.invalid/ajv8/lifecycle/${index}`,
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
});

const counted = (validator: ValidatorFactory) => {
  const release = vi.fn((root: JSONSchema) => validator.release?.(root));
  return { factory: { ...validator, release } satisfies ValidatorFactory, release };
};

const mount = async (element: (handle: (form: FormHandle | null) => void) => React.ReactElement) => {
  const container = document.body.appendChild(document.createElement('div'));
  const reactRoot = createRoot(container);
  let handle: FormHandle | null = null;
  await act(async () => reactRoot.render(element((form) => void (handle = form ?? handle))));
  return {
    rerender: async (next: (handle: (form: FormHandle | null) => void) => React.ReactElement) =>
      act(async () => reactRoot.render(next((form) => void (handle = form ?? handle)))),
    validate: async () => {
      let outcome: unknown;
      await act(async () => {
        try {
          await handle!.validate();
          outcome = handle!.findNode('/name')?.errors.map((issue) => issue.keyword);
        } catch (error) {
          outcome = `rejected: ${(error as Error).message}`;
        }
      });
      return outcome;
    },
    unmount: async () => {
      await act(async () => reactRoot.unmount());
      container.remove();
    },
  };
};

const formOf = (schema: JSONSchema, factory: ValidatorFactory) => (ref: (form: FormHandle | null) => void) => (
  <Form
    ref={ref}
    jsonSchema={schema}
    defaultValue={{ name: 'ab' }}
    validationMode={ValidationMode.OnRequest}
    errorVisibility={ErrorVisibility.Always}
    validatorFactory={factory}
  />
);

describe('ajv8: release timing through the core', () => {
  it('StrictMode effect replay does not release a mounted root', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const { factory, release } = counted(createValidator(ajv));
    const schema = schemaWithId(0);
    const view = await mount((ref) => <StrictMode>{formOf(schema, factory)(ref)}</StrictMode>);
    expect(await view.validate()).toEqual(['minLength']);
    expect(release).not.toHaveBeenCalled();
    await view.unmount();
    expect(release).not.toHaveBeenCalled();
  });

  it('a root hidden by Activity and evicted meanwhile validates again when shown', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const { factory, release } = counted(createValidator(ajv));
    const hiddenSchema = schemaWithId(100);
    const view = await mount((ref) => <Activity mode="visible">{formOf(hiddenSchema, factory)(ref)}</Activity>);
    expect(await view.validate()).toEqual(['minLength']);
    await view.rerender((ref) => <Activity mode="hidden">{formOf(hiddenSchema, factory)(ref)}</Activity>);
    for (let index = 1; index <= 9; index++) {
      const other = await mount(formOf(schemaWithId(100 + index), factory));
      await other.validate();
      await other.unmount();
    }
    expect(release.mock.calls.length).toBeGreaterThanOrEqual(1);
    await view.rerender((ref) => <Activity mode="visible">{formOf(hiddenSchema, factory)(ref)}</Activity>);
    expect(await view.validate()).toEqual(['minLength']);
    await view.unmount();
  });

  it('[observation] after every form is gone, which plugin registrations the application instance still holds', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const factory = createValidator(ajv);
    for (let index = 0; index < 12; index++) {
      const view = await mount(formOf(schemaWithId(200 + index), factory));
      await view.validate();
      await view.unmount();
    }
    const held = Object.keys(ajv.refs).filter((key) => key.startsWith('https://r5.invalid/ajv8/lifecycle/'));
    expect(held.length).toBe(8);
  });
});

describe('ajv8: two evaluated plugin copies and release order on one instance', () => {
  const loadCopy = async () => {
    vi.resetModules();
    return import('../../default/index');
  };

  it.each(['first-then-second', 'second-then-first'])('same-$id roots stay isolated and the instance is empty after release (%s)', async (order) => {
    const first = await loadCopy();
    const second = await loadCopy();
    const ajv = new Ajv({ allErrors: true, strict: false });
    const a = first.createValidator(ajv);
    const b = second.createValidator(ajv);
    const id = 'https://r5.invalid/ajv8/copies/same';
    const rootA: JSONSchema = { $id: id, type: 'object', properties: { x: { type: 'string' } } };
    const rootB: JSONSchema = { $id: id, type: 'object', properties: { z: { type: 'string' } } };
    const verdicts = async () => [
      (await a.compile(rootA)({ x: 1, z: 1 }))?.map((issue) => issue.dataPath),
      (await b.compile(rootB)({ x: 1, z: 1 }))?.map((issue) => issue.dataPath),
    ];
    expect(await verdicts()).toEqual([['/x'], ['/z']]);
    if (order === 'first-then-second') {
      a.release?.(rootA);
      expect((await b.compile(rootB)({ z: 1 }))?.map((issue) => issue.dataPath)).toEqual(['/z']);
      const rootC: JSONSchema = { $id: id, type: 'object', properties: { y: { type: 'string' } } };
      expect((await a.compile(rootC)({ y: 1, z: 1 }))?.map((issue) => issue.dataPath)).toEqual(['/y']);
      a.release?.(rootC);
      b.release?.(rootB);
    } else {
      b.release?.(rootB);
      a.release?.(rootA);
    }
    expect({
      refs: Object.keys(ajv.refs).filter((key) => key.includes('r5.invalid') || key.includes('canard.invalid')),
      schemas: Object.keys(ajv.schemas).filter((key) => key.includes('canard.invalid')),
    }).toEqual({ refs: [], schemas: [] });
  });
});
