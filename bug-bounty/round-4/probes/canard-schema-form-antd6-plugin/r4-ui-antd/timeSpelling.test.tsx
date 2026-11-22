import { cleanup, render } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = TestResizeObserver;
afterEach(cleanup);

const originalZone = process.env.TZ;
afterAll(() => {
  process.env.TZ = originalZone;
});

const shown = (field: JSONSchema, value: unknown) => {
  const { container, unmount } = render(
    <Form
      jsonSchema={{ type: 'object', properties: { value: field } }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      defaultValue={{ value }}
      onError={() => {}}
    />,
  );
  const text = Array.from(
    container.querySelectorAll<HTMLInputElement>('input'),
    (input) => input.value,
  );
  unmount();
  return text;
};

describe.each(['UTC', 'Asia/Seoul'])('time zone %s', (zone) => {
  beforeAll(() => {
    process.env.TZ = zone;
  });

  it.each([
    ['12:30:00z', '12:30:00Z'],
    ['12:30:00+00:00', '12:30:00Z'],
    ['12:30:00.250Z', '12:30:00Z'],
  ])('time %s shows the same time as %s', (variant, canonical) => {
    const field: JSONSchema = { type: 'string', format: 'time' };
    expect(shown(field, variant)).toEqual(shown(field, canonical));
  });

  it.each([
    ['09:00:00z', '09:00:00Z'],
  ])('time-range start %s shows the same time as %s', (variant, canonical) => {
    const field: JSONSchema = {
      type: 'array',
      format: 'time-range',
      items: { type: 'string' },
    };
    expect(shown(field, [variant, '18:00:00Z'])).toEqual(
      shown(field, [canonical, '18:00:00Z']),
    );
  });
});
