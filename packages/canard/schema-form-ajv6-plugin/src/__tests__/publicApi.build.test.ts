import type { ValidatorPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-ajv6-plugin';
import { describe, expect, it } from 'vitest';

/**
 * Exercises the built `dist/` output rather than `src/`.
 *
 * Importing by the published specifier resolves through package.json `exports`,
 * so this is the only suite that runs what consumers actually install. Every
 * other test in this package imports relatively and therefore only ever sees
 * `src/`.
 *
 * What it guards: `ajv` is a CommonJS dependency reached through a default
 * import, so whether `new Ajv(...)` gets a constructor depends on interop the
 * bundler generates — something no source-level test can observe. A validator
 * that compiles here proves the shipped artifact resolved it correctly.
 */
type CompilableSchema = Parameters<ValidatorPlugin['compile']>[0];

const stringSchema: CompilableSchema = { type: 'string' };

describe('@canard/schema-form-ajv6-plugin 빌드 산출물', () => {
  it('published entry point 로 유효한 데이터를 검증한다', async () => {
    const validate = plugin.validator.compile(stringSchema);

    await expect(validate('hello world')).resolves.toBeNull();
  });

  it('published entry point 로 무효한 데이터의 에러를 보고한다', async () => {
    const validate = plugin.validator.compile(stringSchema);

    const errors = await validate(123);

    expect(errors).toBeInstanceOf(Array);
    expect(errors).not.toHaveLength(0);
  });
});
