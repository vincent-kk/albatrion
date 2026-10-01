import { describe, expect, it, vi } from 'vitest';
import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';

describe('missing validator', () => {
  it('ERROR-146 ERROR-153 disables an if fragment and warns once per tree', () => {
    const schema = { type: 'object', properties: { enabled: { type: 'boolean' } },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: { properties: { guarded: { type: 'string' } } } };
    const report = vi.fn();
    const { root } = makeSchemaNodeTree(schema, { validator: undefined,
      errorReporter: { report, hasConsumer: () => true } });
    root.setValue({ enabled: true, guarded: 'hidden' });
    expect(root.find('/guarded')).toBeNull();
    root.setValue({ enabled: false });
    expect(report.mock.calls.filter(([record]) =>
      record.code === 'SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR'))
      .toHaveLength(1);
  });
});
