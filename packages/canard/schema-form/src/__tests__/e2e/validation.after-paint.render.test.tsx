import { StrictMode, createRef, useEffect, useLayoutEffect } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  FormErrorCode,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

import { advanceValidationFrame } from '../helpers/advanceValidationFrame';
import { isValidationPending } from '../helpers/isValidationPending';
import { observeErrorSink } from '../helpers/observeErrorSink';
import { settleValidation } from '../helpers/settleValidation';

/** Guard-free schema keeps compilation observable at the validation boundary. */
const schema = { type: 'string' } as const;

afterEach(() => cleanup());

describe('frame-backed Form validation', () => {
  it('IR-6 (h mount) replacing a root before its slot validates only the replacement', async () => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const validate = vi.fn(() => []);
    const validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="retired"
        validationMode={ValidationMode.OnChange}
        validatorFactory={validator}
        onError={onError}
      />,
    );
    const retired = ref.current!.node;
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string', minLength: 1 }}
        defaultValue="replacement"
        validationMode={ValidationMode.OnChange}
        validatorFactory={validator}
        onError={onError}
      />,
    );
    act(() => ref.current!.reset());
    expect(ref.current!.node).not.toBe(retired);
    await settleValidation(() => ref.current?.node);
    expect(validate).toHaveBeenCalledExactlyOnceWith('replacement');
    expect(onError).not.toHaveBeenCalled();
  });

  it('IR-6 a same-schema reset before the slot retains its owed newest verdict', async () => {
    const ref = createRef<FormHandle>();
    const validate = vi.fn(() => []);
    const validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="old"
        validationMode={ValidationMode.OnChange}
        validatorFactory={validator}
      />,
    );
    const retained = ref.current!.node;
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="newest"
        validationMode={ValidationMode.OnChange}
        validatorFactory={validator}
      />,
    );
    act(() => ref.current!.reset());
    expect(ref.current!.node).toBe(retained);
    await settleValidation(() => ref.current?.node);
    expect(validate).toHaveBeenCalledExactlyOnceWith('newest');
  });

  it('IR-6 (c) compiles and validates only after the first frame', async () => {
    const ref = createRef<FormHandle>();
    const validate = vi.fn(() => []);
    const compile = vi.fn(() => validate);
    const onValidate = vi.fn();
    render(
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={ValidationMode.OnChange}
        validatorFactory={{ compile, compileGuard: () => () => true }}
        onValidate={onValidate}
      />,
    );
    await Promise.resolve();
    expect(compile).not.toHaveBeenCalled();
    expect(onValidate).not.toHaveBeenCalled();
    await settleValidation(() => ref.current?.node);
    expect(compile).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(onValidate).toHaveBeenCalledExactlyOnceWith([]);
  });

  it('IR-6 (c) reports a mount compile failure once as rejected and validate still rejects', async () => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    render(
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={ValidationMode.OnChange}
        validatorFactory={{
          compile: () => {
            throw new Error('compile');
          },
          compileGuard: () => () => true,
        }}
        onError={onError}
      />,
    );
    await Promise.resolve();
    expect(onError).not.toHaveBeenCalled();
    await settleValidation(() => ref.current?.node);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
      surface: 'rejected',
    });
    await expect(ref.current!.validate()).rejects.toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('IR-6 (c-i) does not recapture a compile failure after a child passive validate', async () => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    let childEffectRan = false;
    const compileAfterChild: boolean[] = [];
    const Input = ({ node }: FieldInputProps) => {
      useEffect(() => {
        childEffectRan = true;
        void node.validate().catch(() => undefined);
      }, [node]);
      return <input />;
    };
    render(
      <Form
        ref={ref}
        jsonSchema={schema}
        fieldInputMap={{ '': Input }}
        validationMode={ValidationMode.OnChange}
        validatorFactory={{
          compile: () => {
            compileAfterChild.push(childEffectRan);
            throw new Error('compile');
          },
          compileGuard: () => () => true,
        }}
        onError={onError}
      />,
    );
    await settleValidation(() => ref.current?.node);
    expect(compileAfterChild).toEqual([true]);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].surface).toBe('rejected');
  });

  it('IR-6 (c-ii) keeps the first child layout-write failure on the sink surface', async () => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const sink = observeErrorSink();
    const Input = ({ onChange }: FieldInputProps) => {
      useLayoutEffect(() => {
        onChange('child-write');
      }, [onChange]);
      return <input />;
    };
    try {
      render(
        <Form
          ref={ref}
          jsonSchema={schema}
          fieldInputMap={{ '': Input }}
          validationMode={ValidationMode.OnChange}
          validatorFactory={{
            compile: () => {
              throw new Error('compile');
            },
            compileGuard: () => () => true,
          }}
          onError={onError}
        />,
      );
      await settleValidation(() => ref.current?.node);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toMatchObject({
        code: FormErrorCode.ValidatorCompileFailed,
        surface: 'sink',
      });
      expect(sink.errors()).toContain(onError.mock.calls[0][0].error);
    } finally {
      sink.cleanup();
    }
  });

  it('IR-6 R2 a child layout write validates the newest commit exactly once', async () => {
    const ref = createRef<FormHandle>();
    const validate = vi.fn(() => []);
    const Input = ({ onChange }: FieldInputProps) => {
      useLayoutEffect(() => {
        onChange('layout-newest');
      }, [onChange]);
      return <input />;
    };
    render(
      <Form
        ref={ref}
        jsonSchema={schema}
        fieldInputMap={{ '': Input }}
        validationMode={ValidationMode.OnChange}
        validatorFactory={{
          compile: () => validate,
          compileGuard: () => () => true,
        }}
      />,
    );
    await settleValidation(() => ref.current?.node);
    expect(validate).toHaveBeenCalledExactlyOnceWith('layout-newest');
  });

  it('IR-6 R2 an explicit root validation before the slot fulfills the mount obligation', async () => {
    const ref = createRef<FormHandle>();
    const validate = vi.fn(() => []);
    render(
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={ValidationMode.OnChange}
        validatorFactory={{
          compile: () => validate,
          compileGuard: () => () => true,
        }}
      />,
    );
    await act(async () => {
      await ref.current!.validate();
    });
    expect(validate).toHaveBeenCalledTimes(1);
    await settleValidation(() => ref.current?.node);
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('IR-6 R2 a subtree validation before the slot still owes one mount validation', async () => {
    const ref = createRef<FormHandle>();
    const validate = vi.fn(() => []);
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: { name: { type: 'string' } },
        }}
        validationMode={ValidationMode.OnChange}
        validatorFactory={{
          compile: () => validate,
          compileGuard: () => () => true,
        }}
      />,
    );
    await act(async () => {
      await ref.current!.node!.find('/name')!.validate();
    });
    expect(validate).toHaveBeenCalledTimes(1);
    await settleValidation(() => ref.current?.node);
    expect(validate).toHaveBeenCalledTimes(2);
  });

  it('IR-6 (d) StrictMode validates once after the frame', async () => {
    const ref = createRef<FormHandle>();
    const validate = vi.fn(() => []);
    render(
      <StrictMode>
        <Form
          ref={ref}
          jsonSchema={schema}
          validationMode={ValidationMode.OnChange}
          validatorFactory={{
            compile: () => validate,
            compileGuard: () => () => true,
          }}
        />
      </StrictMode>,
    );
    expect(validate).not.toHaveBeenCalled();
    await settleValidation(() => ref.current?.node);
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('IR-7 T3 unmount before the slot still validates once without an error record', async () => {
    const validate = vi.fn(() => []);
    const onError = vi.fn();
    const view = render(
      <Form
        jsonSchema={schema}
        validationMode={ValidationMode.OnChange}
        validatorFactory={{
          compile: () => validate,
          compileGuard: () => () => true,
        }}
        onError={onError}
      />,
    );
    view.unmount();
    await advanceValidationFrame();
    expect(validate).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('IR-6 (a,b) writes in one frame deliver the newest commit once', async () => {
    const ref = createRef<FormHandle>();
    const onValidate = vi.fn();
    const validate = vi.fn((value) => [
      { dataPath: '', message: String(value) },
    ]);
    render(
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={ValidationMode.OnChange}
        validatorFactory={{
          compile: () => validate,
          compileGuard: () => () => true,
        }}
        onValidate={onValidate}
      />,
    );
    await settleValidation(() => ref.current?.node);
    validate.mockClear();
    onValidate.mockClear();
    await act(async () => {
      ref.current!.setValue('first');
      await Promise.resolve();
      ref.current!.setValue('newest');
      await Promise.resolve();
      expect(onValidate).not.toHaveBeenCalled();
      expect(validate).not.toHaveBeenCalled();
    });
    await settleValidation(() => ref.current?.node);
    expect(validate).toHaveBeenCalledExactlyOnceWith('newest');
    expect(onValidate).toHaveBeenCalledExactlyOnceWith([
      { dataPath: '', message: 'newest' },
    ]);
  });
});

it('IR-6 settle waits through writes started by delivered validation callbacks', async () => {
  const ref = createRef<FormHandle>();
  let remaining = 3;
  const validate = vi.fn((value) => [{ dataPath: '', message: String(value) }]);
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validatorFactory={{
        compile: () => validate,
        compileGuard: () => () => true,
      }}
      onValidate={() => {
        if (remaining > 0) ref.current!.setValue('value' + remaining--);
      }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  expect(remaining).toBe(0);
  expect(ref.current!.getValue()).toBe('value1');
  expect(validate).toHaveBeenCalledTimes(4);
});

it('T10 write then same-schema reset drops the earlier request and validates the default once', async () => {
  const ref = createRef<FormHandle>();
  const validate = vi.fn(() => []);
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="default"
      validatorFactory={{
        compile: () => validate,
        compileGuard: () => () => true,
      }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  validate.mockClear();
  act(() => {
    ref.current!.setValue('typed');
    ref.current!.reset();
  });
  await settleValidation(() => ref.current?.node);
  expect(validate).toHaveBeenCalledExactlyOnceWith('default');
});

it('T11 a deferred reset without a validator releases the earlier pending hold', async () => {
  const ref = createRef<FormHandle>();
  observeErrorSink();
  render(
    <Form ref={ref} jsonSchema={{ type: 'string' }} defaultValue="default" />,
  );
  await settleValidation(() => ref.current?.node);
  act(() => {
    ref.current!.setValue('typed');
    ref.current!.reset();
  });
  await settleValidation(() => ref.current?.node);
  expect(isValidationPending(ref.current!.node!)).toBe(false);
});
