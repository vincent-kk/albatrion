# Albatrion Documentation Site

Technical documentation for Albatrion monorepo packages, built with [Docusaurus 3](https://docusaurus.io/).

## Packages

| Namespace | Packages | Description |
|-----------|----------|-------------|
| `@canard` | schema-form, 7 plugins | JSON Schema-driven React form engine |
| `@winglet` | 6 packages | Shared utility libraries |
| `@lerx` | promise-modal | Promise-based modal management |
| `@slats` | claude-assets-sync | AI agent asset synchronization |

## Development

```bash
# Install dependencies (from monorepo root)
yarn

# Start dev server
yarn workspace documents start

# Build
yarn workspace documents build

# Serve production build locally
yarn workspace documents serve
```

## Features

- **Interactive Playground**: Sandpack-based live code editor for `@canard/schema-form`
- **Bilingual Tabs**: In-page EN/KR language switching via `<LangTabs>` component
- **AI-Friendly Output**: `llms.txt` and `llms-full.txt` generated via `docusaurus-plugin-llms`
- **Local Search**: Offline-capable search via `@easyops-cn/docusaurus-search-local`
- **Fast Builds**: Rspack bundler via `@docusaurus/faster`

## Adding Documentation

1. Create `.mdx` files under `docs/{namespace}/{package}/`
2. Use shared components: `<LangTabs>`, `<ForAI>`, `<PackageHeader>`
3. Run `yarn workspace documents build` to verify
