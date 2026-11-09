# schema-form — Public package boundary

## Purpose

Compose the public JSON Schema form contract; implementation decisions belong to the owning modules.

## Conventions

Use one explicit package entry point. Keep renderer-neutral execution separate from React bindings and validator implementations.

## Boundaries

### Always do

- Preserve predictable names and observable behavior; explain the reason, time cost and retained-memory cost of a contract change.
- Keep schema authoring, validation and presentation responsibilities distinct; follow [the package contract](DETAIL.md).

### Ask first

- Widening the public surface, changing callback timing or accepting a measured performance regression.

### Never do

- Expose binding-only channels, mutate caller-owned schemas or duplicate a child's contract at this boundary.
- Add compatibility aliases or value repair that silently changes the authored meaning.
