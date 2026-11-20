import type { JSONSchema, ValidatorFactory } from '@canard/schema-form';
import { expect } from 'vitest';

import { captureApplicationState } from './captureApplicationState';
import { checkOracleCollisions } from './checkOracleCollisions';
import { compileOracle } from './compileOracle';
import { createFreshOracle } from './createFreshOracle';
import { outcomeOf } from './outcomeOf';
import { runGuardBaseSequence } from './runGuardBaseSequence';
import { runOptionKeySequence } from './runOptionKeySequence';
import { runPoolNamespaceSequence } from './runPoolNamespaceSequence';
import { runRootMutationSequence } from './runRootMutationSequence';
import { runSharedIdentitySequence } from './runSharedIdentitySequence';
import type { ModelApplication, ModelProfile, ModelRoot } from './types';

/** Drive the real adapter and an independent fresh-compiler oracle with one deterministic sequence. */
export const runOwnershipSequence = async <T extends ModelApplication>(
  profile: ModelProfile<T>,
  seed: number,
) => {
  const app = profile.create();
  const twin = profile.create();
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state >>> 8;
  };
  const adapters: { validator: ValidatorFactory; roots: ModelRoot[] }[] = [];
  const roots: WeakRef<object>[] = [];
  const functions: unknown[] = [];
  const shared = await runSharedIdentitySequence(app, twin, profile, seed);
  functions.push(...shared.functions);
  let ruleMode = 0;
  const aliasId = 'https://ownership-model.invalid/alias-id';
  const aliasKey = 'https://ownership-model.invalid/alias-key';
  for (const instance of [app, twin]) {
    const nativeOptions = Reflect.get(instance, '_opts');
    const idKey =
      profile.version === 6 &&
      nativeOptions &&
      typeof nativeOptions === 'object' &&
      Reflect.get(nativeOptions, 'schemaId') === 'id'
        ? 'id'
        : '$id';
    instance.addSchema({ [idKey]: aliasId, type: 'number' }, aliasKey);
    instance.removeSchema(aliasId);
    instance.addSchema({ [idKey]: aliasId, type: 'string' });
  }
  const aliasAdapter = profile.adapter(app);
  for (const reference of [0, 1, 2]) {
    const root: JSONSchema =
      reference === 0
        ? { $ref: aliasKey }
        : reference === 1
          ? { $ref: aliasId }
          : { allOf: [{ $ref: aliasKey }, { $ref: aliasId }] };
    const expected = await compileOracle(
      twin,
      profile,
      root,
      seed % 2 ? 3 : 'x',
    );
    const actual = await outcomeOf(() =>
      aliasAdapter.compile(root)(seed % 2 ? 3 : 'x'),
    );
    expect(
      actual,
      `seed=${seed}: retained alias dimension ${reference}`,
    ).toEqual(expected);
    if (reference === 2) {
      expect(actual, `seed=${seed}: explicit alias conflict`).toMatchObject({
        error: 'Error',
      });
      if ('message' in actual)
        for (const key of [aliasId, aliasKey])
          expect(actual.message).toContain(key);
    }
    roots.push(profile.observe(root));
    aliasAdapter.release?.(root);
  }
  expect(
    captureApplicationState(app),
    `seed=${seed}: alias dimension I1`,
  ).toEqual(captureApplicationState(twin));
  const guardBase = await runGuardBaseSequence(app, twin, profile, seed);
  roots.push(...guardBase.references);
  functions.push(...guardBase.functions);
  const namespaces = await runPoolNamespaceSequence(app, twin, profile, seed);
  roots.push(...namespaces.references);
  functions.push(...namespaces.functions);
  const mutations = await runRootMutationSequence(app, twin, profile, seed);
  roots.push(...mutations.references);
  functions.push(...mutations.functions);
  for (let step = 0; step < 48; step++) {
    const operation = step < 8 ? step : next() % 17;
    profile.onOperation?.(operation);
    const id = `https://ownership-model.invalid/root-${next() % 3}`;
    const embedded = `https://ownership-model.invalid/embedded-${next() % 2}`;
    const variant = next() % 2;
    const context = `AJV${profile.version} seed=${seed} step=${step} operation=${operation}`;
    const schema: JSONSchema = {
      $id: id,
      type: 'object',
      properties: { name: { type: 'string', minLength: variant ? 3 : 1 } },
      definitions: {
        shared: {
          $id: next() % 2 ? embedded : embedded.split('/').pop(),
          type: 'string',
          minLength: 2,
          ...(profile.version === 8 && next() % 2
            ? { $anchor: 'shared', $dynamicAnchor: 'dynamicShared' }
            : {}),
        },
      },
    };
    if (ruleMode && next() % 2 && schema.properties) {
      schema.$async = true;
      schema.properties.name = {
        type: 'string',
        ...(ruleMode === 1 || ruleMode === 3
          ? { modelRule: true }
          : ruleMode === 4
            ? { modelRule: { $data: '1/limit' } }
            : {}),
        ...(ruleMode === 2 || ruleMode === 5 ? { format: 'model-format' } : {}),
      };
    }
    if (schema.properties && next() % 3 === 0)
      schema.properties.link = {
        $ref:
          next() % 2
            ? `https://ownership-model.invalid/root-${next() % 3}`
            : embedded,
      };
    const nativeOptions = Reflect.get(app, '_opts') ?? Reflect.get(app, 'opts');
    if (
      profile.version === 6 &&
      nativeOptions &&
      typeof nativeOptions === 'object' &&
      Reflect.get(nativeOptions, 'schemaId') === 'id'
    ) {
      Reflect.set(schema, 'id', schema.$id);
      delete schema.$id;
      if (
        schema.definitions?.shared &&
        typeof schema.definitions.shared === 'object'
      ) {
        Reflect.set(
          schema.definitions.shared,
          'id',
          schema.definitions.shared.$id,
        );
        delete schema.definitions.shared.$id;
      }
    }
    if (operation <= 4 || operation === 16) {
      const applicationCall = (instance: T) => {
        if (operation === 16)
          return instance.validate(JSON.parse(JSON.stringify(schema)), {
            name: 'x',
          });
        if (operation === 0) {
          instance.addSchema(JSON.parse(JSON.stringify(schema)));
          return null;
        }
        if (operation === 1)
          return instance.compile(JSON.parse(JSON.stringify(schema)))({
            name: 'x',
          });
        if (operation === 2)
          return instance.validate(nextAddress, { name: 'x' });
        if (operation === 3) {
          const validate = instance.getSchema(nextAddress);
          return validate ? validate({ name: 'x' }) : undefined;
        }
        instance.removeSchema(removal);
        return null;
      };
      const nextAddress = next() % 2 ? id : embedded;
      const removal =
        next() % 4 === 0
          ? undefined
          : next() % 4 === 0
            ? /^https:\/\/ownership-model\.invalid\//
            : nextAddress;
      expect(await outcomeOf(() => applicationCall(app)), context).toEqual(
        await outcomeOf(() => applicationCall(twin)),
      );
    } else if (operation === 5) {
      ruleMode = next() % 6;
      profile.installRule(app, ruleMode);
      profile.installRule(twin, ruleMode);
    } else if (operation === 12) {
      const meta = {
        $id: 'https://ownership-model.invalid/meta',
        type: 'object',
        properties: { minLength: { type: 'integer', minimum: next() % 2 } },
      };
      for (const instance of [app, twin]) {
        instance.removeSchema(meta.$id);
        profile.addMeta(instance, JSON.parse(JSON.stringify(meta)), meta.$id);
      }
    } else if (operation === 13) {
      if (next() % 2) {
        const result = await runOptionKeySequence(
          app,
          twin,
          profile,
          next(),
          context,
        );
        roots.push(...result.references);
        functions.push(...result.functions);
      } else {
        const allErrors = !!(next() % 2);
        for (const instance of [app, twin]) {
          const options =
            Reflect.get(instance, '_opts') ?? Reflect.get(instance, 'opts');
          if (options && typeof options === 'object')
            Reflect.set(options, 'allErrors', allErrors);
        }
      }
    } else if (operation === 6 || !adapters.length) {
      if (adapters.length === 4) adapters.shift();
      adapters.push({ validator: profile.adapter(app), roots: [] });
    } else if (operation === 7) {
      const removed = adapters.shift();
      if (removed) removed.roots.length = 0;
    } else {
      const adapter = adapters[next() % adapters.length];
      if (operation === 11 && adapter.roots.length) {
        const record = adapter.roots.shift();
        if (record) {
          adapter.validator.release?.(record.schema);
          adapter.validator.release?.(record.schema);
        }
      } else if (operation === 10 && adapter.roots.length) {
        const record = adapter.roots[next() % adapter.roots.length];
        expect(
          await outcomeOf(() => record.validate(record.data)),
          context,
        ).toEqual(record.verdict);
        const expected = await compileOracle(
          twin,
          profile,
          record.schema,
          record.data,
        );
        const actual = await outcomeOf(() =>
          adapter.validator.compile(record.schema)(record.data),
        );
        if ('error' in expected)
          expect(actual, context).toHaveProperty('error');
        else expect(actual, context).toEqual(expected);
        expect(
          await outcomeOf(() => record.validate(record.data)),
          context,
        ).toEqual(record.verdict);
      } else if (operation === 14) {
        const root: JSONSchema = {
          $id: id,
          type: 'object',
          definitions: { condition: { type: 'string', minLength: 3 } },
          if:
            next() % 2
              ? { type: 'string', minLength: 3 }
              : { $ref: '#/definitions/condition' },
        };
        const expected = await outcomeOf(() => {
          const fresh = createFreshOracle(twin, profile, root);
          if (
            profile.direct &&
            root.if &&
            typeof root.if === 'object' &&
            !('$ref' in root.if)
          )
            return fresh.compile(root.if)('x');
          checkOracleCollisions(twin, root, profile.version);
          fresh.addSchema(root, 'urn:model:guard');
          return fresh.compile({ $ref: 'urn:model:guard#/if' })('x');
        });
        let predicate: ((value: unknown) => boolean) | undefined;
        const actual = await outcomeOf(() => {
          predicate = adapter.validator.compileGuard?.(root, '/if');
          return predicate?.('x');
        });
        if ('error' in expected)
          expect(actual, context).toHaveProperty('error');
        else expect(actual, context).toEqual(expected);
        roots.push(profile.observe(root));
        if (predicate) functions.push(predicate);
      } else {
        const rootChoice = next() % 4;
        const root: JSONSchema =
          rootChoice === 2
            ? { $ref: id }
            : rootChoice === 3
              ? { $ref: embedded }
              : rootChoice === 0
                ? JSON.parse(JSON.stringify(schema))
                : {
                    type: 'object',
                    properties: {
                      "it's/~/x": { type: 'string' },
                      '': { type: 'string' },
                      name: { type: 'string', minLength: 3 },
                    },
                  };
        if (next() % 3 === 0 && 'properties' in root && root.properties)
          root.properties.name = {
            type: 'string',
            ...(ruleMode === 1 || ruleMode === 3
              ? { modelRule: true }
              : ruleMode === 4
                ? { modelRule: { $data: '1/limit' } }
                : {}),
            ...(ruleMode === 2 || ruleMode === 5
              ? { format: 'model-format' }
              : {}),
          };
        if (ruleMode === 3 || ruleMode === 5) root.$async = true;
        const references =
          Reflect.get(app, '_refs') ?? Reflect.get(app, 'refs');
        if (
          references &&
          typeof references === 'object' &&
          Object.prototype.hasOwnProperty.call(
            references,
            'https://ownership-model.invalid/meta',
          ) &&
          next() % 2
        )
          root.$schema = 'https://ownership-model.invalid/meta';
        const data = { name: 'x', limit: 3, "it's/~/x": 3, '': false };
        if (operation === 15) {
          const retryId = 'https://ownership-model.invalid/retry';
          root.properties = { name: { $ref: retryId } };
          app.removeSchema(retryId);
          twin.removeSchema(retryId);
          const failed = await outcomeOf(() => adapter.validator.compile(root));
          expect('error' in failed, context).toBe(true);
          const retry = {
            $id: retryId,
            ...(profile.version === 6 ? { id: retryId } : {}),
            type: 'string',
            minLength: 3,
          };
          app.addSchema({ ...retry });
          twin.addSchema({ ...retry });
        }
        const expected = await compileOracle(twin, profile, root, data);
        let validate: ReturnType<ValidatorFactory['compile']> | undefined;
        const actual = await outcomeOf(async () => {
          validate = adapter.validator.compile(root);
          return validate(data);
        });
        // A schema with several independent compile failures has no specified failure precedence.
        if ('error' in expected)
          expect(
            actual,
            `${context} expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`,
          ).toHaveProperty('error');
        else
          expect(
            actual,
            `${context} actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`,
          ).toEqual(expected);
        if (validate && !('error' in actual)) {
          functions.push(validate);
          roots.push(profile.observe(root));
          adapter.roots.push({ schema: root, validate, verdict: actual, data });
          if (adapter.roots.length > 8) {
            const old = adapter.roots.shift();
            if (old) adapter.validator.release?.(old.schema);
          }
        }
      }
    }
    expect(captureApplicationState(app), context).toEqual(
      captureApplicationState(twin),
    );
  }
  for (const adapter of adapters) {
    for (const record of adapter.roots)
      adapter.validator.release?.(record.schema);
    adapter.roots.length = 0;
  }
  adapters.length = 0;
  if (seed % 128 === 0) {
    const before = captureApplicationState(app);
    const adapter = profile.adapter(app);
    for (let index = 0; index < 70; index++) {
      const root: JSONSchema = {
        ...(index % 2
          ? { $id: `https://ownership-model.invalid/pool-${index % 3}` }
          : {}),
        type: 'string',
        minLength: 3,
      };
      const validate = adapter.compile(root);
      expect(
        await validate('ok'),
        `seed=${seed}: pool rotation ${index}`,
      ).not.toBeNull();
      roots.push(profile.observe(root));
      functions.push(validate);
      if (index % 3 === 0) {
        adapter.release?.(root);
        adapter.release?.(root);
      }
    }
    expect(
      captureApplicationState(app),
      `seed=${seed}: pool rotation leaves application unchanged`,
    ).toEqual(before);
  }
  return { app, twin, roots, functions, shared };
};
