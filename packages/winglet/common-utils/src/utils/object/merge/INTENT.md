# Merge

## Purpose

Own recursive object merging and the explicit policies that select mutation, reference retention, arrays, and opaque values.

## Conventions

- The public merge function dispatches once and contains no recursive merging logic.
- Default and option-aware recursion are separate internal functions; neither calls the public wrapper.
- Preserve the optionless API's behavior and keep renderer-specific atomic knowledge in the supplied predicate.

## Boundaries

### Always do

- Expose the merge function and its option type through the named entry point.
- Keep recursion, helpers, and verification inside this module.
- Use ancestor-owned data-property primitives for the option-aware path.
- Describe mutation and returned-reference guarantees for each policy.

### Ask first

- Change the optionless merge contract or reserved-key policy.
- Add schema-specific behavior or a runtime dependency.

### Never do

- Put recursion or policy implementation in the public wrapper or entry point.
- Re-enter the wrapper from a recursive implementation.
- Import through the ancestor object barrel, which re-exports this module.
- Mutate source containers during either merge mode.
