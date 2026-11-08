# core — Engine and surface composition

## Purpose

Compose the renderer-neutral execution engine and node surface for host bindings.

## Conventions

Name re-exports explicitly. Keep runtime implementation in its owner and presentation values opaque.

## Boundaries

### Always do

- Preserve the same tree construction and mount channels for core hosts and React bindings.
- Keep binding-only settings, validation epochs and lifecycle channels outside the package surface.

### Ask first

- Changing the host boundary, public node contract, option bits or event timing.

### Never do

- Import React or the application plugin registry, serialize inline presentation values, or mutate caller-owned schemas.
- Introduce global type augmentation to supply a renderer's schema vocabulary.
