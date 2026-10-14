# Authored schema identity

## Purpose

Compare authored schemas for Form reset without rebuilding equal trees.

## Boundaries

### Always do

- Preserve object key order and compare non-JSON values by reference.

### Ask first

- Changing equality for authored schemas.

### Never do

- Mutate or clone a schema during comparison.
