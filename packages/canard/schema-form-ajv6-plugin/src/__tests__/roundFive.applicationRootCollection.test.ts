import type { ValidateFunction } from '@canard/schema-form';
import Ajv from 'ajv';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

import { createValidator, createValidatorFactory } from '../index';
import { makeDocument } from './utils/applicationRootCollection/makeDocument';

it('removed application resources do not keep a shared caller document or descendant alive', async () => {
  setFlagsFromString('--expose_gc');
  const collect = runInNewContext('gc');
  for (const child of [false, true])
    for (const entry of ['validation', 'factory', 'direct', 'context']) {
      const source = new Ajv({ allErrors: true, logger: false });
      const twin = new Ajv({ allErrors: true, logger: false });
      const state = (() => {
        const key = `https://shared-resource.invalid/${child}/${entry}`;
        const actual = makeDocument(child, key),
          oracle = makeDocument(child, key);
        source.addSchema(actual.resource, key);
        twin.addSchema(oracle.resource, key);
        const adapter = createValidator(source, {
          directGuardCompile: entry === 'direct',
        });
        const validate: ValidateFunction | ((value: unknown) => boolean) =
          entry === 'factory'
            ? createValidatorFactory(source)(actual.root)
            : entry === 'validation'
              ? adapter.compile(actual.root)
              : (() => {
                  const guard = adapter.compileGuard?.(
                    actual.root,
                    actual.pointer,
                  );
                  if (!guard) throw new Error('Missing guard');
                  return guard;
                })();
        const actualReferences = [
          new WeakRef(actual.root),
          new WeakRef(actual.resource),
        ];
        const oracleReferences = [
          new WeakRef(oracle.root),
          new WeakRef(oracle.resource),
        ];
        source.removeSchema();
        twin.removeSchema();
        return {
          validate,
          actualReferences,
          oracleReferences,
          valid:
            entry === 'validation' || entry === 'factory'
              ? actual.valid
              : actual.guardValid,
          invalid:
            entry === 'validation' || entry === 'factory'
              ? actual.invalid
              : actual.guardInvalid,
        };
      })();
      for (let attempt = 0; attempt < 8; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        collect();
      }
      const context = `child=${child} entry=${entry}`;
      expect(
        state.oracleReferences.every(
          (reference) => reference.deref() === undefined,
        ),
        `${context}: application-only collection control`,
      ).toBe(true);
      expect
        .soft(
          state.actualReferences.every(
            (reference) => reference.deref() === undefined,
          ),
          `${context}: detached form metadata`,
        )
        .toBe(true);
      const valid = await state.validate(state.valid),
        invalid = await state.validate(state.invalid);
      expect(
        valid === true || valid === null,
        `${context}: old snapshot valid`,
      ).toBe(true);
      expect(
        invalid === false || Array.isArray(invalid),
        `${context}: old snapshot invalid`,
      ).toBe(true);
    }
}, 120000);
