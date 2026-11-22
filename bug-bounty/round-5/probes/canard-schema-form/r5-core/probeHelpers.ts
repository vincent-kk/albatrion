import { ValidationMode } from '@/schema-form';
import type { FormErrorRecord } from '@/schema-form/errors';

import { buildFieldNodeTree } from '../../core/surface/utils/binding/buildFieldNodeTree';
import { mountFieldNode } from '../../core/surface/utils/binding/mountFieldNode';

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

/** Run a call and return the code or message of what it threw, or undefined. */
export const attempt = (run: () => unknown): unknown => {
  try {
    run();
  } catch (error) {
    return (error as any)?.code ?? (error as any)?.message ?? error;
  }
  return undefined;
};
