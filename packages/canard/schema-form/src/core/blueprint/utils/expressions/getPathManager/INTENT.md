# getPathManager

## Purpose

Own one compilation's ordered dependency-path registry and normalized path indexes.

## Conventions

- Preserve first-registration order and the existing fragment-prefix normalization.
- Keep registries local to their caller rather than sharing mutable state across compilations.
- Follow the repository's small-array convention for duplicate lookup.

## Boundaries

### Always do

- Use the same normalization for registration and lookup.
- Expose the factory and its contract type through named exports.

### Ask first

- Change path normalization or dependency ordering.

### Never do

- Resolve a path against live form state.
- Evaluate gates or expressions.
- Mutate a registry owned by another compilation.
