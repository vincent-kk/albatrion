# Application cache ownership

## Purpose

Own consumer-keyed cache domains used by Form bindings, without placing application state in core.

## Conventions

- Keys use object identity; renderer predicates are part of blueprint identity.
- Domain entries carry a generation and immutable membership; development freezes are shallow and never freeze authored keys.
- The registry is internal to bindings and tests; this module does not widen the package entry point.

## Boundaries

### Always do

- Inject the blueprint store through the binding's existing core construction arguments.
- Keep warnings available to every distinct consumer and retain mounted roots after invalidation.
- Use explicit rebuild for schema mutations; ordinary reset preserves its root.

### Ask first

- Add another domain, change key ownership, or widen the package public surface.

### Never do

- Import this module from core, serialize schemas into cache keys, or cache mutable node/value state here.
- Treat domain invalidation as permission to mutate an existing root's blueprint or templates.
