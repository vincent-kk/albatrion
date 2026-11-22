import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ValidationMode } from '@/schema-form';
import type { FormErrorRecord } from '@/schema-form/errors';

import { buildFieldNodeTree } from '../../core/surface/utils/binding/buildFieldNodeTree';
import { mountFieldNode } from '../../core/surface/utils/binding/mountFieldNode';

/** Diagnostic sink outside the repository. */
export const DIAG_FILE = join(tmpdir(), 'r3-engine-diag.log');

/** Append one labelled diagnostic line. */
export const diag = (label: string, value: unknown) => {
  appendFileSync(
    DIAG_FILE,
    `${label} ${JSON.stringify(value, (_k, v) =>
      typeof v === 'number' && !Number.isFinite(v)
        ? String(v)
        : Object.is(v, -0)
          ? '-0'
          : v,
    )}\n`,
  );
};

/** Build and mount like <Form>, capturing reports, onChange calls and a mount throw. */
export const build = (jsonSchema: any, defaultValue?: any, extra: any = {}) => {
  const records: FormErrorRecord[] = [];
  const changes: unknown[] = [];
  const root: any = buildFieldNodeTree({
    jsonSchema,
    defaultValue,
    validationMode: ValidationMode.None,
    onChange: (value: unknown) => changes.push(value),
    errorReporter: {
      hasConsumer: () => true,
      report: (record: FormErrorRecord) => records.push(record),
    },
    ...extra,
  } as any);
  let mountError: unknown;
  try {
    mountFieldNode(root, undefined, undefined, {
      deferValidation: extra.deferMountValidation ?? false,
    });
  } catch (error) {
    mountError = error;
  }
  return { root, records, changes, mountError };
};

/** Run a write and return what it threw. */
export const attempt = (run: () => unknown): unknown => {
  try {
    run();
  } catch (error) {
    return error;
  }
  return undefined;
};

/** Codes of captured reports. */
export const codes = (records: FormErrorRecord[]) => records.map((r) => r.code);
