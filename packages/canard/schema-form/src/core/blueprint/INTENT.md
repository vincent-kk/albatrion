# Blueprint

## Purpose

Analyze an authored schema into renderer-independent declarations and fragments before any runtime node is created.

## Conventions

- The architecture ledger defines schema semantics; the module owns their executable representation.
- Use full names, including `PropertyDeclaration` and `SchemaFragment`.
- Analysis receives renderer decisions as predicates and never imports React.
- Keep authored schemas immutable and retain reference identity where the merge contract permits it.
- Publish branch, feature and convergence proofs only after declaration collection has completed; include disabled declarations and keep uncertain reads on the conservative path.

## Boundaries

### Always do

- Distinguish conjunctive overlays from declaration-only branches.
- Report static failures with schema locations and collect warnings only for an interested consumer.
- Cross sibling boundaries through named entry-point exports.
- Keep recursive schema references finite; runtime shape construction belongs to the node engine.

### Ask first

- Change the accepted schema language or the architecture ledger's outcome for an example.
- Introduce value evaluation, node allocation, or renderer dependencies into analysis.

### Never do

- Import the legacy engine or mutate the caller's schema.
- Infer branch selection from const or enum without an explicit discriminator.
- Evaluate validator guards during analysis.
- Inspect presentation values to select a renderer or terminal strategy.
