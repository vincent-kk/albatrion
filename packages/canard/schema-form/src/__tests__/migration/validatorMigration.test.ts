import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/** Installed baseline is explicit; ordinary unit runs never fetch a release. */
const baseline = process.env.SCHEMA_FORM_MIGRATION_BASELINE;
const current = fileURLToPath(new URL('../../../../../../', import.meta.url));
const probe = fileURLToPath(
  new URL('./fixtures/observeValidatorMigration.cjs', import.meta.url),
);

it('compares AJV bind refusal and union verdict/log migration against 0.16.0', (context) => {
  if (!baseline)
    context.skip(
      'Requires SCHEMA_FORM_MIGRATION_BASELINE with AJV plugins 0.16.0; see fixtures/README.md.',
    );
  const [old, next] = [baseline!, current].map((directory) =>
    JSON.parse(
      execFileSync(process.execPath, [probe, directory], { encoding: 'utf8' }),
    ),
  );
  for (let index = 0; index < 3; index++) {
    expect(old[index].version).toBe(next[index].version);
    expect(old[index].bindings).toEqual(
      ['coerceTypes', 'useDefaults', 'removeAdditional'].map((option) => ({
        option,
        accepted: true,
      })),
    );
    expect(next[index].bindings).toEqual(
      ['coerceTypes', 'useDefaults', 'removeAdditional'].map((option) => ({
        option,
        code: 'UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED',
      })),
    );
  }
  for (let index = 3; index < 6; index++) {
    expect(old[index].suffix).toBe(next[index].suffix);
    expect(
      old[index].warn.some(
        (message: string) =>
          message.includes('allowUnionTypes') &&
          message.includes('strictTypes'),
      ),
    ).toBe(true);
    expect(next[index].warn).toEqual([]);
    expect(old[index].verdicts).toEqual([0, 0, 1]);
    expect(next[index].verdicts).toEqual(old[index].verdicts);
  }
});
