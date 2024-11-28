import { Component, memo } from 'react';

import { describe, expect, it } from 'vitest';

import {
  isClassComponent,
  isFunctionComponent,
  isMemoComponent,
  isReactComponent,
  isReactElement,
} from '../react';

describe('isReactElement', () => {
  it('should return true if the input is a react element', () => {
    expect(isReactElement(<div />)).toBe(true);
  });
  it('should return false if the input is not a react element', () => {
    expect(isReactElement({})).toBe(false);
    expect(isReactElement([])).toBe(false);
    expect(isReactElement('null')).toBe(false);
    expect(isReactElement(null)).toBe(false);
    expect(isReactElement(1)).toBe(false);
    expect(isReactElement(undefined)).toBe(false);
  });
});

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

describe('isClassComponent', () => {
  it('should return true if the input is a class component', () => {
    expect(isClassComponent(class extends Component {})).toBe(true);
  });
  it('should return false if the input is not a class component', () => {
    expect(isClassComponent(() => <div />)).toBe(false);
    expect(isClassComponent(memo(() => <div />))).toBe(false);
  });
});

describe('isFunctionComponent', () => {
  it('should return true if the input is a function component', () => {
    expect(isFunctionComponent(() => <div />)).toBe(true);
  });
  it('should return false if the input is not a function component', () => {
    expect(isFunctionComponent(class extends Component {})).toBe(false);
    expect(isFunctionComponent(memo(() => <div />))).toBe(false);
  });
});

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
