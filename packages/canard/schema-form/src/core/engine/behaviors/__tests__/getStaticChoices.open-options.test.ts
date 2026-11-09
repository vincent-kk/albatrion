import { expect, it } from 'vitest';

import { getStaticChoices } from '../utils/options/getStaticChoices';

it('ignores option-shaped class instances and arrays for every static choice', () => {
  class Choices {
    omitEmpty = false;
    omitTrailing = true;
    trim = true;
    propertyOrder = ['b', 'a'];
  }
  const defaults = getStaticChoices({ schema: {}, typeConflict: false });
  for (const options of [new Choices(), Object.assign([], new Choices())])
    expect(getStaticChoices({ schema: { options }, typeConflict: false })).toBe(
      defaults,
    );
});

it('preserves validated booleans and string order, copies arrays, and reuses the cache', () => {
  const propertyOrder = ['', '*', 'b', 'a', 'a'];
  const effective = {
    schema: {
      options: {
        omitEmpty: false,
        omitTrailing: true,
        trim: true,
        propertyOrder,
      },
    },
    typeConflict: false,
  };
  const choices = getStaticChoices(effective);
  expect(choices).toEqual({
    omitEmpty: false,
    omitTrailing: true,
    trim: true,
    propertyOrder,
  });
  expect(choices.propertyOrder).not.toBe(propertyOrder);
  expect(Object.isFrozen(choices.propertyOrder)).toBe(true);
  expect(getStaticChoices(effective)).toBe(choices);
  expect(
    getStaticChoices({
      schema: {
        options: { omitEmpty: true, omitTrailing: false, trim: false },
      },
      typeConflict: false,
    }),
  ).toEqual({
    omitEmpty: true,
    omitTrailing: false,
    trim: false,
    propertyOrder: [],
  });
});
