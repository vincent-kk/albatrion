import { Component, memo } from 'react';

import { describe, expect, it } from 'vitest';

import { isMemoComponent } from '../isMemoComponent';

describe('isMemoComponent', () => {
  it('should return true if the input is a memo component', () => {
    expect(isMemoComponent(memo(() => <div />))).toBe(true);
    expect(isMemoComponent(memo(class extends Component {}))).toBe(true);
  });
  it('should return false if the input is not a memo component', () => {
    expect(isMemoComponent(() => <div />)).toBe(false);
    expect(isMemoComponent(class extends Component {})).toBe(false);
    expect(isMemoComponent(1)).toBe(false);
    expect(isMemoComponent({})).toBe(false);
    expect(isMemoComponent([])).toBe(false);
  });
});
