# SchemaNodeProxy

## Purpose

Resolve one schema node and own its subscriptions, renderer selection, and input factory in one proxy component. The renderer boundary owns injected formatting and rendering failures.

## Conventions

- Keep node tracking and memoized selections in hooks; avoid a separate field component or field path provider.
- Resolve the renderer once and wrap it in an ErrorBoundary used directly, without memo. Compute errorMessage inside that boundary.
- Pass the current field path to the reporter hook; snapshot refs may bridge the stable renderer selection.
- Preserve the display-contents wrapper and RequestRemount wrapper key.

## Boundaries

### Always do

- Return null for missing or disabled nodes.
- Hide formatted errors when error visibility is false.
- Isolate formatting and renderer failures with the same field reporter and path.
- Keep renderer boundaries mounted across Refresh; only RequestRemount replaces the subtree.

### Ask first

- Adding a public proxy prop or changing the event tracking mask.

### Never do

- Create or mutate schema nodes in the proxy.
- Override essential node identity props with consumer props.
- Add a second boundary around the entire field.
