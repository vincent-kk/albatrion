# @winglet/react-utils

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()

---

## Overview

`@winglet/react-utils` is a library that provides utility functions, hooks, and higher-order components (HOCs) commonly used in React application development. This package enhances component reusability and extends React's core functionality to provide a more efficient development experience.

Key features include custom hooks, error boundaries, portal support, and component type checking.

---

## Installation

```bash
# Using npm
npm install @winglet/react-utils

# Using yarn
yarn add @winglet/react-utils
```

---

## Main Features

### Hooks

Various custom hooks that extend React functionality.

#### State Management and References

- [`useConstant`](./src/hooks/useConstant.ts) - Provides constant values that do not change during the component lifecycle.
- [`useMemorize`](./src/hooks/useMemorize.ts) - Similar to useMemo but with a more intuitive usage.
- [`useReference`](./src/hooks/useReference.ts) - Manages reference objects.
- [`useSnapshot`](./src/hooks/useSnapshot.ts) - Creates and manages snapshots of values.
- [`useVersion`](./src/hooks/useVersion.ts) - Manages component version state.

#### Lifecycle Management

- [`useOnMount`](./src/hooks/useOnMount.ts) - Hook called when a component mounts.
- [`useOnUnmount`](./src/hooks/useOnUnmount.ts) - Hook called when a component unmounts.
- [`useEffectUntil`](./src/hooks/useEffectUntil.ts) - Runs useEffect until a condition is met.
- [`useLayoutEffectUntil`](./src/hooks/useLayoutEffectUntil.ts) - Runs useLayoutEffect until a condition is met.

#### Utility Hooks

- [`useWindowSize`](./src/hooks/useWindowSize.ts) - Tracks the browser window size.
- [`useHandle`](./src/hooks/useHandle.ts) - Manages function handlers.
- [`useRestProperties`](./src/hooks/useRestProperties.ts) - Manages the remaining properties of an object excluding specific ones.

### Components

- [`Portal`](./src/components/Portal/index.ts) - A component that provides the functionality to wrap components in a portal context.

### Higher-Order Components (HOCs)

HOCs that functionally extend components.

- [`withErrorBoundary`](./src/hoc/withErrorBoundary/withErrorBoundary.tsx) - Adds an error boundary to components.
- [`withUploader`](./src/hoc/withUploader/index.ts) - Adds file upload functionality to components.

### Utility Functions

Various utility functions for working with React components.

#### Component Type Checking

- [`isReactComponent`](./src/utils/filter/isReactComponent.ts) - Checks if an object is a React component.
- [`isReactElement`](./src/utils/filter/isReactElement.ts) - Checks if an object is a React element.
- [`isClassComponent`](./src/utils/filter/isClassComponent.ts) - Checks if an object is a class component.
- [`isFunctionComponent`](./src/utils/filter/isFunctionComponent.ts) - Checks if an object is a function component.
- [`isMemoComponent`](./src/utils/filter/isMemoComponent.ts) - Checks if an object is a memoized component.

#### Rendering Utilities

- [`renderComponent`](./src/utils/render/renderComponent.tsx) - Appropriately renders various types of components.

---

## Usage Examples

### Using Custom Hooks

#### useConstant

Prevents unnecessary recalculations and maintains a consistent value throughout the component's lifecycle.

```tsx
import { useConstant } from '@winglet/react-utils';

const MyComponent = () => {
  // Create a complex value only once
  const complexValue = useConstant(() => {
    return performExpensiveCalculation();
  });

  // Or pass a value directly
  const fixedValue = useConstant(42);

  return <div>{complexValue}</div>;
};
```

#### useWindowSize

Easily create responsive components that react to browser window size changes.

```tsx
import { useWindowSize } from '@winglet/react-utils';

const ResponsiveComponent = () => {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>
        Current screen size: {width} x {height}
      </p>
      {width < 768 ? <MobileView /> : <DesktopView />}
    </div>
  );
};
```

### Using HOCs

#### withErrorBoundary

Add error boundaries to components to prevent the application from crashing when errors occur.

```tsx
import { withErrorBoundary } from '@winglet/react-utils';

const ErrorFallback = () => <div>An error has occurred.</div>;

const RiskyComponent = () => {
  // Code that might throw an error
  if (Math.random() > 0.5) {
    throw new Error('Random error');
  }
  return <div>Working normally</div>;
};

// Component wrapped with an error boundary
const SafeComponent = withErrorBoundary(RiskyComponent, <ErrorFallback />);

// Usage
const App = () => <SafeComponent />;
```

#### Portal

Render component content at different locations in the DOM tree.
This feature is useful when implementing sticky headers.

```tsx
import { Portal } from '@winglet/react-utils';

const ModalComponent = Portal.with(() => {
  return (
    <div>
      <Portal.Anchor className={styles.header} />
      <Portal>
        <h1>Main Content</h1>
        <div className="description">
          All this content is rendered inside the `Portal.Anchor`.
        </div>
      </Portal>
    </div>
  );
});
```

### Using Utility Functions

#### Component Type Checking

```tsx
import { isReactComponent, isReactElement } from '@winglet/react-utils';

const validateUI = (ui) => {
  if (isReactComponent(ui)) {
    // Component handling logic
    return <ui {...props} />;
  } else if (isReactElement(ui)) {
    // Element handling logic
    return ui;
  } else {
    // Return default UI
    return <DefaultUI />;
  }
};
```

#### renderComponent

Consistently render various forms of React components.

```tsx
import { renderComponent } from '@winglet/react-utils';

// Component type
const Button = (props) => <button {...props}>{props.children}</button>;

// Usage example
const App = () => {
  // Render component type
  const buttonA = renderComponent(Button, {
    onClick: () => alert('A'),
    children: 'Button A',
  });

  // Render already created element
  const buttonB = renderComponent(
    <Button onClick={() => alert('B')}>Button B</Button>,
  );

  // Conditional rendering
  const maybeButton = renderComponent(condition ? Button : null, {
    children: 'Conditional',
  });

  return (
    <div>
      {buttonA}
      {buttonB}
      {maybeButton}
    </div>
  );
};
```

---

## Development Environment Setup

```bash
# Clone repository
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# Install dependencies
nvm use && yarn install && yarn run:all build

# Development build
yarn reactUtils build

# Run tests
yarn reactUtils test
```

---

## License

This project is licensed under the MIT License. See the [`LICENSE`](./LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.
