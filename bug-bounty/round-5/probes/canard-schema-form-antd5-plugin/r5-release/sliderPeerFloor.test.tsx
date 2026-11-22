import { createRef, type ComponentProps } from 'react';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../../index';

/**
 * r5-release, angle CA3 (peer ranges against the APIs used).
 *
 * The plugin's peer and dependency range is `antd ^5.10.0`. With `lazy` omitted, the slider
 * stores only through `onChangeComplete` (src/fieldInputs/FieldInputSlider.tsx:93-99).
 * Evidence gathered from the registry on 2026-11-20 (unpkg file reads):
 * - antd 5.10.0, 5.10.3, 5.11.0 and 5.11.5 declare only `onAfterChange` on Slider
 *   (`es/slider/index.d.ts`); 5.12.0 is the first that declares `onChangeComplete`.
 * - antd 5.10.0 `es/slider/index.js` forwards the remaining props to `rc-slider` (`~10.3.0`;
 *   5.11.x uses `~10.4.0`), and rc-slider 10.3.0, 10.3.1, 10.4.0 and 10.4.1 accept only
 *   `onAfterChange` (10.4.1 uses the name `onChangeComplete` only for an internal Handles prop);
 *   the public `onChangeComplete` first appears in rc-slider 10.5.0.
 * The `antd` mock below reproduces that prop surface on the installed antd 5.27: a Slider prop
 * the host version does not know is never called. Everything else is the installed antd.
 */
const emulateAntd510 = { on: false };
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  const RealSlider = actual.Slider;
  const Slider = (props: ComponentProps<typeof RealSlider>) => {
    if (!emulateAntd510.on) return <RealSlider {...props} />;
    const { onChangeComplete: _unknownBefore512, ...known } = props as Record<string, unknown>;
    return <RealSlider {...(known as ComponentProps<typeof RealSlider>)} />;
  };
  return { ...actual, Slider };
});

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    right: 100,
    bottom: 10,
    width: 100,
    height: 10,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  emulateAntd510.on = false;
});

const renderSlider = (lazy?: boolean) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          level: {
            type: 'number',
            minimum: 10,
            maximum: 20,
            multipleOf: 5,
            presentation: {
              inputType: 'slider',
              FieldInputProps: lazy === undefined ? {} : { lazy },
            },
          },
        },
      }}
      defaultValue={{ level: 15 }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
    />,
  );
  return ref;
};

const dragToMaximum = () => {
  const thumb = screen.getByRole('slider');
  const track = thumb.closest('.ant-slider');
  if (!track) throw Error('Missing slider root');
  fireEvent.mouseDown(track, { button: 0, buttons: 1, clientX: 50, clientY: 0 });
  fireEvent.mouseMove(document, { buttons: 1, clientX: 100, clientY: 0 });
  fireEvent.mouseUp(document, { button: 0, clientX: 100, clientY: 0 });
};

const pressArrowRight = () => {
  const thumb = screen.getByRole('slider');
  fireEvent.keyDown(thumb, { key: 'ArrowRight', keyCode: 39 });
  fireEvent.keyUp(thumb, { key: 'ArrowRight', keyCode: 39 });
};

describe('r5-release antd5 slider on the peer floor antd 5.10.0 to 5.11.x', () => {
  it('a pointer drag with lazy omitted stores the value (antd 5.10/5.11 Slider surface)', () => {
    emulateAntd510.on = true;
    const ref = renderSlider();
    dragToMaximum();
    expect(ref.current!.getValue()).toEqual({ level: 20 });
  });

  it('an arrow key with lazy omitted stores the value (antd 5.10/5.11 Slider surface)', () => {
    emulateAntd510.on = true;
    const ref = renderSlider();
    pressArrowRight();
    expect(ref.current!.getValue()).toEqual({ level: 20 });
  });

  it('the declared antd floor provides the commit event the default slider relies on', () => {
    const packageDir = resolve(__dirname, '../../..');
    const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
    const semver = createRequire(__filename)('semver') as {
      minVersion: (range: string) => { version: string };
      gte: (a: string, b: string) => boolean;
    };
    const floor = semver.minVersion(manifest.peerDependencies.antd).version;
    // 5.12.0: the first antd release whose Slider declares and calls onChangeComplete.
    expect({ floor, hasCommitEvent: semver.gte(floor, '5.12.0') }).toEqual({
      floor,
      hasCommitEvent: true,
    });
  });

  it('control: the same drag and key store the value on the installed antd 5.27', () => {
    const ref = renderSlider();
    dragToMaximum();
    expect(ref.current!.getValue()).toEqual({ level: 20 });
    cleanup();
    const keyboard = renderSlider();
    pressArrowRight();
    expect(keyboard.current!.getValue()).toEqual({ level: 20 });
  });

  it('control: lazy false stores through onChange on the antd 5.10/5.11 surface', () => {
    emulateAntd510.on = true;
    const ref = renderSlider(false);
    dragToMaximum();
    expect(ref.current!.getValue()).toEqual({ level: 20 });
  });
});
