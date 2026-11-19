import { createRef, useState, type ComponentProps } from 'react';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../../index';

/**
 * r5-release, angle CA3 (peer ranges against the APIs used).
 *
 * The plugin's peer and dependency range is `antd-mobile ^5.0.0`. Its number input renders
 * `<Stepper value={typeof value === 'number' ? value : null} allowEmpty ...>`
 * (src/fieldInputs/FieldInputNumber.tsx:56-66).
 * Evidence gathered from the registry on 2026-11-20 (unpkg file reads):
 * - antd-mobile 5.0.0 and 5.1.0 `es/components/stepper/stepper.d.ts` have no `allowEmpty`;
 *   5.2.0 is the first with it.
 * - antd-mobile 5.1.0 `es/components/stepper/stepper.js:25-26` reads
 *   `const [value, setValue] = usePropsValue(props); useState(() => value.toString())`, and
 *   `es/utils/use-props-value.js` treats every `value !== undefined` (so `null`) as controlled.
 * The `antd-mobile` mock reproduces that 5.0/5.1 behavior in front of the installed 5.40
 * Stepper: the same initializer runs, and props 5.1 does not know are dropped.
 */
const emulateMobile51 = { on: false };
vi.mock('antd-mobile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd-mobile')>();
  const RealStepper = actual.Stepper;
  const Stepper = (props: ComponentProps<typeof RealStepper>) => {
    if (!emulateMobile51.on) return <RealStepper {...props} />;
    const { allowEmpty: _a, parser: _p, formatter: _f, ...known } = props as Record<string, unknown>;
    const value = known.value !== undefined ? known.value : known.defaultValue;
    // antd-mobile 5.1.0 stepper.js:26
    useState(() => (value as number).toString());
    return <RealStepper {...(known as ComponentProps<typeof RealStepper>)} />;
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
      jsonSchema={{ type: 'object', properties: { amount: { type: 'number' } } }}
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
    const packageDir = resolve(__dirname, '../../..');
    const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
    const semver = createRequire(__filename)('semver') as {
      minVersion: (range: string) => { version: string };
      gte: (a: string, b: string) => boolean;
    };
    const floor = semver.minVersion(manifest.peerDependencies['antd-mobile']).version;
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
