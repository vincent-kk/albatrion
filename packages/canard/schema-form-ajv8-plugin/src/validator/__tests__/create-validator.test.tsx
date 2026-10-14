import { act } from 'react';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  type ValidatorFactory,
} from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';

import { createValidator as createValidator2019 } from '../../2019/createValidator';
import { ajvValidatorPlugin as plugin2019 } from '../../2019/validatorPlugin';
import { createValidator as createValidator2020 } from '../../2020/createValidator';
import { ajvValidatorPlugin as plugin2020 } from '../../2020/validatorPlugin';
import { createValidator } from '../../default/createValidator';
import { ajvValidatorPlugin } from '../../default/validatorPlugin';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/** A guarded shape whose `extra` child exists only while `kind` is "a" and must be two characters. */
const guardedSchema = {
  type: 'object',
  properties: { kind: { type: 'string' } },
  if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
  then: { properties: { extra: { type: 'string', minLength: 2 } } },
} as unknown as JSONSchema;

/** Two violations on one value, so `allErrors` decides between one and two issues. */
const twoIssuesSchema = {
  type: 'string',
  minLength: 5,
  pattern: '^[a-z]+$',
} as unknown as JSONSchema;

const entries = [
  [
    '.',
    createValidator,
    ajvValidatorPlugin,
    (options?: ConstructorParameters<typeof Ajv>[0]) =>
      new Ajv({ strict: false, ...options }),
    'http://json-schema.org/draft-07/schema#',
  ],
  [
    './2019',
    createValidator2019,
    plugin2019,
    (options?: ConstructorParameters<typeof Ajv2019>[0]) =>
      new Ajv2019({ strict: false, ...options }),
    'https://json-schema.org/draft/2019-09/schema',
  ],
  [
    './2020',
    createValidator2020,
    plugin2020,
    (options?: ConstructorParameters<typeof Ajv2020>[0]) =>
      new Ajv2020({ strict: false, ...options }),
    'https://json-schema.org/draft/2020-12/schema',
  ],
] as const;

describe.each(entries)(
  'createValidator for one AJV instance — %s',
  (_entry, create, plugin, instance, dialect) => {
    it('returns an object satisfying the core validator contract with the entry dialect', () => {
      const validator: ValidatorFactory = create(instance());
      expect(validator.compile).toBeTypeOf('function');
      expect(validator.compileGuard).toBeTypeOf('function');
      expect(validator.release).toBeTypeOf('function');
      expect(validator.dialect).toBe(dialect);
    });

    it('validates and guards a Form that receives it as validatorFactory', async () => {
      const container = document.body.appendChild(
        document.createElement('div'),
      );
      const reactRoot = createRoot(container);
      let handle: FormHandle | null = null;
      await act(async () => {
        reactRoot.render(
          <Form
            ref={(form) => void (handle = form)}
            jsonSchema={guardedSchema}
            defaultValue={{ kind: 'b' }}
            validationMode={ValidationMode.OnRequest}
            validatorFactory={create(instance())}
          />,
        );
      });
      const form = handle!;
      expect(form.findNode('/extra')).toBeNull();
      await act(async () => form.findNode('/kind')!.setValue('a'));
      expect(form.findNode('/extra')).not.toBeNull();
      await act(async () => form.findNode('/extra')!.setValue('x'));
      await act(async () => void (await form.validate()));
      expect(form.findNode('/extra')!.errors).toEqual([
        expect.objectContaining({ keyword: 'minLength' }),
      ]);
      await act(async () => form.findNode('/extra')!.setValue('xy'));
      await act(async () => void (await form.validate()));
      expect(form.findNode('/extra')!.errors).toEqual([]);
      await act(async () => reactRoot.unmount());
      container.remove();
    });

    it('keeps each instance separate from the others and from the bound plugin', async () => {
      const firstOnly = create(instance({ allErrors: false }));
      const all = create(instance({ allErrors: true }));
      const bound = instance({ allErrors: true });
      plugin.bind(bound);
      expect(await firstOnly.compile(twoIssuesSchema)('A')).toHaveLength(1);
      expect(await all.compile(twoIssuesSchema)('A')).toHaveLength(2);
      expect(await plugin.compile(twoIssuesSchema)('A')).toHaveLength(2);
    });

    it.each([
      [{ coerceTypes: true }, ['coerceTypes']],
      [{ useDefaults: true }, ['useDefaults']],
      [{ removeAdditional: true }, ['removeAdditional']],
      [
        { coerceTypes: true, useDefaults: true, removeAdditional: true },
        ['coerceTypes', 'useDefaults', 'removeAdditional'],
      ],
    ] as const)(
      'refuses a modifying instance like bind (%o)',
      (options, names) => {
        expect(() => create(instance(options))).toThrowError(
          expect.objectContaining({
            name: 'ValidatorBindRefusedError',
            group: 'UNHANDLED_ERROR',
            code: 'VALIDATOR_BIND_REFUSED',
            details: { options: names },
          }),
        );
      },
    );

    it('lets several validators and the bound plugin share one instance with $id roots', async () => {
      const ajv = instance();
      const first = create(ajv);
      const second = create(ajv);
      plugin.bind(ajv);
      const rootA = {
        $id: 'https://example.test/shared-a',
        type: 'string',
      } as unknown as JSONSchema;
      const rootB = {
        $id: 'https://example.test/shared-b',
        type: 'string',
      } as unknown as JSONSchema;
      const sameId = {
        $id: 'https://example.test/shared-a',
        type: 'number',
      } as unknown as JSONSchema;
      expect(await first.compile(rootA)('x')).toBeNull();
      expect(await second.compile(rootB)('x')).toBeNull();
      expect(await second.compile(sameId)(1)).toBeNull();
      expect(await plugin.compile(rootA)(1)).toHaveLength(1);
      expect(first.compileGuard(sameId, '')(2)).toBe(true);
      first.release!(rootA);
      second.release!(rootB);
      second.release!(sameId);
      plugin.release(rootA);
    });

    it('releases a root from its own registry without touching the plugin registration', () => {
      const own = instance();
      const remove = vi.spyOn(own, 'removeSchema');
      const validator = create(own);
      const bound = instance();
      plugin.bind(bound);
      const root = {
        $id: 'https://example.test/create-validator-release',
        if: { const: 'first' },
      } as unknown as JSONSchema;
      expect(validator.compileGuard(root, '/if')('first')).toBe(true);
      expect(plugin.compileGuard(root, '/if')('first')).toBe(true);
      validator.release!(root);
      expect(remove).toHaveBeenCalledWith(
        expect.stringContaining('/ajv8/root/'),
      );
      expect(own.getSchema(root.$id!)).toBeUndefined();
      expect(bound.getSchema(root.$id!)).toBeDefined();
      const reused = {
        $id: 'https://example.test/create-validator-release',
        if: { const: 'second' },
      } as unknown as JSONSchema;
      expect(validator.compileGuard(reused, '/if')('second')).toBe(true);
      validator.release!(reused);
      plugin.release(root);
    });
  },
);
