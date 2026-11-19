import { act, useMemo } from 'react';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@canard/schema-form';
import Ajv from 'ajv';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../default/index';

/**
 * Round 5, hunter r5-ajv-ownership (angle LC4).
 * The documented pattern is one application AJV instance at module scope and a Form-specific
 * adapter `createValidator(ajv)` "created outside render or memoized with stable dependencies"
 * (documents/docs/canard/schema-form/validation.mdx:84). A route component that memoizes its
 * adapter creates a new adapter on every mount. The core releases a root only on eviction from
 * the adapter's recent list (more than eight), so the last root of a dropped adapter is never
 * released; the adapter's own FinalizationRegistry is dropped together with it.
 */
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

setFlagsFromString('--expose_gc');
const gc = runInNewContext('gc') as () => void;

/** Run several collections with task turns between them, so WeakRefs clear and finalizers may run. */
const collect = async () => {
  for (let index = 0; index < 6; index++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    gc();
  }
  await new Promise((resolve) => setTimeout(resolve, 20));
};

const ID = 'https://r5.invalid/ajv8/route-form.json';
const schema = {
  $id: ID,
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
} satisfies JSONSchema;

const verdictOf = async (compile: () => (value: unknown) => unknown) => {
  try {
    const issues = (await compile()({ name: 'ab' })) as { keyword: string; dataPath: string }[] | null;
    return issues?.map(({ keyword, dataPath }) => `${keyword} ${dataPath}`) ?? [];
  } catch (error) {
    return `compile threw: ${(error as Error).message}`;
  }
};

/** One route visit: a new adapter, a compile of the engine copy, no release (the root stays in the adapter's recent list). */
const visitWithoutRelease = async (ajv: Ajv) => {
  const validator = createValidator(ajv);
  const verdict = await verdictOf(() => validator.compile(JSON.parse(JSON.stringify(schema))));
  return { verdict, adapter: new WeakRef(validator) };
};

describe('ajv8: a dropped per-mount adapter and the shared application instance', () => {
  it('[diagnostic] a FinalizationRegistry that is itself dropped does not run its cleanup', async () => {
    let called = false;
    (() => {
      const registry = new FinalizationRegistry(() => {
        called = true;
      });
      registry.register({}, 1);
    })();
    await collect();
    expect(called).toBe(false);
  });

  it('[control] a second visit before the first adapter is collected validates', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const first = await visitWithoutRelease(ajv);
    expect(first.verdict).toEqual(['minLength /name']);
    const second = await visitWithoutRelease(ajv);
    expect(second.verdict).toEqual(['minLength /name']);
  });

  it('[control] when the first adapter releases its root, a later visit validates after collection', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    await (async () => {
      const validator = createValidator(ajv);
      const copy = JSON.parse(JSON.stringify(schema));
      expect(await verdictOf(() => validator.compile(copy))).toEqual(['minLength /name']);
      validator.release?.(copy);
    })();
    await collect();
    expect((await visitWithoutRelease(ajv)).verdict).toEqual(['minLength /name']);
  });

  it('after every adapter is gone, the application instance no longer holds the form copy under its $id', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const first = await visitWithoutRelease(ajv);
    expect(first.verdict).toEqual(['minLength /name']);
    await collect();
    expect(first.adapter.deref()).toBeUndefined();
    expect(Object.keys(ajv.refs).filter((key) => key === ID)).toEqual([]);
  });

  it('a second visit after the first adapter was collected validates the same way as before collection', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const first = await visitWithoutRelease(ajv);
    expect(first.verdict).toEqual(['minLength /name']);
    await collect();
    expect(first.adapter.deref()).toBeUndefined();
    expect((await visitWithoutRelease(ajv)).verdict).toEqual(['minLength /name']);
  });
});

/** Route component that memoizes its adapter with stable dependencies, as the documents allow. */
const ajvAtModuleScope = new Ajv({ allErrors: true, strict: false });
const RouteForm = ({ onHandle }: { onHandle: (handle: FormHandle | null) => void }) => {
  const validatorFactory = useMemo(() => createValidator(ajvAtModuleScope), []);
  return (
    <Form
      ref={onHandle}
      jsonSchema={schema}
      defaultValue={{ name: 'ab' }}
      validationMode={ValidationMode.OnRequest}
      errorVisibility={ErrorVisibility.Always}
      validatorFactory={validatorFactory}
    />
  );
};

const visitRoute = async () => {
  const container = document.body.appendChild(document.createElement('div'));
  const reactRoot = createRoot(container);
  let handle: FormHandle | null = null;
  await act(async () => {
    reactRoot.render(<RouteForm onHandle={(form) => void (handle = form)} />);
  });
  const form = handle as unknown as FormHandle;
  let outcome: unknown;
  await act(async () => {
    try {
      await form.validate();
      outcome = form.findNode('/name')?.errors.map((issue) => issue.keyword) ?? 'no node';
    } catch (error) {
      outcome = `validate rejected: ${(error as Error).message}`;
    }
  });
  await act(async () => reactRoot.unmount());
  container.remove();
  return outcome;
};

describe('ajv8: a route Form with a memoized createValidator, visited twice', () => {
  it('the second visit after collection reports the same field error as the first visit', async () => {
    expect(await visitRoute()).toEqual(['minLength']);
    await collect();
    const leftover = Object.keys(ajvAtModuleScope.refs).filter((key) => key === ID);
    expect({ leftover, second: await visitRoute() }).toEqual({ leftover: [], second: ['minLength'] });
  });
});
