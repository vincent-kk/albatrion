# Application cache contract

## Requirements

- Bindings own consumer-keyed caching (BLUEPRINT-052, SURFACE-063). Engine-derived records, value/node memos and engineModes remain outside this change.
- This document is the ownership address for the cache inventory: this domain owns only authored-schema blueprint reuse; no engine cache migrates here in D3.

## API Contracts

- CacheManager is a static domain registry. reset clears registered domains for subsequent resolutions; existing mounted roots remain usable.
- createCacheDomain uses weak object keys. resolve returns one stable entry envelope containing value and creation generation. invalidate removes one key; clear advances the generation and replaces storage. No operation mutates a previously returned value. Values and entry envelopes are shallow-frozen in development.
- Blueprint storage retains predicate-identity variants for each schema object. Entry-list membership is immutable; core writes replacement lists. Warning lists are collected lazily and replayed once per collect function identity, with recipients weakly retained.
- Form binding consumers inject the store into core. CacheManager and domain constructors are exported internally for binding/reset ownership and direct domain verification, never from the package entry point.
- A form's rebuild invalidates its committed schema key and delegates to the existing reset load path with forced tree replacement. Other forms keep their roots and blueprints, including ordinary reset; only their own rebuild or a new mount resolves a new blueprint (coordinator clarification for round 447).
- First resolution retains O(blueprint declarations + warning records + predicate variants); repeated matching schema/predicate resolution avoids analysis and keeps ordinary tree construction cost. Weak keys and weak warning recipients do not keep otherwise unused consumers alive.

## Acceptance Criteria

### domain-identity — Stable weak-key ownership

- Same keys resolve the same value and generation until invalidated or cleared; different keys resolve independently; development freezing never freezes authored keys.

### blueprint-consumers — Schema and predicate identity

- Same schema and predicate identities reuse the blueprint; distinct objects or predicates do not. Every distinct warning collector receives the preserved records once.

### form-rebuild — Explicit replacement only

- Shared-schema forms mount with the same blueprint and each receives warnings. Own rebuild replaces blueprint/tree and follows reset option semantics; another form's ordinary reset preserves its original tree. CacheManager.reset makes subsequent mounts resolve a new blueprint.

## Last Updated

2026-10-27
