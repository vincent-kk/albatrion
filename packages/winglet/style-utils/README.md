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
import { classNames, cx, compressCss, StyleManager } from '@winglet/style-utils';

// ClassNames utilities
import { classNames, cx } from '@winglet/style-utils/classNames';

// CSS compression utility
import { compressCss } from '@winglet/style-utils/compressCss';

// Style management utilities
import { destroyScope, styleManagerFactory } from '@winglet/style-utils/styleManager';
```

### Available Sub-paths

Based on the package.json exports configuration:

- `@winglet/style-utils` - Main exports (all utilities)
- `@winglet/style-utils/classNames` - Class name manipulation utilities (classNames, cx)
- `@winglet/style-utils/compressCss` - CSS compression utility
- `@winglet/style-utils/styleManager` - Scoped style management utilities

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

#### **[`classNames`](./src/utils/classNames/classNames.ts)**

Main class names utility function with explicit interface. Combines multiple class values into a single space-separated string with configurable options for duplicate removal, whitespace normalization, and empty value filtering.

#### **[`cx`](./src/utils/classNames/cx.ts)**

Convenient class names utility with variadic arguments. A lightweight wrapper around classNames that accepts variadic arguments for maximum convenience.

### CSS Compression

#### **[`compressCss`](./src/utils/compressCss/compressCss.ts)**

High-performance CSS compression utility that removes unnecessary whitespace, comments, and redundant semicolons. Uses a single-pass approach optimized for performance and memory usage.

### Style Management

#### **[`StyleManager`](./src/utils/styleManager/StyleManager/StyleManager.ts)**

A scoped CSS management system that provides efficient style injection and cleanup. Supports both regular DOM and Shadow DOM environments with automatic scoping to prevent style conflicts.

#### **[`destroyScope`](./src/utils/styleManager/destroyScope.ts)**

Utility function to destroy a specific StyleManager scope and clean up all associated styles.

#### **[`styleManagerFactory`](./src/utils/styleManager/styleManagerFactory.ts)**

Factory function to create and manage StyleManager instances with consistent configuration.

---

## Usage Examples

### Using ClassNames Utilities

```typescript
import { classNames, cx } from '@winglet/style-utils';

// Using classNames with array syntax
const classes = classNames(['btn', 'btn-primary', { 'btn-active': isActive }]);
console.log(classes); // → 'btn btn-primary btn-active'

// Using cx with variadic arguments (more convenient)
const classes2 = cx('btn', 'btn-primary', isActive && 'btn-active');
console.log(classes2); // → 'btn btn-primary btn-active'

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

### Using StyleManager for Scoped CSS

```typescript
import { StyleManager } from '@winglet/style-utils';

// Get a scoped style manager
const manager = StyleManager.get('my-component');

// Add component-specific styles
manager.add(
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
// [data-scope="my-component"] .btn { ... }
// [data-scope="my-component"] .btn:hover { ... }
// [data-scope="my-component"] .btn:disabled { ... }

// Apply the scope to your HTML element
const componentElement = document.getElementById('my-component');
componentElement.dataset.scope = 'my-component';

// Add more styles dynamically
manager.add(
  'layout-styles',
  `
  .container {
    display: flex;
    gap: 1rem;
  }
`,
);

// Remove specific styles
manager.remove('layout-styles');

// Clean up everything when component unmounts
manager.destroy();
```

### Using StyleManager with Shadow DOM

```typescript
import { StyleManager } from '@winglet/style-utils';

// Create a custom element with Shadow DOM
class MyCustomElement extends HTMLElement {
  private shadowRoot: ShadowRoot;
  private styleManager: StyleManager;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });

    // Create a StyleManager for this shadow root
    this.styleManager = StyleManager.get('custom-element', {
      shadowRoot: this.shadowRoot,
    });

    this.setupStyles();
    this.render();
  }

  private setupStyles() {
    this.styleManager.add(
      'host-styles',
      `
      :host {
        display: block;
        font-family: Arial, sans-serif;
      }
    `,
    );

    this.styleManager.add(
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
    this.styleManager.destroy();
  }
}

customElements.define('my-custom-element', MyCustomElement);
```

### Dynamic Theme Management

```typescript
import { StyleManager } from '@winglet/style-utils';

class ThemeManager {
  private styleManager: StyleManager;

  constructor() {
    this.styleManager = StyleManager.get('theme');
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

    this.styleManager.add(
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
  }

  addCustomStyles(id: string, css: string) {
    this.styleManager.add(id, css);
  }

  removeCustomStyles(id: string) {
    this.styleManager.remove(id);
  }
}

// Usage
const themeManager = new ThemeManager();
themeManager.applyTheme('dark');

// Add scope to body element
document.body.dataset.scope = 'theme';
```

### Performance Optimization Examples

```typescript
import { StyleManager, compressCss } from '@winglet/style-utils';

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
const manager = StyleManager.get('optimized-component');
manager.add('styles', productionCSS, true); // true = already compressed

// Batch style updates for better performance
const manager2 = StyleManager.get('batch-component');

// All these updates will be batched into a single DOM update
manager2.add('style1', '.class1 { color: red; }');
manager2.add('style2', '.class2 { color: blue; }');
manager2.add('style3', '.class3 { color: green; }');
// DOM update happens in next animation frame
```

---

## API Reference

### ClassNames

#### `classNames(classes: ClassValue[], options?: ClassNamesOptions): string`

Combines multiple class values into a single space-separated string.

**Parameters:**

- `classes`: Array of class values to process
- `options`: Configuration options for processing

**Options:**

- `removeDuplicates`: Remove duplicate classes (default: true)
- `normalizeWhitespace`: Normalize whitespace (default: true)
- `filterEmpty`: Remove empty strings (default: true)

#### `cx(...args: ClassValue[]): string`

Convenient variadic version of classNames with performance-optimized defaults.

### CSS Compression

#### `compressCss(css: string): string`

Compresses CSS by removing unnecessary whitespace and comments.

**Parameters:**

- `css`: CSS string to compress

**Returns:** Compressed CSS string

### Style Management

#### `StyleManager.get(scopeId: string, config?: StyleManagerConfig): StyleManager`

Gets or creates a StyleManager instance for the specified scope.

**Parameters:**

- `scopeId`: Unique identifier for the style scope
- `config`: Optional configuration object

#### `StyleManager.prototype.add(id: string, css: string, compressed?: boolean): void`

Adds or updates a CSS style in the scope.

**Parameters:**

- `id`: Unique identifier for the style
- `css`: CSS string to add
- `compressed`: Skip compression if true (default: false)

#### `StyleManager.prototype.remove(id: string): void`

Removes a specific CSS style from the scope.

#### `StyleManager.prototype.destroy(): void`

Destroys the StyleManager instance and removes all associated styles.

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

This project is licensed under the MIT License. See the \*\*[`LICENSE`](./LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.
