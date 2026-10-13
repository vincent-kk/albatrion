import { expect, it } from 'vitest';

import { isRenderableDateInputValue } from '../isRenderableDateInputValue';

it('accepts empty values for each native date input type', () => {
  for (const type of ['date', 'month', 'week', 'time', 'datetime-local'])
    for (const value of ['', undefined, null])
      expect(isRenderableDateInputValue(type, value)).toBe(true);
});

it('checks date grammar, month lengths, positive years, and leap years', () => {
  for (const value of [
    '0001-01-01',
    '0099-12-31',
    '2000-02-29',
    '2024-02-29',
    '2024-04-30',
    '2024-06-30',
    '2024-09-30',
    '2024-11-30',
    '10000-12-31',
  ])
    expect(isRenderableDateInputValue('date', value), value).toBe(true);
  for (const value of [
    '0000-01-01',
    '999-01-01',
    '2024-1-01',
    '2024-01-1',
    '2024-00-01',
    '2024-13-01',
    '2024-01-00',
    '2024-01-32',
    '2024-04-31',
    '2024-06-31',
    '2024-09-31',
    '2024-11-31',
    '1900-02-29',
    '2023-02-29',
    '2024-02-30',
    '2024-01-01\n',
  ])
    expect(isRenderableDateInputValue('date', value), value).toBe(false);
});

it('checks month grammar and range with four or more year digits', () => {
  for (const value of ['0001-01', '2024-12', '10000-06'])
    expect(isRenderableDateInputValue('month', value), value).toBe(true);
  for (const value of [
    '0000-01',
    '999-01',
    '2024-1',
    '2024-00',
    '2024-13',
    '2024-01-01',
  ])
    expect(isRenderableDateInputValue('month', value), value).toBe(false);
});

it('checks ISO week ranges including Thursday and leap-Wednesday week 53 years', () => {
  for (const value of [
    '0001-W01',
    '2015-W53',
    '2020-W53',
    '2024-W52',
    '10000-W52',
  ])
    expect(isRenderableDateInputValue('week', value), value).toBe(true);
  for (const value of [
    '0000-W01',
    '999-W01',
    '2024-W1',
    '2024-w01',
    '2024-W00',
    '2024-W53',
    '2014-W53',
    '2016-W53',
    '2021-W53',
    '2020-W54',
  ])
    expect(isRenderableDateInputValue('week', value), value).toBe(false);
});

it('checks time components and optional second fractions of one to three digits', () => {
  for (const value of [
    '00:00',
    '23:59',
    '12:34:56',
    '12:34:56.1',
    '12:34:56.12',
    '12:34:56.123',
  ])
    expect(isRenderableDateInputValue('time', value), value).toBe(true);
  for (const value of [
    '24:00',
    '23:60',
    '12:34:60',
    '1:00',
    '01:0',
    '12:34.1',
    '12:34:56.',
    '12:34:56.1234',
    '12:34Z',
    '12:34\n',
  ])
    expect(isRenderableDateInputValue('time', value), value).toBe(false);
});

it('checks datetime-local with a T or space and rejects offsets or extra separators', () => {
  for (const value of [
    '2024-02-29T23:59',
    '2024-02-29 23:59:59.123',
    '10000-01-01T00:00',
  ])
    expect(isRenderableDateInputValue('datetime-local', value), value).toBe(
      true,
    );
  for (const value of [
    '2023-02-29T12:00',
    '2024-01-01T24:00',
    '2024-01-01t12:00',
    '2024-01-01T12:00Z',
    '2024-01-01T12:00+01:00',
    '2024-01-01  12:00',
    '2024-01-01T12:00T12:00',
    '2024-01-01T12:00\n',
  ])
    expect(isRenderableDateInputValue('datetime-local', value), value).toBe(
      false,
    );
});

it('rejects non-string values and unsupported nonempty input formats', () => {
  expect(isRenderableDateInputValue('date', 20240101)).toBe(false);
  expect(isRenderableDateInputValue('date-time', '2024-01-01T12:00')).toBe(
    false,
  );
});
