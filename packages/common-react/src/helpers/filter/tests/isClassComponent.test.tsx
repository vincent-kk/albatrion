import { Component, memo } from 'react';

import { describe, expect, it } from 'vitest';

import { isClassComponent } from '../isClassComponent';

describe('isClassComponent', () => {
  it('should return true if the input is a class component', () => {
    expect(isClassComponent(class extends Component {})).toBe(true);
  });
  it('should return false if the input is not a class component', () => {
    expect(isClassComponent(() => <div />)).toBe(false);
    expect(isClassComponent(memo(() => <div />))).toBe(false);
  });
});
