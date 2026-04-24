# Dependency-Cruiser Isolation Rule (optional)

Skip this step unless `${TARGET_PATH}/.dependency-cruiser.cjs`
already exists or the user explicitly asks. This guardrail is a
CI-time check that the consumer's `src/**` never reaches the
Claude assets tree.

The post-v0.3.0 layout removes the bin stub entirely, so the
former `src-no-bin` and `src-no-claude-assets-sync` rules are no
longer load-bearing — the consumer no longer imports any of that
from anywhere. The one remaining invariant is `src/**` must not
import from `docs/**`.

## Rule

```javascript
module.exports = {
  forbidden: [
    {
      name: 'src-no-docs',
      severity: 'error',
      comment:
        'src/ must not import from docs/. docs/claude/** contains pure markdown ' +
        'assets meant only for the engine dispatcher, not for the library runtime.',
      from: { path: '^src/' },
      to: { path: '^docs/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    includeOnly: '^(src|docs)',
  },
};
```

## Optional script

```json
"scripts": {
  "depcheck": "depcruise src docs --config .dependency-cruiser.cjs --no-progress"
}
```

Zero errors expected. Orphan warnings on `docs/**` are
acceptable — the docs tree never imports anything.

## Legacy rules removed

Previous revisions of this skill had three forbidden rules
(`src-no-bin`, `src-no-docs`, `src-no-claude-assets-sync`), a
`no-orphans` adjustment excluding `^bin/`, and an `includeOnly`
covering `^src` and `^bin`. All of those assumed the consumer
owned a `bin/` directory. The new layout owns no `bin/`, so the
extra rules are dead. Do not reintroduce them.
