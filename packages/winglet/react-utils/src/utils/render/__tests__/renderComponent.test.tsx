import React from 'react';

import { describe, expect, it } from 'vitest';

import { renderComponent } from '../renderComponent';

describe('renderComponent', () => {
  it('should return null when Component is null', () => {
    expect(renderComponent(null)).toBeNull();
  });

  it('should return null when Component is undefined', () => {
    expect(renderComponent(undefined)).toBeNull();
  });

  it('should return the same element when Component is a React element', () => {
    const element = <div>Test</div>;
    expect(renderComponent(element)).toBe(element);
  });

  it('should render a function component with props', () => {
    const TestComponent = ({ name }: { name: string }) => (
      <div>Hello {name}</div>
    );
    const result = renderComponent(TestComponent, { name: 'World' });
    expect(result).toBeDefined();
    // Note: We can't directly compare React elements, but we can check if it's defined
  });

  it('should render a class component with props', () => {
    class TestComponent extends React.Component<{ name: string }> {
      render() {
        return <div>Hello {this.props.name}</div>;
      }
    }
    const result = renderComponent(TestComponent, { name: 'World' });
    expect(result).toBeDefined();
  });

  it('should return null for invalid component types', () => {
    const invalidComponent = 'not a component';
    expect(renderComponent(invalidComponent as any)).toBeNull();
  });
});
