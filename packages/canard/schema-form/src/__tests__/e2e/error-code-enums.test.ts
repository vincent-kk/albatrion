import { describe, expect, it } from 'vitest';

import { FormErrorCode, FormWarningCode } from '../../index';

describe('root error and warning code enums', () => {
  it('exports group-qualified error and warning codes', () => {
    expect(FormErrorCode.RenderFailed).toBe('SCHEMA_FORM_ERROR.RENDER_FAILED');
    expect(FormErrorCode.UnknownJsonSchema).toBe(
      'JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA',
    );
    expect(FormErrorCode.RegisterPlugin).toBe(
      'UNHANDLED_ERROR.REGISTER_PLUGIN',
    );
    expect(FormErrorCode.SchemaValidationFailed).toBe(
      'VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED',
    );
    expect(FormErrorCode.ReservedPropertyName).toBe(
      'JSON_SCHEMA_ERROR.RESERVED_PROPERTY_NAME',
    );
    expect(FormWarningCode.Misfit).toBe('SCHEMA_FORM_WARNING.MISFIT');
    expect(Object.keys(FormErrorCode)).toHaveLength(42);
    expect(FormWarningCode.DetachedNodeWrite).toBe(
      'SCHEMA_FORM_WARNING.DETACHED_NODE_WRITE',
    );
    expect(FormWarningCode.InactiveValueWithUnsetOnInactive).toBe(
      'SCHEMA_FORM_WARNING.INACTIVE_VALUE_WITH_UNSET_ON_INACTIVE',
    );
    expect(FormWarningCode.WriteInInactiveResolver).toBe(
      'SCHEMA_FORM_WARNING.WRITE_IN_INACTIVE_RESOLVER',
    );
    expect(Object.keys(FormWarningCode)).toHaveLength(20);
  });
});
