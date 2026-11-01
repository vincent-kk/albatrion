# RootNodeContext

## Purpose

Build and mount a root FieldNode tree from JSON Schema, expose the current root through Context and the imperative binding, and connect validation, external errors and Form callbacks.

## Conventions

- Deliver callbacks from prepared current loads at engine-chain end while hidden; retire replaced loads and preserve each buffered record's original root and warning scope.
- Use typed generic React providers and the createRootLoad construction channel.
- Schedule validation for every mount, reset, rebuild and validator replacement in the shared after-frame load slot.
- Default to ValidationMode.OnChange | ValidationMode.OnRequest.
- Apply the full external-error list to the current root, then group non-root issues by resolved node path.
- Keep the Context node instance for the Provider lifetime; WorkspaceContext supplies the consumer context.

## Boundaries

### Always do

- Build speculative roots through createRootLoad and the core construction/mount boundary.
- Keep the root subscription for the load lifetime; effect cleanup releases only validation-cache consumer references.
- Resolve errors against store.load.root after earlier commit effects have replaced the binding.
- Mark replacement loads prepared and reported together while retaining their caller error.

### Ask first

- Change the default validation mode or Context node update semantics.

### Never do

- Build or inject roots outside the established core construction channel.
- Apply external errors without grouping resolved non-root paths.
- Consume RootNodeContext outside the Form tree.
