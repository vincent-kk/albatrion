# @winglet/style-utils

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![CSS](https://img.shields.io/badge/css-✔-purple.svg)]()
[![Style](https://img.shields.io/badge/style-✔-green.svg)]()

---

## Overview

`@winglet/style-utils` is a comprehensive CSS and style management utility package for JavaScript/TypeScript projects.

This library provides powerful tools for className manipulation, CSS compression, and universal style management with scoped CSS capabilities. It's designed to be framework-agnostic and can be used in any web environment, including Shadow DOM.

---

## Installation

```bash
# Using npm
npm install @winglet/style-utils

# Using yarn
yarn add @winglet/style-utils
```

---

## Sub-path Imports

This package supports sub-path imports to enable more granular imports and optimize bundle size. You can import specific modules directly without importing the entire package:

```typescript
// Main exports
import { cx, cxLite, compressCss, styleManagerFactory, destroyScope } from '@winglet/style-utils';

// Style management utilities
import { styleManagerFactory, destroyScope } from '@winglet/style-utils/style-manager';

// All utilities (including className utilities and CSS compression)
import { cx, cxLite, compressCss } from '@winglet/style-utils/util';
```

### Available Sub-paths

Based on the package.json exports configuration:

- `@winglet/style-utils` - Main exports (all utilities)
- `@winglet/style-utils/style-manager` - Scoped style management utilities (styleManagerFactory, destroyScope)
- `@winglet/style-utils/util` - Utility functions (cx, cxLite, compressCss)

---

## Compatibility

This package is written using ECMAScript 2020 (ES2020) syntax.

**Supported Environments:**

- Node.js 14.0.0 or higher
- Modern browsers (with ES2020 support)

**For Legacy Environment Support:**
Use transpilers like Babel to convert the code to match your target environment.

---

## Key Features

### ClassNames Management

#### **[`cx`](./src/utils/cx/cx.ts)**

Concatenates CSS class names conditionally, similar to clsx/classnames but more lightweight.

Accepts various input types including strings, numbers, arrays, and objects.

Filters out falsy values and handles nested structures recursively.

#### **[`cxLite`](./src/utils/cx/cxLite.ts)**

Lightweight version of the cx function that concatenates CSS class names.

Only handles simple truthy/falsy filtering without object or array processing.

Provides better performance for basic use cases where complex input types are not needed.

### CSS Compression

#### **[`compressCss`](./src/utils/compressCss/compressCss.ts)**

High-performance CSS compression utility that removes unnecessary whitespace, comments, and redundant semicolons.

Uses a single-pass approach optimized for performance and memory usage.

### Style Management

#### **[`styleManagerFactory`](./src/utils/styleManager/styleManagerFactory.ts)**

Factory function that creates a scoped CSS management system for efficient style injection and cleanup.

Returns a curried function that allows you to add CSS styles to a specific scope with automatic scoping, and provides cleanup functions to remove specific styles.

Supports both regular DOM and Shadow DOM environments with automatic scoping to prevent style conflicts.

All style updates are batched using requestAnimationFrame for optimal performance.

#### **[`destroyScope`](./src/utils/styleManager/destroyScope.ts)**

Utility function that completely destroys a specific style scope and removes all associated styles from the DOM.

This function performs complete cleanup including canceling pending animation frames, removing stylesheets, and clearing all cached styles for the scope.

---

## Usage Examples

### Using ClassNames Utilities

```typescript
import { cx, cxLite } from '@winglet/style-utils';

// Using cx with various input types
const classes = cx('btn', 'btn-primary', { 'btn-active': isActive });
console.log(classes); // → 'btn btn-primary btn-active'

// Using cx with arrays and objects
const classes2 = cx(['btn', 'btn-primary'], { 'btn-disabled': disabled });
console.log(classes2); // → 'btn btn-primary' (if disabled is false)

// Using cxLite for simple cases (better performance)
const classes3 = cxLite('btn', 'btn-primary', isActive && 'btn-active');
console.log(classes3); // → 'btn btn-primary btn-active'

// With conditional classes
const buttonClasses = cx(
  'btn',
  `btn-${variant}`,
  size && `btn-${size}`,
  {
    'btn-disabled': disabled,
    'btn-loading': loading
  }
);

// React component example
const Button = ({ variant = 'primary', size, disabled, loading, children }) => (
  <button
    className={cx(
      'btn',
      `btn-${variant}`,
      size && `btn-${size}`,
      { 'btn-disabled': disabled, 'btn-loading': loading }
    )}
  >
    {children}
  </button>
);
```

### Using CSS Compression

```typescript
import { compressCss } from '@winglet/style-utils';

const originalCSS = `
  .container {
    color: red;
    background: white;
    /* This is a comment */
    padding: 16px;
  }
  
  .button {
    border: none;
    border-radius: 4px;
  }
`;

const compressed = compressCss(originalCSS);
console.log(compressed);
// → '.container{color:red;background:white;padding:16px}.button{border:none;border-radius:4px}'

// File size reduction example
console.log(`Original: ${originalCSS.length} bytes`);
console.log(`Compressed: ${compressed.length} bytes`);
console.log(
  `Reduction: ${((1 - compressed.length / originalCSS.length) * 100).toFixed(1)}%`,
);
```

### Using styleManagerFactory for Scoped CSS

```typescript
import { destroyScope, styleManagerFactory } from '@winglet/style-utils';

// Create a style manager for a specific component scope
const addStyle = styleManagerFactory('my-component');

// Add component-specific styles and get cleanup function
const removeButtonStyles = addStyle(
  'button-styles',
  `
  .btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn:hover {
    background: #0056b3;
  }
  
  .btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`,
);

// The CSS will be automatically scoped as:
// .my-component .btn { ... }
// .my-component .btn:hover { ... }
// .my-component .btn:disabled { ... }

// Apply the scope to your HTML element
const componentElement = document.getElementById('my-component');
componentElement.className += ' my-component';

// Add more styles dynamically
const removeLayoutStyles = addStyle(
  'layout-styles',
  `
  .container {
    display: flex;
    gap: 1rem;
  }
`,
);

// Remove specific styles
removeLayoutStyles();
// or
removeButtonStyles();

// Clean up everything when component unmounts
destroyScope('my-component');
```

### Using styleManagerFactory with Shadow DOM

```typescript
import { destroyScope, styleManagerFactory } from '@winglet/style-utils';

// Create a custom element with Shadow DOM
class MyCustomElement extends HTMLElement {
  private shadowRoot: ShadowRoot;
  private addStyle: (styleId: string, css: string) => () => void;
  private cleanupFunctions: Array<() => void> = [];

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });

    // Create a style manager for this shadow root
    this.addStyle = styleManagerFactory('custom-element', {
      shadowRoot: this.shadowRoot,
    });

    this.setupStyles();
    this.render();
  }

  private setupStyles() {
    const removeHostStyles = this.addStyle(
      'host-styles',
      `
      :host {
        display: block;
        font-family: Arial, sans-serif;
      }
    `,
    );

    const removeComponentStyles = this.addStyle(
      'component-styles',
      `
      .header {
        background: #f5f5f5;
        padding: 1rem;
        border-bottom: 1px solid #ddd;
      }
      
      .content {
        padding: 1rem;
      }
    `,
    );

    // Store cleanup functions for later use
    this.cleanupFunctions.push(removeHostStyles, removeComponentStyles);
  }

  private render() {
    this.shadowRoot.innerHTML = `
      <div class="header">
        <h2>Custom Element</h2>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }

  disconnectedCallback() {
    // Clean up styles when element is removed
    destroyScope('custom-element');
  }
}

customElements.define('my-custom-element', MyCustomElement);
```

### Dynamic Theme Management

```typescript
import { destroyScope, styleManagerFactory } from '@winglet/style-utils';

class ThemeManager {
  private addStyle: (styleId: string, css: string) => () => void;
  private customStyles = new Map<string, () => void>();

  constructor() {
    this.addStyle = styleManagerFactory('theme');
  }

  applyTheme(theme: 'light' | 'dark') {
    const colors =
      theme === 'light'
        ? {
            background: '#ffffff',
            text: '#333333',
            primary: '#007bff',
          }
        : {
            background: '#1a1a1a',
            text: '#ffffff',
            primary: '#0d6efd',
          };

    // Remove previous theme if exists
    this.customStyles.get('theme-colors')?.();

    // Add new theme
    const removeTheme = this.addStyle(
      'theme-colors',
      `
      :root {
        --color-background: ${colors.background};
        --color-text: ${colors.text};
        --color-primary: ${colors.primary};
      }
      
      body {
        background-color: var(--color-background);
        color: var(--color-text);
        transition: background-color 0.3s, color 0.3s;
      }
    `,
    );

    this.customStyles.set('theme-colors', removeTheme);
  }

  addCustomStyles(id: string, css: string) {
    // Remove existing style if present
    this.customStyles.get(id)?.();

    const removeStyle = this.addStyle(id, css);
    this.customStyles.set(id, removeStyle);
  }

  removeCustomStyles(id: string) {
    const removeStyle = this.customStyles.get(id);
    if (removeStyle) {
      removeStyle();
      this.customStyles.delete(id);
    }
  }

  destroy() {
    destroyScope('theme');
    this.customStyles.clear();
  }
}

// Usage
const themeManager = new ThemeManager();
themeManager.applyTheme('dark');

// Add scope class to body element
document.body.className += ' theme';
```

### Performance Optimization Examples

```typescript
import { compressCss, styleManagerFactory } from '@winglet/style-utils';

// Pre-compress CSS for production
const productionCSS = compressCss(`
  .component {
    /* Development comments and formatting */
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`);

// Use compressed CSS to skip compression step
const addOptimizedStyle = styleManagerFactory('optimized-component');
addOptimizedStyle('styles', productionCSS, true); // true = already compressed

// Batch style updates for better performance
const addBatchStyle = styleManagerFactory('batch-component');

// All these updates will be batched into a single DOM update
const cleanupFns = [
  addBatchStyle('style1', '.class1 { color: red; }'),
  addBatchStyle('style2', '.class2 { color: blue; }'),
  addBatchStyle('style3', '.class3 { color: green; }'),
];
// DOM update happens in next animation frame

// Later cleanup if needed
cleanupFns.forEach((cleanup) => cleanup());
```

---

## API Reference

### ClassNames

#### `cx(...args: ClassValue[]): string`

Conditionally concatenates multiple class values into a single space-separated string.

**Parameters:**

- `args`: Variable number of class value arguments (strings, numbers, arrays, objects)

**Returns:** Concatenated class name string

#### `cxLite(...args: ClassValue[]): string`

Lightweight version of the cx function that performs simple truthy/falsy filtering only.

**Parameters:**

- `args`: Variable number of class value arguments (primarily strings and numbers)

**Returns:** Concatenated class name string

### CSS Compression

#### `compressCss(css: string): string`

Compresses CSS by removing unnecessary whitespace and comments.

**Parameters:**

- `css`: CSS string to compress

**Returns:** Compressed CSS string

### Style Management

#### `styleManagerFactory(scopeId: string, config?: StyleManagerConfig): (styleId: string, css: string, compressed?: boolean) => () => void`

Creates a style manager factory for a specific scope that can add scoped CSS styles.

The returned function automatically scopes CSS selectors with the provided scopeId (e.g., `.scopeId .selector`) and provides efficient style injection with batched DOM updates using requestAnimationFrame.

**Parameters:**

- `scopeId`: Unique identifier for the style scope
- `config`: Optional configuration object
  - `shadowRoot`: ShadowRoot instance for Shadow DOM support (optional)

**Returns:** A function that accepts `(styleId, cssString, compressed?)` and returns a cleanup function

**Example:**

```typescript
// Create a style manager for a component
const addStyle = styleManagerFactory('my-component');

// Add styles and get cleanup function
const removeButtonStyle = addStyle(
  'button-style',
  `
  .btn {
    background: blue;
    color: white;
  }
`,
);

// Later, remove the specific style
removeButtonStyle();

// For Shadow DOM
const addShadowStyle = styleManagerFactory('shadow-scope', {
  shadowRoot: myElement.shadowRoot,
});
```

#### `destroyScope(scopeId: string): void`

Destroys a specific style scope and removes all associated styles from the DOM.

This function performs complete cleanup including:

- Canceling any pending animation frames
- Removing the scope's stylesheet from `document.adoptedStyleSheets` (modern browsers)
- Removing the scope's style element from the DOM (fallback browsers)
- Clearing all cached styles for the scope
- Removing the scope instance from the internal registry

**Parameters:**

- `scopeId`: The unique identifier of the scope to destroy

**Example:**

```typescript
// Create and use styles
const addStyle = styleManagerFactory('temp-scope');
addStyle('style1', '.class { color: red; }');

// Later, destroy the entire scope
destroyScope('temp-scope'); // Removes all styles for this scope
```

#### `StyleManagerConfig`

Configuration interface for styleManagerFactory.

**Properties:**

- `shadowRoot?: ShadowRoot` - Optional ShadowRoot for Shadow DOM style injection

---

## Development Setup

```bash
# Clone repository
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# Install dependencies
nvm use && yarn install && yarn run:all build

# Development build
yarn styleUtils build

# Run tests
yarn styleUtils test
```

---

## License

This project is licensed under the MIT License. See the [`LICENSE`](./LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.
