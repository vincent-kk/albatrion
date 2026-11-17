import { afterEach, expect, it } from 'vitest';
import { getTabbableElements } from '../getTabbableElements';

afterEach(() => { document.body.innerHTML = ''; });
it('uses the checked radio as the group boundary', () => {
  const frame = document.createElement('div');
  frame.innerHTML = '<button>first</button><input type="radio" name="g" id="checked" checked><input type="radio" name="g" id="unchecked">';
  document.body.append(frame);
  expect(getTabbableElements(frame).map((element) => element.id)).toEqual(['', 'checked']);
});
it('keeps same-name radio groups with different form owners independent', () => {
  const frame = document.createElement('div');
  frame.innerHTML = '<form><input type="radio" name="g" id="first" checked><input type="radio" name="g"></form><form><input type="radio" name="g" id="second" checked><input type="radio" name="g"></form>';
  document.body.append(frame);
  expect(getTabbableElements(frame).map((element) => element.id)).toEqual(['first', 'second']);
});
it('keeps unnamed radios independent', () => {
  const frame = document.createElement('div');
  frame.innerHTML = '<input type="radio"><input type="radio">';
  document.body.append(frame);
  expect(getTabbableElements(frame)).toHaveLength(2);
});

it.each([false, true])('uses directional entry for an unchecked group (%s)', (reverse) => {
  const frame = document.createElement('div');
  frame.innerHTML = '<input type="radio" name="g" id="first"><input type="radio" name="g" id="last">';
  document.body.append(frame);
  expect(getTabbableElements(frame, reverse).map((element) => element.id)).toEqual([reverse ? 'last' : 'first']);
});
