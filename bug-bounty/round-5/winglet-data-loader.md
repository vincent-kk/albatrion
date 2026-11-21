# @winglet/data-loader: bug bounty round 5

No new finding in `@winglet/data-loader`. Items in the documents of [round 1](../round-1/winglet-data-loader.md), [round 2](../round-2/winglet-data-loader.md), [round 3](../round-3/winglet-data-loader.md) and [round 4](../round-4/winglet-data-loader.md) were treated as fixed and excluded. The main session re-ran every probe: the `r5-winglet-data` folder ran 2 tests, and both pass.

Probes: [probes/winglet-data-loader/](probes/winglet-data-loader/)

- Copy a folder back to `packages/winglet/data-loader/src/__bounty__/<hunter-id>/` and run `yarn workspace @winglet/data-loader test --run src/__bounty__/<hunter-id>/`. The probes import the package source through the `@/data-loader` alias.
- Earlier probes re-run (`r5-rerun-others`): round 1 ran 2 tests (0 fail), round 2 7 (0 fail), round 3 6 (2 fail), and round 4, with its own configuration, 13 (5 fail); the earlier release probe `r3-contracts` ran 2 (1 fail). Every failure is an assertion of text or behavior that a recorded documentation fix changed (round 3 item 4 on the TTL `cacheMap`, round 3 item 3 on the per-key error cache, round 4 items 1 and 2) or a listed round 3 diagnostic (the thenable case). No earlier item regressed.

## Hypotheses checked and not bugs

- When `cache.get` throws for one key inside an open batch, the other keys still load, and `loadMany` returns an `Error` for that key.
- A late failure of an older batch clears the cache entry that a newer request made for the same key; the reference `dataloader` 1.4.0 makes the same batch calls, so this is not reported.
- `loadMany` puts a synchronously thrown value that is not an `Error` into its result unchanged, which matches the asynchronous rejection path that round 4 accepted.
- The source maps carry `sourcesContent`, so they cause no missing-source warnings.
