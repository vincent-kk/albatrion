import { act } from 'react';

import { type FormHandle, registerPlugin } from '@canard/schema-form';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import * as draft2019 from '../2019';
import * as draft2020 from '../2020';
import {
  createIsEvenBranchSchemas,
  isEvenKeyword,
} from './fixtures/isEvenBranchSchemas';
import { mountForm } from './utils/mountForm';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/** Lists which of the two branch-owned fields the form currently holds. */
const branchFields = (form: FormHandle) =>
  ['/evenField', '/oddField'].filter((path) => form.findNode(path) !== null);

describe.each([
  ['/2019', draft2019, Ajv2019],
  ['/2020', draft2020, Ajv2020],
] as const)(
  'a custom keyword through the %s entry',
  (_, entry, Constructor) => {
    /**
     * Hands a non-strict instance with `isEven` to the Form the way a consumer does.
     * @param mode - `createValidator` returns a per-instance validator; `bind` binds and registers the entry's plugin
     * @returns The `validatorFactory` prop; undefined lets the Form use the registered plugin
     */
    const supply = (mode: 'createValidator' | 'bind') => {
      const ajv = new Constructor({ strict: false });
      ajv.addKeyword(isEvenKeyword);
      if (mode === 'createValidator') return entry.createValidator(ajv);
      entry.plugin.validator.bind(ajv);
      registerPlugin(entry.plugin);
      return undefined;
    };

    it.each(['createValidator', 'bind'] as const)(
      'decides if/then/else (%s)',
      async (mode) => {
        const { ifSchema } = createIsEvenBranchSchemas();
        const { form, records, unmount } = await mountForm({
          jsonSchema: ifSchema,
          defaultValue: { n: 2 },
          validatorFactory: supply(mode),
        });
        expect(branchFields(form)).toEqual(['/evenField']);
        await act(async () => form.setValue({ n: 3 }));
        expect(branchFields(form)).toEqual(['/oddField']);
        expect(records).toEqual([]);
        await unmount();
      },
    );

    it.each(['createValidator', 'bind'] as const)(
      'chooses a oneOf branch written with if and else: false, reporting nothing (%s)',
      async (mode) => {
        const { oneOfIfSchema } = createIsEvenBranchSchemas();
        const { form, records, unmount } = await mountForm({
          jsonSchema: oneOfIfSchema,
          defaultValue: { n: 2 },
          validatorFactory: supply(mode),
        });
        expect(branchFields(form)).toEqual(['/evenField']);
        await act(async () => form.setValue({ n: 3 }));
        expect(branchFields(form)).toEqual(['/oddField']);
        expect(records).toEqual([]);
        await unmount();
      },
    );
  },
);
