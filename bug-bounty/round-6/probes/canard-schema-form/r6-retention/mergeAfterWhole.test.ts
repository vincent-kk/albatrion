import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { SetValueOption, ValidationMode } from '@/schema-form';

it.each([{ label: 'empty array', list: [] }, { label: 'nonempty array', list: ['new'] }, { label: 'omitted array', list: undefined }])(
  'an empty Merge preserves preceding inactive whole input ($label) in one batch',
  ({ list }) => {
    const run = (batch: boolean) => {
      const root = nodeFromJSONSchema({
        jsonSchema: { type: 'object', properties: {
          open: { type: 'boolean' },
          box: { type: 'object', properties: {
            held: { type: 'object', controls: { active: '/open === true' }, properties: {
              a: { type: 'string' }, list: { type: 'array', items: { type: 'string' } },
            } },
          } },
        } },
        defaultValue: { open: false, box: { held: { a: 'old', list: ['old'] } } },
        validationMode: ValidationMode.None,
      });
      const write = () => {
        root.find('/box')!.setValue({ held: { a: 'new', list } });
        root.setValue({ box: { held: {} } }, SetValueOption.Merge);
      };
      if (batch) root.batch(write); else write();
      const inactive = root.inactiveValues;
      root.find('/open')!.setValue(true);
      return { inactive, value: root.find('/box/held')!.value };
    };
    expect(run(true)).toEqual(run(false));
    expect(run(true).value).toEqual({ a: 'new', ...(list?.length ? { list } : {}) });
  },
);
