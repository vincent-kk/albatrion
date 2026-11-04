# validateChildTargets

## Purpose

Validate that child-targeting controls reference children declared on their host.

## Conventions

- Validate after ordinary, lifted and virtual children have been constructed.
- Check static targets regardless of the declaration's active gates.

## Boundaries

### Always do

- Verify that fields targets name direct children of the host.
- Report missing child targets with their authored schema location.

### Ask first

- Changing the scope of child-target validation.

### Never do

- Accept fields targets on a terminal host as valid children.
- Add children or evaluate gates during validation.
- Require declarations on one node to share a discriminator key; each declaration owns its union's key.
