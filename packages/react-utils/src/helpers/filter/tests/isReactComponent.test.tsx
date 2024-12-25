import { Component, memo } from 'react';

import { describe, expect, it } from 'vitest';

import { isReactComponent } from '../isReactComponent';

describe('isReactComponent', () => {
  it('should return true if the input is a react component', () => {
    expect(isReactComponent(class extends Component {})).toBe(true);
    expect(isReactComponent(() => <div />)).toBe(true);
    expect(isReactComponent(memo(() => <div />))).toBe(true);
    expect(isReactComponent(memo(class extends Component {}))).toBe(true);
  });
  it('should return false if the input is not a react component', () => {
    expect(isReactComponent(1)).toBe(false);
    expect(isReactComponent({})).toBe(false);
    expect(isReactComponent([])).toBe(false);
    expect(isReactComponent(undefined)).toBe(false);
    expect(isReactComponent(null)).toBe(false);
  });
});
