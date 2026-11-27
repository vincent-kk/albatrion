# Working on @winglet/json-schema

Read the repository `CLAUDE.md` and `DOCUMENTATION.md`, then [the root contract](src/INTENT.md). They govern changes here. Consumer behavior lives in [the specification](docs/en/SPECIFICATION.md); packaged guidance starts at [the skill](docs/agents/skills/json-schema-skill/SKILL.md).

## Maintain the boundaries

Both scanner drivers use one resumable direct-call DFS machine. Only the async driver waits for callback results; keep reference policy and child discovery common so their results cannot diverge. The resolver object owns lexical URI contexts, canonical identity, document indexing and host-valid copies. Use its entry point from the convenience helper; do not reproduce that work in a driver.

Dialect recognition, vocabulary compilation, copying and the built-in resolver belong to the scanner module. The schema declarations (`Dialect`, `DEFAULT_KEYWORDS` and the keyword descriptor types) belong to the keyword module, which never imports scanner code so that its subpath stays free of the scanner. Keep identifier/dynamic-scope checks on complete targets, independently of public filter and maxDepth. A preserved reference is an output contract: do not merge siblings or inline it merely because a pointer can be found. Read the current relocation rules before changing this boundary.

Treat inputs, callback replacements and provider targets as caller-owned. Mutations return replacements; output materialization owns copies. Preserve entry identity and capture children after parent processing. User callbacks, custom loaders and generic copying of non-plain objects are outside the plain-JSON depth-safety guarantee.

## Verify changes

From the repository root:

```sh
yarn workspace @winglet/json-schema build
yarn workspace @winglet/json-schema test --run
yarn workspace @winglet/json-schema lint
```

The build also checks package types. For affected consumers use `yarn run:all typecheck`. Benchmark and equivalence commands are documented in [benchmark/README.md](benchmark/README.md).

## Agent asset isolation

`docs/agents` is shipped guidance, not a runtime dependency. Source code must not import it or the asset-sync tool, and docs must not be added as runtime export subpaths. Installed agent guidance must locate the installed package's declarations and specification; it cannot assume repository-only source or tests are available.
