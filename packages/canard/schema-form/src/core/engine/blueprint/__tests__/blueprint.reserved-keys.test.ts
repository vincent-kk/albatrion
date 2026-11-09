import { expect, it } from 'vitest';

import { RESERVED_SCHEMA_KEYS } from '@/schema-form/constants/reservedSchemaKeys';
import { FormErrorCode } from '../../../../errors';
import { blueprint } from '../blueprint';

it('rejects every constrained reserved key at its exact authored path', () => {
  for (const [group, keys] of Object.entries(RESERVED_SCHEMA_KEYS)) {
    for (const [key, rule] of Object.entries(keys)) {
      if (rule.shallow === 'unknown') continue;
      expect(() => blueprint({ type: 'object', [group]: { [key]: 42 } })).toThrow(
        expect.objectContaining({
          code: FormErrorCode.InvalidControlShape,
          details: expect.objectContaining({
            schemaPath: `#/${group}/${key}`,
            group,
            key,
            expected: rule.shallow,
          }),
        }),
      );
    }
  }
});

it('checks each child control in fields and fragment scope', () => {
  for (const [key, rule] of Object.entries(RESERVED_SCHEMA_KEYS.controls)) {
    if (!rule.child || rule.shallow === 'unknown') continue;
    for (const [schema, path] of [
      [{ type: 'object', controls: { fields: [{ targets: [], controls: { [key]: 42 } }] } }, `#/controls/fields/0/controls/${key}`],
      [{ type: 'object', allOf: [{ controls: { [key]: 42 } }] }, `#/allOf/0/controls/${key}`],
    ] as const) {
      expect(() => blueprint(schema)).toThrow(expect.objectContaining({
        code: FormErrorCode.InvalidControlShape,
        details: expect.objectContaining({ schemaPath: path }),
      }));
    }
  }
});

it('keeps unconstrained reserved literal payloads opaque', () => {
  for (const [key, rule] of Object.entries(RESERVED_SCHEMA_KEYS.controls)) {
    if (rule.shallow !== 'unknown') continue;
    for (const value of [null, 42, true, 'literal', [], {}, () => null, Symbol('opaque')])
      expect(() => blueprint({ type: 'string', controls: { [key]: value } })).not.toThrow();
  }
});
