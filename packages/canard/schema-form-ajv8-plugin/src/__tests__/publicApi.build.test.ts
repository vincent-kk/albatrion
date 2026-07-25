import type { ValidatorPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as plugin2019 } from '@canard/schema-form-ajv8-plugin/2019';
import { plugin as plugin2020 } from '@canard/schema-form-ajv8-plugin/2020';
import { describe, expect, it } from 'vitest';

/**
 * Exercises the built `dist/` output rather than `src/`.
 *
 * Importing by the published specifiers resolves through package.json `exports`,
 * so this is the only suite that runs what consumers actually install. Every
 * other test in this package imports relatively and therefore only ever sees
 * `src/`.
 *
 * What it guards: this package has three separate entry points, and the two
 * draft-specific ones reach ajv through subpaths (`ajv/dist/2019`). ajv ships no
 * `exports` map, so Node's ESM resolver takes such a subpath literally and will
 * not try extensions — an extensionless specifier compiles and bundles fine yet
 * fails to load for any ESM consumer. Only importing the built entry points
 * catches that, and only compiling proves the CommonJS interop yielded a
 * constructor.
 */
type CompilableSchema = Parameters<ValidatorPlugin['compile']>[0];

const stringSchema: CompilableSchema = { type: 'string' };

describe.each([
  ['.', plugin],
  ['./2019', plugin2019],
  ['./2020', plugin2020],
])('@canard/schema-form-ajv8-plugin 빌드 산출물 — %s', (_subpath, entry) => {
  it('유효한 데이터를 검증한다', async () => {
    const validate = entry.validator.compile(stringSchema);

    await expect(validate('hello world')).resolves.toBeNull();
  });

  it('무효한 데이터의 에러를 보고한다', async () => {
    const validate = entry.validator.compile(stringSchema);

    const errors = await validate(123);

    expect(errors).toBeInstanceOf(Array);
    expect(errors).not.toHaveLength(0);
  });
});
