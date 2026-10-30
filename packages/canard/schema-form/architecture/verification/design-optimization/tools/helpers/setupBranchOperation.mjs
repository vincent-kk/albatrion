import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { assertBranchValue } from './assertBranchValue.mjs';
import { buildBranchFixture } from './buildBranchFixture.mjs';
import { materialize } from './materialize.mjs';

/** Prepare B0 operations; injected validator overrides support the missing-validator rejection check. */
export async function setupBranchOperation(row, engine, mod, options = {}) {
  const schema = buildBranchFixture(row, engine === 'legacy');
  let validator;
  const guardCompiles = new Map();
  if (row.gate === 'if') {
    const require = createRequire(
      new URL('../../../../../package.json', import.meta.url),
    );
    const plugin = await import(
      pathToFileURL(require.resolve('@canard/schema-form-ajv8-plugin')).href
    );
    mod.registerPlugin?.(plugin.plugin);
    validator = plugin.plugin.validator;
    if (Object.hasOwn(options, 'validator')) validator = options.validator;
    assert.ok(
      validator?.compileGuard,
      `${row.id}: validator with compileGuard required`,
    );
    const selected = validator;
    validator = {
      ...selected,
      compileGuard(root, pointer) {
        guardCompiles.set(pointer, (guardCompiles.get(pointer) ?? 0) + 1);
        return selected.compileGuard(root, pointer);
      },
    };
  }
  const root =
    engine === 'legacy'
      ? mod.legacyNodeFromJSONSchema({
          jsonSchema: schema,
          validatorFactory: validator?.compile,
          onChange() {},
        })
      : mod.buildFieldNodeTree({
          jsonSchema: schema,
          validator,
          onChange() {},
        });
  if (engine !== 'legacy')
    mod.mountFieldNode(root, undefined, undefined, { deferValidation: false });
  for (let k = 0; k < 8; k++) await Promise.resolve();
  materialize(root);
  assertBranchValue(root, row, 0);
  const leaf = root.find(`${row.hostPath ?? ''}/kind`);
  assert.ok(leaf);
  let index = 0;
  const write = () => {
    index = index === 0 ? row.n - 1 : 0;
    leaf.setValue(`kind_${index}`);
  };
  const settle = async () => {
    for (let k = 0; k < 8; k++) await Promise.resolve();
  };
  return {
    root,
    write,
    guardCompiles,
    checkWrite: () => assertBranchValue(root, row, index),
    run:
      engine === 'legacy'
        ? async () => {
            write();
            await settle();
            write();
            await settle();
          }
        : () => {
            write();
            write();
          },
    check: () => assertBranchValue(root, row, 0),
    preflight: async () => {
      write();
      await settle();
      assertBranchValue(root, row, row.n - 1);
      write();
      await settle();
      assertBranchValue(root, row, 0);
      if (row.gate === 'if') {
        assert.equal(guardCompiles.size, row.n);
        assert.ok(
          [...guardCompiles.values()].every((count) => count === 1),
          'guards must compile once per pointer',
        );
      }
    },
  };
}
