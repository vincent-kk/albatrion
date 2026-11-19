import { type ComponentProps, createRef, useState } from 'react';

import { cleanup, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

const emulateMobile51 = { on: false };
vi.mock('antd-mobile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd-mobile')>();
  const RealStepper = actual.Stepper;
  const Stepper = (props: ComponentProps<typeof RealStepper>) => {
    if (!emulateMobile51.on) return <RealStepper {...props} />;
    const { allowEmpty: _a, parser: _p, formatter: _f, ...known } = props;
    const value = known.value !== undefined ? known.value : known.defaultValue;
    // antd-mobile 5.1.0 stepper.js:26
    useState(() => {
      if (value === null || value === undefined)
        throw new TypeError('Stepper value has no toString');
      return value.toString();
    });
    return <RealStepper {...props} parser={undefined} formatter={undefined} />;
  };
  return { ...actual, Stepper };
});

afterEach(() => {
  cleanup();
  emulateMobile51.on = false;
});

const renderNumber = (defaultValue: object) => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: { amount: { type: 'number' } },
      }}
      defaultValue={defaultValue}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      onError={() => {}}
    />,
  );
  return { ref, view };
};

const stepperInputs = (container: HTMLElement) =>
  container.querySelectorAll('.adm-stepper input').length;

describe('r5-release antd-mobile number input on the peer floor antd-mobile 5.0.x to 5.1.x', () => {
  it('an empty number field renders its stepper (antd-mobile 5.0/5.1 Stepper behavior)', () => {
    emulateMobile51.on = true;
    const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { view } = renderNumber({});
    silence.mockRestore();
    expect(stepperInputs(view.container)).toBe(1);
  });

  it('the declared antd-mobile floor accepts the null value the plugin passes', () => {
    const packageDir = resolve(__dirname, '../..');
    const manifest = JSON.parse(
      readFileSync(join(packageDir, 'package.json'), 'utf8'),
    );
    const semver = createRequire(__filename)('semver');

    const floor = semver.minVersion(
      manifest.peerDependencies['antd-mobile'],
    ).version;
    // 5.2.0: the first antd-mobile release whose Stepper handles a null value (allowEmpty).
    expect({ floor, acceptsNull: semver.gte(floor, '5.2.0') }).toEqual({
      floor,
      acceptsNull: true,
    });
  });

  it('control: a number field with a value renders on the same emulated Stepper', () => {
    emulateMobile51.on = true;
    const { view, ref } = renderNumber({ amount: 3 });
    expect(stepperInputs(view.container)).toBe(1);
    expect(ref.current!.getValue()).toEqual({ amount: 3 });
  });

  it('control: an empty number field renders on the installed antd-mobile 5.40', () => {
    const { view } = renderNumber({});
    expect(stepperInputs(view.container)).toBe(1);
  });
});
