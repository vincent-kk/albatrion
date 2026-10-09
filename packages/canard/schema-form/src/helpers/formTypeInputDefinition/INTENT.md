# formTypeInputDefinition

## Purpose

Normalize consumer input maps and definitions, and isolate each resolved input once at its ownership point.

## Conventions

- Keep only valid React components.
- Keep the boundary outside the raw input's applied generation key.
- Read the current reporter with the input's explicit path during render.
- Match wildcard paths by segment and normalize object tests into functions.

## Boundaries

### Always do

- Isolate every normalized input and silently skip invalid components.
- Preserve input wrapper depth and Refresh behavior when passing the path explicitly.

### Ask first

- Changing wildcard matching or the normalized definition interface.

### Never do

- Accept arbitrary non-pointer map keys.
- Render components or run hooks during normalization.
