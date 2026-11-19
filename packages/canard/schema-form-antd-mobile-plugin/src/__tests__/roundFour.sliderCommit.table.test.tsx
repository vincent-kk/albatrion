import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

const mobile = true;
const rootSelector = '.ant-slider';
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
});
it.each([
  { kind: 'keyboard', lazy: undefined, unset: true },
  { kind: 'keyboard', lazy: undefined, unset: false },
  { kind: 'keyboard', lazy: false, unset: true },
  { kind: 'keyboard', lazy: false, unset: false },
  { kind: 'pointer', lazy: undefined, unset: true },
  { kind: 'pointer', lazy: undefined, unset: false },
  { kind: 'pointer', lazy: false, unset: true },
  { kind: 'pointer', lazy: false, unset: false },
])(
  'agrees on $kind commit when lazy=$lazy and unset=$unset',
  ({ kind, lazy, unset }) => {
    for (const key of kind === 'keyboard' ? ['Home', 'ArrowRight'] : ['drag']) {
      const ref = createRef<FormHandle>();
      const view = render(
        <Form
          ref={ref}
          jsonSchema={{
            type: 'object',
            properties: {
              level: {
                type: 'number',
                format: 'slider',
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
          defaultValue={unset ? {} : { level: 15 }}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          FieldRenderer={plugin.FieldRenderer}
          LabelRenderer={plugin.LabelRenderer}
        />,
      );
      const thumb = screen.getByRole('slider');
      const before = unset ? {} : { level: 15 };
      expect(ref.current!.getValue()).toEqual(before);
      const selected = key === 'Home' ? 10 : 20;
      if (kind === 'keyboard') {
        fireEvent.keyDown(thumb, { key, keyCode: key === 'Home' ? 36 : 39 });
        const value = key === 'ArrowRight' && unset ? 15 : selected;
        expect(ref.current!.getValue()).toEqual(
          lazy === false ? { level: value } : before,
        );
        fireEvent.keyUp(thumb, { key, keyCode: key === 'Home' ? 36 : 39 });
        expect(ref.current!.getValue()).toEqual({ level: value });
      } else {
        const start = unset ? 0 : 50;
        if (mobile) {
          const touch = (x: number) => ({
            identifier: 1,
            target: thumb,
            clientX: x,
            clientY: 0,
            pageX: x,
            pageY: 0,
          });
          fireEvent.touchStart(thumb, {
            touches: [touch(start)],
            changedTouches: [touch(start)],
            targetTouches: [touch(start)],
          });
          fireEvent.touchMove(thumb, {
            touches: [touch(100)],
            changedTouches: [touch(100)],
            targetTouches: [touch(100)],
          });
          expect(ref.current!.getValue()).toEqual(
            lazy === false ? { level: 20 } : before,
          );
          fireEvent.touchEnd(thumb, {
            touches: [],
            changedTouches: [touch(100)],
            targetTouches: [],
          });
        } else {
          const track = thumb.closest(rootSelector);
          if (!track) throw Error('Missing slider root');
          fireEvent.mouseDown(track, {
            button: 0,
            buttons: 1,
            clientX: start,
            clientY: 0,
          });
          fireEvent.mouseMove(document, {
            buttons: 1,
            clientX: 100,
            clientY: 0,
          });
          expect(ref.current!.getValue()).toEqual(
            lazy === false ? { level: 20 } : before,
          );
          fireEvent.mouseUp(document, { button: 0, clientX: 100, clientY: 0 });
        }
        expect(ref.current!.getValue()).toEqual({ level: 20 });
      }
      view.unmount();
    }
  },
);
it.each([undefined, false])(
  'stores a first pointer selection of minimum when lazy=%s',
  (lazy) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            level: {
              type: 'number',
              format: 'slider',
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
        fieldInputDefinitions={plugin.fieldInputDefinitions}
      />,
    );
    const thumb = screen.getByRole('slider');
    if (mobile) {
      const track = view.container.querySelector('.adm-slider-track');
      if (!track) throw Error('Missing track');
      fireEvent.click(track, { clientX: 0, clientY: 0 });
    } else {
      const track = thumb.closest(rootSelector);
      if (!track) throw Error('Missing track');
      fireEvent.mouseDown(track, { button: 0, buttons: 1, clientX: 0 });
      fireEvent.mouseUp(document, { button: 0, clientX: 0 });
    }
    expect(ref.current!.getValue()).toEqual({ level: 10 });
  },
);
