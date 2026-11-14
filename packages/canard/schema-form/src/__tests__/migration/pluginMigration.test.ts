import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/** Public-package comparisons use fresh bundles and an explicitly installed baseline. */
const baseline = process.env.SCHEMA_FORM_MIGRATION_BASELINE;
/** The repository root resolves the current workspace's built public entry points. */
const current = fileURLToPath(new URL('../../../../../../', import.meta.url));
/** Isolated processes keep each release on its own React instance. */
const probe = fileURLToPath(
  new URL('./fixtures/observePluginMigration.cjs', import.meta.url),
);

it.for([
  ['antd5', 'ant-input', 'ant-input-number-input'],
  ['antd6', 'ant-input', 'ant-input-number-input'],
  ['antd-mobile', 'adm-input-element', 'adm-input-element'],
  ['mui', 'MuiInputBase-input', 'MuiInputBase-input'],
])(
  'compares %s union migration against installed 0.16.x',
  { timeout: 30_000 },
  ([plugin, textClass, numberClass], context) => {
    if (!baseline)
      context.skip(
        'Requires SCHEMA_FORM_MIGRATION_BASELINE with core 0.16.1 and UI plugins 0.16.0; see fixtures/README.md.',
      );
    const outputs = [baseline!, current].map((directory) => {
      const stdout = execFileSync(
        process.execPath,
        [probe, resolve(directory), plugin],
        { encoding: 'utf8' },
      );
      const line = stdout
        .split('\n')
        .find((entry) => entry.startsWith('MIGRATION_RESULT '));
      expect(line, `${plugin} probe must finish`).toBeDefined();
      return JSON.parse(line!.slice('MIGRATION_RESULT '.length));
    });
    const [old, next] = outputs;
    expect(old.current).toBe(false);
    expect(next.current).toBe(true);
    for (let index = 0; index < 2; index++) {
      expect(old.results[index].nodeType).toBeUndefined();
      expect(old.results[index].inputType).toBeUndefined();
      expect(old.results[index].errors).toContain(
        'JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA',
      );
      expect(next.results[index]).toMatchObject({
        nodeType: 'union',
        inputType: 'text',
        inputClass: '',
        errors: [],
      });
    }
    expect(next.results[0].afterEdit).toBe('21');
    expect(next.results[1].afterEdit).toBe(21);
    for (const output of outputs) {
      expect(output.results[2]).toMatchObject({
        nodeType: 'string',
        schemaType: 'string',
        value: '42',
        afterEdit: '21',
        errors: [],
      });
      expect(output.results[2].inputClass).toContain(textClass);
      expect(output.results[3]).toMatchObject({
        nodeType: 'number',
        schemaType: 'integer',
        value: 3,
        errors: [],
      });
      expect(output.results[3].inputClass).toContain(numberClass);
    }
    expect(old.hint).toEqual({ type: 'integer' });
    expect(next.hint).toEqual({ type: 'number', schemaType: 'integer' });
    expect(old.inputProps.type).toBe('integer');
    expect(next.inputProps).toMatchObject({
      type: 'number',
      schemaType: 'integer',
      nullable: false,
      misfit: false,
    });
    expect(old.numberTest.marker).toBeUndefined();
    expect(next.numberTest.marker).toBe('probe');
    expect(old.unknownTest.marker).toBeUndefined();
    expect(next.unknownTest.marker).toBe('probe');
    expect(next.warning).toContain(
      'SCHEMA_FORM_WARNING.FIELD_INPUT_TEST_INVALID',
    );
  },
);
