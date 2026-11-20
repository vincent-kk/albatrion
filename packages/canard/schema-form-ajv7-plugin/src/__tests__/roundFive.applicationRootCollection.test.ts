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
  for (const after of [false, true])
    for (const child of [false, true])
      for (const entry of ['validation', 'factory', 'direct', 'context']) {
        const source = new Ajv({
          allErrors: true,
          strict: false,
          logger: false,
        });
        const twin = new Ajv({ allErrors: true, strict: false, logger: false });
        const state = (() => {
          const key = `https://shared-resource.invalid/${child}/${entry}`;
          const actual = makeDocument(child, key),
            oracle = makeDocument(child, key);

          const adapter = createValidator(source, {
            directGuardCompile: entry === 'direct',
          });
          const compile =
            entry === 'factory'
              ? createValidatorFactory(source)
              : adapter.compile;
          let previous: ValidateFunction | undefined;
          if (after) {
            const field = child ? 'value' : 'next';
            const properties = actual.root.properties,
              oracleProperties = oracle.root.properties;
            if (!properties || !oracleProperties)
              throw new Error('Missing shared properties');
            const reference = properties[field],
              oracleReference = oracleProperties[field];
            if (reference === undefined || oracleReference === undefined)
              throw new Error('Missing shared reference');
            delete properties[field];
            delete oracleProperties[field];
            previous = compile(actual.root);
            properties[field] = reference;
            oracleProperties[field] = oracleReference;
          }
          source.addSchema(actual.resource, key);
          twin.addSchema(oracle.resource, key);
          const validate: ValidateFunction | ((value: unknown) => boolean) =
            entry === 'factory'
              ? compile(actual.root)
              : entry === 'validation'
                ? compile(actual.root)
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
            previous,
            previousInput: actual.invalid,
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
        const context = `after=${after} child=${child} entry=${entry}`;
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
        if (state.previous)
          expect(
            await state.previous(state.previousInput),
            `${context}: earlier snapshot`,
          ).toBeNull();
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
