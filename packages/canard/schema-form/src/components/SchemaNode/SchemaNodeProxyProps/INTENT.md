# SchemaNodeProxyProps

## Purpose

Owns the shared recursive node-rendering props contract consumed by the proxy, input, and deferred-render layers.

## Conventions

- Keep this module type-only so render consumers do not depend on each other's implementations.
- Preserve the optional props accepted by the existing SchemaNodeProxy public surface.

## Boundaries

### Always do

- Export the shared props by name through this module's entry point.
- Keep the existing SchemaNodeProxy export path compatible.

### Ask first

- Change a prop's name, optionality, or callback contract.

### Never do

- Import a rendering component implementation into this contract.
- Add runtime rendering or state management.
