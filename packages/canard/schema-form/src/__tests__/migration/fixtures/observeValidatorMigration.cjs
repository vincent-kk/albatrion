// Loaded by validatorMigration.test.ts; argv[2] selects the independent installed release.
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const req = createRequire(resolve(process.argv[2], 'package.json'));
(async () => {
  const output = [];
  for (const version of ['ajv6', 'ajv7', 'ajv8']) {
    const name = '@canard/schema-form-' + version + '-plugin';
    const entry = req.resolve(name);
    const plugin = req(name).plugin.validator;
    const ajvModule = createRequire(entry)('ajv');
    const Ajv = ajvModule.default ?? ajvModule;
    const bindings = [];
    for (const option of ['coerceTypes', 'useDefaults', 'removeAdditional']) {
      try {
        plugin.bind(new Ajv({ [option]: true }));
        bindings.push({ option, accepted: true });
      } catch (error) {
        bindings.push({ option, code: error.code });
      }
    }
    output.push({ version, bindings });
  }
  for (const suffix of ['', '/2019', '/2020']) {
    const name = '@canard/schema-form-ajv8-plugin' + suffix;
    delete req.cache[req.resolve(name)];
    const warn = [];
    const original = console.warn;
    console.warn = (...a) => warn.push(a.join(' '));
    try {
      const plugin = req(name).plugin.validator;
      const compile = typeof plugin === 'function' ? plugin : plugin.compile;
      const validate = compile({ type: ['string', 'number'] });
      output.push({
        suffix,
        warn,
        verdicts: await Promise.all(
          ['x', 1, true].map(async (v) => (await validate(v))?.length ?? 0),
        ),
      });
    } finally {
      console.warn = original;
    }
  }
  console.log(JSON.stringify(output));
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
