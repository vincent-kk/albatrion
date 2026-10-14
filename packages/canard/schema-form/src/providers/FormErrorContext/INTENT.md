# Form error reporting

## Purpose

Own the reporter lifetime outside the root error boundary and provide explicit-path callbacks to field boundaries. Path context is reserved for deferred Placeholders whose wrapper resolves no field props.

## Boundaries

### Always do

- Deliver committed records to the latest callback and preserve error identity.
- Keep boundary wrappers at their component ownership point.
- Read the reporter during render and take the current field path as a hook argument.

### Ask first

- Changing public error record fields or sink semantics.

### Never do

- Import the form, plugin registry, or core implementation.
- Rethrow a caught render error from a boundary callback.
