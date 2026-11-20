import Ajv from 'ajv';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';

import { createValidator, createValidatorFactory } from '../index';
import { runOwnershipFixedSequences } from './utils/ownershipModel/runOwnershipFixedSequences';
import { runOwnershipSequence } from './utils/ownershipModel/runOwnershipSequence';
import { selectOwnershipProfileIndices } from './utils/ownershipModel/selectOwnershipProfileIndices';

const ObserveWeakRef = WeakRef;
const operationKinds = new Set<number>();
let secondCopy: typeof import('../index');
beforeAll(async () => {
  vi.resetModules();
  secondCopy = await import('../index');
});
afterAll(() => {
  expect([...operationKinds].sort((a, b) => a - b)).toEqual(
    Array.from({ length: 17 }, (_, index) => index),
  );
});
afterEach(() => vi.unstubAllGlobals());

it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])(
  'round-5 ownership model: seed batch %i',
  async (batch) => {
    for (const index of selectOwnershipProfileIndices(
      batch,
      process.env.SCHEMA_FORM_TEST_PROFILE !== 'pr',
    )) {
      vi.unstubAllGlobals();
      if (index % 4 === 1 || index % 4 === 3)
        vi.stubGlobal('FinalizationRegistry', undefined);
      if (index % 4 === 2 || index % 4 === 3)
        vi.stubGlobal('WeakRef', undefined);
      const profile = {
        version: 7,
        onOperation: (operation: number) => operationKinds.add(operation),
        direct: index % 2 === 0,
        observe: (root: object) => new ObserveWeakRef(root),
        create: () =>
          new Ajv({
            allErrors: index % 2 === 0,
            logger: false,
            strict: index % 7 === 0,
            validateFormats: index % 5 !== 0,
            meta:
              index % 11 === 0
                ? {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    $id: 'https://ownership-model.invalid/default-meta',
                    type: 'object',
                  }
                : undefined,
            formats:
              index % 13 === 0 ? { 'bootstrap-format': /^valid$/ } : undefined,
            keywords:
              index % 13 === 0
                ? [
                    {
                      keyword: 'bootstrapRule',
                      type: 'string',
                      validate: (_schema: boolean, value: string) =>
                        value.length >= 2,
                    },
                  ]
                : undefined,
            $data: true,
            addUsedSchema: index % 3 !== 0,
            schemas:
              index % 4 === 0
                ? [
                    {
                      $id: 'https://ownership-model.invalid/bootstrap',
                      type: 'string',
                    },
                  ]
                : undefined,
          }),
        createFresh: (source: Ajv) => {
          const options =
            Reflect.get(source, '_opts') ?? Reflect.get(source, 'opts');
          const fresh = new Ajv({
            ...options,
            schemas: undefined,
            keywords: undefined,
            formats: undefined,
            cache: undefined,
            serialize: undefined,
            meta: false,
            validateSchema: false,
          });
          Object.defineProperty(fresh, 'RULES', {
            value: Reflect.get(source, 'RULES'),
          });
          Object.defineProperty(fresh, 'formats', {
            value: Reflect.get(source, 'formats'),
          });
          return fresh;
        },
        addMeta: (instance: Ajv, schema: object, key: string) => {
          instance.addMetaSchema(schema, key, false);
        },
        installRule: (instance: Ajv, mode: number) => {
          instance.removeKeyword('modelRule');
          if (mode === 1)
            instance.addKeyword({
              keyword: 'modelRule',
              type: 'string',
              validate: (_schema: boolean, value: string) => value.length >= 3,
            });
          if (mode === 3)
            instance.addKeyword({
              keyword: 'modelRule',
              type: 'string',
              async: true,
              validate: async (_schema: boolean, value: string) =>
                value.length >= 3,
            });
          if (mode === 4)
            instance.addKeyword({
              keyword: 'modelRule',
              type: 'string',
              $data: true,
              metaSchema: { type: 'number' },
              validate: (limit: number, value: string) => value.length >= limit,
            });
          instance.addFormat(
            'model-format',
            mode === 5
              ? {
                  async: true,
                  validate: async (value: string) => /^valid$/.test(value),
                }
              : mode === 2
                ? /^valid$/
                : /./,
          );
        },
        factory: (instance: Parameters<typeof createValidatorFactory>[0]) =>
          createValidatorFactory(instance),
        adapter: (instance: Ajv) =>
          (index % 2 ? secondCopy.createValidator : createValidator)(instance, {
            directGuardCompile: index % 2 === 0,
          }),
      };
      const seed = 0x5a170000 + batch * 128 + index;
      if (index === 2) await runOwnershipFixedSequences(profile, seed);
      const result = await runOwnershipSequence(profile, seed);
      if (index < 4) {
        setFlagsFromString('--expose_gc');
        const collect = runInNewContext('gc');
        for (let attempt = 0; attempt < 6; attempt++) {
          await new Promise<void>((resolve) => setImmediate(resolve));
          collect();
        }
        const oracleCollected = result.shared.oracle.every(
          (reference) => reference.deref() === undefined,
        );
        expect(
          result.shared.actual.every(
            (reference) => reference.deref() === undefined,
          ),
          `seed=${seed}: shared identity collection equals application-only control`,
        ).toBe(oracleCollected);
        expect(
          result.twin,
          `seed=${seed}: keep application-only owner alive`,
        ).toBeTruthy();
        expect(
          result.roots.every((reference) => reference.deref() === undefined),
          `seed=${seed}: detached roots collected while returned functions remain live`,
        ).toBe(true);
        expect(
          result.functions.length,
          `seed=${seed}: retained function controls`,
        ).toBeGreaterThan(0);
        if (typeof WeakRef === 'function') {
          const probe = {
            type: 'boolean',
          } satisfies import('@canard/schema-form').JSONSchema;
          const adapter = profile.adapter(result.app);
          adapter.compile(probe);
          adapter.release?.(probe);
          const ledgers = Reflect.get(
            globalThis,
            Symbol.for('@canard/schema-form-ajv7-plugin/registrations/v2'),
          );
          expect(ledgers, `seed=${seed}: realm-owned ledger`).toBeInstanceOf(
            WeakMap,
          );
          if (ledgers instanceof WeakMap) {
            const ledger = ledgers.get(result.app);
            expect(
              ledger.pool.count,
              `seed=${seed}: bounded compiler pool`,
            ).toBeLessThanOrEqual(64);
            expect(
              ledger.active.filter((reference: { deref(): unknown }) =>
                reference.deref(),
              ).length,
              `seed=${seed}: finalizer or registration pruning`,
            ).toBe(0);
          }
        }
      }
    }
  },
  120000,
);
