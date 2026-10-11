# core — New node engine public boundary

## Purpose

Own the new engine's public node union, per-kind types, guards, events, validator contract and mounted core-host entry. Export binding-only channels by name; the package entry does not expose them.

## Conventions

- Build and mount through the same channels for core hosts and React bindings.
- Keep renderer presentation opaque and parameterized; core schema types never import React.
- Store raw input separately from emitted output and report type mismatches explicitly.
- Leave settlement, dispatch, validation and navigation behavior with their owning modules.

## Boundaries

### Always do

- Export public contracts by name through the owning module's entry point.
- Preserve predicate references across tree construction and mounting.
- Change node values through the public write contract and binding channels.

### Ask first

- Changing event delivery timing or public option bits.
- Adding public node members or binding-only operations.

### Never do

- Import the preserved legacy engine or the application plugin registry.
- Expose binding-only functions through the package entry.
- Read React presentation fields or mutate caller-owned schema data.
