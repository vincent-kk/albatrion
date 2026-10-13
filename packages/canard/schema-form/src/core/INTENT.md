# core — Node engine and surface composition boundary

## Purpose

Compose engine and node surface contracts for render bindings and core hosts. The engine owns execution rules; the surface owns public node types, guards and build channels.

## Conventions

- Keep only named re-exports at the entry point and leave implementation with its owning module.
- Use the same tree construction and mounting channels for core hosts and React bindings.
- Store raw input separately from emitted output and report type mismatches explicitly.
- Pass renderer presentation as opaque type parameters; engine schema types never import React.

## Boundaries

### Always do

- Re-export public contracts and binding-only channels by name through the entry point.
- Preserve host predicate references across tree construction and mounting.
- Change node values through the public write contract and named binding channels.

### Ask first

- Changing event delivery timing or public option bits.
- Adding public node members or binding-only operations.

### Never do

- Import the preserved legacy engine or the application plugin registry.
- Expose binding-only functions through the package entry.
- Read renderer presentation or mutate caller-owned schema data.
