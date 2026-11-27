import { createRef } from 'react';

import { plugin } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, render } from '@testing-library/react';
import Ajv from 'ajv';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  type ValidatorPlugin,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it.each([ValidationMode.OnChange, ValidationMode.None, ValidationMode.OnRequest])(
  'G same-id replacement recovers after whole compilation, retaining the pre-demand limitation in mode %s',
  async (mode) => {
    const clock = createValidationFrameClock();
    const options = { strict: false, allErrors: true, validateFormats: false };
    const shipped = plugin.validator;
    const registration = new Ajv(options);
    const registered = new Map<string, JSONSchema>();
    const register = (copy: JSONSchema) => {
      if (typeof copy.$id !== 'string') throw new Error('Expected a root id');
      if (registered.get(copy.$id) === copy) return;
      registration.addSchema(copy);
      registered.set(copy.$id, copy);
    };
    const validator: ValidatorPlugin = {
      compile(copy) { register(copy); return shipped.compile(copy); },
      compileGuard(copy, pointer) { register(copy); if (!shipped.compileGuard) throw new Error('Missing guard compiler');
        return shipped.compileGuard(copy, pointer); },
      release(copy) {
        if (typeof copy.$id === 'string' && registered.get(copy.$id) === copy) {
          registration.removeSchema(copy.$id);
          registered.delete(copy.$id);
        }
        shipped.release?.(copy);
      },
    };
    const schema: JSONSchema = {
      $id: 'urn:guard-compile:recovery',
      title: 'root-A',
      type: 'object',
      properties: { toggle: { type: 'boolean' }, text: { type: 'string', maxLength: 1 } },
      if: { properties: { toggle: { const: true } }, required: ['toggle'] },
      then: { properties: { shown: { type: 'string', default: 'yes' } } },
      else: { properties: { hidden: { type: 'number', default: 1 } } },
    };
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const form = (jsonSchema: JSONSchema) => <Form ref={ref} jsonSchema={jsonSchema} defaultValue={{ toggle: true, text: 'bad' }} validationMode={mode} validatorFactory={validator} onError={onError} />;
    const flush = async () => {
      for (let frame = 0; frame < 6; frame++) await act(async () => {
        clock.frame(200);
        await vi.runOnlyPendingTimersAsync();
        await clock.task();
      });
    };
    const view = render(form(schema));
    await flush();
    expect(ref.current?.getValue()).toHaveProperty('shown', 'yes');
    act(() => view.rerender(form({ ...schema, title: 'root-B' })));
    act(() => ref.current?.reset());
    if (mode !== ValidationMode.OnRequest) await flush();

    if (mode === ValidationMode.OnChange) {
      expect(() => act(() => ref.current?.setValue({ toggle: false, text: 'bad' }))).not.toThrow();
      await flush();
      expect(ref.current?.getValue()).toEqual({ toggle: false, text: 'bad', hidden: 1 });
      expect(ref.current?.node?.find('/hidden')?.isActive).toBe(true);
    } else {
      expect(() => act(() => ref.current?.setValue({ toggle: false, text: 'bad' }))).toThrow(expect.objectContaining({ code: FormErrorCode.GuardFailed }));
      expect(ref.current?.getValue()).not.toHaveProperty('hidden');
    }
    expect(onError).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ code: FormErrorCode.GuardFailed, origin: 'load' }));
  },
);
