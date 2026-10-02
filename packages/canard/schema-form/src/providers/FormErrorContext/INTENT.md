# Form error reporting

## Purpose

Own the reporter lifetime outside the root error boundary and provide it to field boundaries.

## Boundaries

### Always do

- Deliver committed records to the latest callback and preserve error identity.
- Keep boundary wrappers at their component ownership point.

### Ask first

- Changing public error record fields or sink semantics.

### Never do

- Import the form, plugin registry, or core implementation.
- Rethrow a caught render error from a boundary callback.
