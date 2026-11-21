import { type ComponentProps, createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  type FieldInputDefinition,
  Form,
  type FormHandle,
} from '@canard/schema-form';

const emulateAntd510 = vi.hoisted(() => ({ on: false }));
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  const RealSlider = actual.Slider;
  const Slider = (props: ComponentProps<typeof RealSlider>) => {
    if (!emulateAntd510.on) return <RealSlider {...props} />;
    const { onChangeComplete: _unknownBefore512, ...known } = props;
    return <RealSlider {...known} />;
  };
  return {
    ...actual,
    Slider,
    get version() {
      return emulateAntd510.on ? '5.10.0' : actual.version;
    },
  };
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

let modernDefinition: FieldInputDefinition;
let legacyDefinition: FieldInputDefinition;

beforeAll(async () => {
  modernDefinition = (await import('../fieldInputs/FieldInputSlider'))
    .FieldInputSliderDefinition;
  vi.resetModules();
  emulateAntd510.on = true;
  legacyDefinition = (await import('../fieldInputs/FieldInputSlider'))
    .FieldInputSliderDefinition;
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
      fieldInputDefinitions={[
        emulateAntd510.on ? legacyDefinition : modernDefinition,
      ]}
    />,
  );
  return ref;
};

const dragToMaximum = () => {
  const thumb = screen.getByRole('slider');
  const track = thumb.closest('.ant-slider');
  if (!track) throw Error('Missing slider root');
  fireEvent.mouseDown(track, {
    button: 0,
    buttons: 1,
    clientX: 50,
    clientY: 0,
  });
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
