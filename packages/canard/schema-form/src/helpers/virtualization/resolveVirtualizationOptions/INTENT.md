# resolveVirtualizationOptions

## Purpose

Owns virtualization option types, backfill values and default normalization independently of the manager that consumes them.

## Conventions

- Normalize absent fields without changing explicit values or allocating manager state.
- Export option types and values through this module's entry point.

## Boundaries

### Always do

- Preserve public option names, defaults and enum values.
- Return null for disabled input.

### Ask first

- Change option defaults or normalization semantics.

### Never do

- Depend on VirtualizationManager or the parent's compatibility exports.
- Create browser observers or render React components.
