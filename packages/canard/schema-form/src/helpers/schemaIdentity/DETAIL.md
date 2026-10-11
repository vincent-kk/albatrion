# Authored schema identity

## Requirements

WRITE-043 requires ordered structural equality for JSON and reference identity for atoms.

## API Contracts

The comparator short-circuits identical references. Otherwise it traverses ordered own keys of arrays and plain objects. React elements and ref-shaped objects are atomic.

## Acceptance Criteria

### ordered-equality — Ordered structural equality

- Reordered object properties differ; identical component references remain equal.

## Last Updated

Contract basis: WRITE-043, execution ADR D7.
