import { Component, memo } from 'react';

import { describe, expect, it } from 'vitest';

import { isFunctionComponent } from '../isFunctionComponent';

describe('isFunctionComponent', () => {
  it('should return true if the input is a function component', () => {
    expect(isFunctionComponent(() => <div />)).toBe(true);
  });
  it('should return false if the input is not a function component', () => {
    expect(isFunctionComponent(class extends Component {})).toBe(false);
    expect(isFunctionComponent(memo(() => <div />))).toBe(false);
  });
});
