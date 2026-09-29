# Schema Intersection

## Purpose

Provide pure leaf-constraint intersection shared by blueprint analysis and legacy schema merging.

## Conventions

- Represent impossible intersections as data; callers own error policy.
- Compare JSON const values structurally using the existing equality utility.
- Keep one named exported function per implementation file.

## Boundaries

### Always do

- Preserve input values and document identity guarantees.
- Keep tests within this module and expose consumers through the named entry point.

### Ask first

- Change the architecture ledger's intersection semantics.
- Expand from leaf constraints into schema traversal or runtime evaluation.

### Never do

- Import blueprint, legacy nodes, React, or schema error formatters.
- Merge regular expressions into a replacement regular expression.
- Throw schema-policy errors from an intersection primitive.
