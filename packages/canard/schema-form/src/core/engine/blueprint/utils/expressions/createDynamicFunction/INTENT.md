# createDynamicFunction

## Purpose

Compile the existing expression language into a dependency-array function without reading form state.

## Conventions

- Keep the established expression syntax and boolean coercion behavior during ownership migration.
- Register references through the supplied path manager before generating dependency indexes.
- Expose the compiler and its function types through named exports.

## Boundaries

### Always do

- Preserve compilation failures as JSONSchemaError diagnostics.
- Keep generated functions independent of nodes, renderers, and legacy implementation imports.
- Keep compiler verification within this owner.

### Ask first

- Change the accepted expression language or boolean coercion rules.

### Never do

- Evaluate an expression while constructing the blueprint.
- Swallow compilation errors or substitute an empty function.
- Read runtime form state from the compiler.
