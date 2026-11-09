# engine — Execution composition

## Purpose

Own shared execution invariants and compose child contracts for the node surface.

## Conventions

Keep helpers shared by children at their lowest common owner. Child modules consume sibling entry points directly.

## Boundaries

### Always do

- Preserve source, computed and output channels and the settlement-to-delivery boundary.
- Keep common equality and derived-record lifetime rules in [the engine contract](DETAIL.md).
- Set internal test modes before tree construction and restore them after use.

### Ask first

- Changing settlement order, budgets, delivery timing or binding-only exports.

### Never do

- Import the surface runtime class, React or the application plugin registry.
- Put child algorithms in this entry point or expose internal mode controls from the package.
