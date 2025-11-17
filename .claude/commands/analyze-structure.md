---
description: Analyze project structure and generate .project-structure.yaml configuration
alwaysApply: false
---

# Analyze Project Structure Rule

## Purpose

Automatically analyze project structure and generate `.project-structure.yaml` configuration file in the project root. This rule should be executed when:

1. `.project-structure.yaml` does not exist in project root
2. User explicitly requests project structure analysis
3. Before applying requirement-driven-development or plan-execution rules

## Analysis Process

### Phase 1: Detect Package Manager

```bash
# Check lock files to determine package manager
if [ -f "yarn.lock" ]; then
  PACKAGE_MANAGER="yarn"
elif [ -f "pnpm-lock.yaml" ]; then
  PACKAGE_MANAGER="pnpm"
elif [ -f "package-lock.json" ]; then
  PACKAGE_MANAGER="npm"
elif [ -f "bun.lockb" ]; then
  PACKAGE_MANAGER="bun"
else
  PACKAGE_MANAGER="npm"  # default
fi
```

### Phase 2: Detect Project Type

```bash
# Read package.json and check for workspaces
if [ -f "package.json" ]; then
  # Check for workspaces field (yarn/npm)
  if grep -q '"workspaces"' package.json; then
    PROJECT_TYPE="monorepo"
  # Check for pnpm-workspace.yaml
  elif [ -f "pnpm-workspace.yaml" ]; then
    PROJECT_TYPE="monorepo"
  # Check for lerna.json
  elif [ -f "lerna.json" ]; then
    PROJECT_TYPE="monorepo"
  # Check for nx.json
  elif [ -f "nx.json" ]; then
    PROJECT_TYPE="monorepo"
  else
    PROJECT_TYPE="single-package"
  fi
else
  PROJECT_TYPE="unknown"
fi
```

### Phase 3: Scan Directory Structure

**For Monorepo:**

```bash
# Find packages directory
PACKAGES_DIR=""

# Common patterns
for dir in "packages" "apps" "libs" "modules"; do
  if [ -d "$dir" ]; then
    PACKAGES_DIR="$dir"
    break
  fi
done

# If not found, check package.json workspaces
if [ -z "$PACKAGES_DIR" ]; then
  # Extract from workspaces field
  # Example: "workspaces": ["packages/*", "apps/*"]
  PACKAGES_DIR=$(grep -A 5 '"workspaces"' package.json | \
                 grep -o '"[^"]*"' | \
                 head -1 | \
                 sed 's/"//g' | \
                 sed 's/\/\*$//')
fi
```

**For Single Package:**

```bash
# Find source directory
SOURCE_DIR="src"

# Check common patterns
for dir in "src" "source" "lib"; do
  if [ -d "$dir" ]; then
    SOURCE_DIR="$dir"
    break
  fi
done
```

### Phase 4: Detect Tech Stack

**Frontend Framework:**

```javascript
// Read package.json dependencies
const detectFrontendFramework = (dependencies) => {
  if (dependencies.react || dependencies["react-dom"]) return "react";
  if (dependencies.vue) return "vue";
  if (dependencies["@angular/core"]) return "angular";
  if (dependencies.svelte) return "svelte";
  return "unknown";
};
```

**Backend Framework:**

```javascript
const detectBackendFramework = (dependencies) => {
  if (dependencies["@nestjs/core"]) return "nestjs";
  if (dependencies.express) return "express";
  if (dependencies.fastify) return "fastify";
  if (dependencies.koa) return "koa";
  if (dependencies.next) return "next"; // Next.js can be backend too
  return "unknown";
};
```

**State Management:**

```javascript
const detectStateManagement = (dependencies) => {
  const stateLibs = [];
  if (dependencies.jotai) stateLibs.push("jotai");
  if (dependencies.redux || dependencies["@reduxjs/toolkit"])
    stateLibs.push("redux");
  if (dependencies.zustand) stateLibs.push("zustand");
  if (dependencies.mobx) stateLibs.push("mobx");
  if (dependencies.recoil) stateLibs.push("recoil");
  if (dependencies["@apollo/client"]) stateLibs.push("apollo-client");
  if (dependencies["@tanstack/react-query"]) stateLibs.push("react-query");
  return stateLibs;
};
```

**API Style:**

```javascript
const detectAPIStyle = (dependencies) => {
  if (dependencies.graphql || dependencies["@apollo/server"]) return "graphql";
  if (dependencies["express"] && !dependencies.graphql) return "rest";
  if (dependencies["@trpc/server"]) return "trpc";
  return "rest"; // default
};
```

**Testing Framework:**

```javascript
const detectTestingFramework = (devDependencies) => {
  const testing = {};

  // Unit test frameworks
  if (devDependencies.vitest) testing.unit = "vitest";
  else if (devDependencies.jest) testing.unit = "jest";
  else if (devDependencies.mocha) testing.unit = "mocha";

  // E2E frameworks
  if (devDependencies.playwright) testing.e2e = "playwright";
  else if (devDependencies.cypress) testing.e2e = "cypress";

  // Mocking
  if (devDependencies.msw) testing.mocking = "msw";

  return testing;
};
```

**UI Library:**

```javascript
const detectUILibrary = (dependencies) => {
  if (dependencies["antd-mobile"]) return "antd-mobile";
  if (dependencies.antd) return "antd";
  if (dependencies["@mui/material"]) return "mui";
  if (dependencies["@chakra-ui/react"]) return "chakra-ui";
  if (dependencies.tailwindcss) return "tailwind";
  return "custom";
};
```

### Phase 5: Detect Commands

**Scan package.json scripts:**

```javascript
const detectCommands = (scripts, projectType, packagesDir) => {
  const commands = {
    dev: {},
    test: {},
    lint: {},
    build: {},
    typecheck: {},
    custom: {},
  };

  // For monorepo, detect workspace-specific commands
  if (projectType === "monorepo") {
    // Pattern: "app:dev": "yarn workspace @scope/app dev"
    Object.entries(scripts).forEach(([key, value]) => {
      const [pkg, cmd] = key.split(":");
      if (cmd && ["dev", "test", "lint", "build"].includes(cmd)) {
        commands[cmd][pkg] = value;
      }
    });

    // Add 'all' commands
    if (scripts.dev) commands.dev.all = scripts.dev;
    if (scripts.test) commands.test.all = scripts.test;
    if (scripts.lint) commands.lint.all = scripts.lint;
    if (scripts.build) commands.build.all = scripts.build;
  } else {
    // Single package
    commands.dev.all = scripts.dev || scripts.start || "npm run dev";
    commands.test.all = scripts.test || "npm test";
    commands.lint.all = scripts.lint || "npm run lint";
    commands.build.all = scripts.build || "npm run build";
  }

  // Detect custom commands
  if (scripts["generate:types"])
    commands.custom.generate_types = scripts["generate:types"];
  if (scripts["generate:graphql"])
    commands.custom.generate_graphql = scripts["generate:graphql"];
  if (scripts.storybook) commands.custom.storybook = scripts.storybook;

  return commands;
};
```

### Phase 6: Detect Path Conventions

**Scan existing files to infer conventions:**

```bash
# Find component pattern
COMPONENT_PATTERN=""
if find . -name "*.tsx" -o -name "*.jsx" | grep -i "component" | head -1; then
  # Extract pattern from first component file
  SAMPLE_FILE=$(find . -name "*.tsx" | grep -i "component" | head -1)
  # Derive pattern: packages/app/src/components/Button/Button.tsx
  #            -> {packages_dir}/app/src/components/{ComponentName}/{ComponentName}.tsx
fi

# Find page pattern
PAGE_PATTERN=""
if find . -name "*.page.tsx" -o -name "*.page.jsx" | head -1; then
  SAMPLE_FILE=$(find . -name "*.page.tsx" | head -1)
  # Derive pattern
fi

# Find API/resolver pattern
API_PATTERN=""
if find . -name "*.resolver.ts" -o -name "*.controller.ts" | head -1; then
  SAMPLE_FILE=$(find . -name "*.resolver.ts" -o -name "*.controller.ts" | head -1)
  # Derive pattern
fi
```

### Phase 7: Detect Naming Conventions

```bash
# Analyze existing file names
analyze_naming_convention() {
  local files=$1
  local pattern=$2

  # Count files matching each pattern
  local pascal_count=$(echo "$files" | grep -c '^[A-Z][a-zA-Z]*\.')
  local camel_count=$(echo "$files" | grep -c '^[a-z][a-zA-Z]*\.')
  local kebab_count=$(echo "$files" | grep -c '^[a-z][a-z-]*\.')
  local snake_count=$(echo "$files" | grep -c '^[a-z][a-z_]*\.')

  # Return most common
  if [ $pascal_count -gt $camel_count ] && [ $pascal_count -gt $kebab_count ]; then
    echo "PascalCase"
  elif [ $kebab_count -gt $camel_count ]; then
    echo "kebab-case"
  elif [ $snake_count -gt $camel_count ]; then
    echo "snake_case"
  else
    echo "camelCase"
  fi
}

# Detect component naming
COMPONENT_FILES=$(find . -name "*.tsx" -o -name "*.jsx" | head -20)
COMPONENT_NAMING=$(analyze_naming_convention "$COMPONENT_FILES")

# Detect directory naming
DIR_NAMES=$(find . -type d -depth 1 | sed 's|./||')
DIR_NAMING=$(analyze_naming_convention "$DIR_NAMES")
```

### Phase 8: Detect Development Ports

```bash
# Check common config files for ports
detect_ports() {
  local frontend_port=3000
  local backend_port=4000
  local storybook_port=6006

  # Check vite.config.ts
  if [ -f "vite.config.ts" ]; then
    frontend_port=$(grep -o 'port: [0-9]*' vite.config.ts | grep -o '[0-9]*' | head -1)
  fi

  # Check .env files
  if [ -f ".env" ]; then
    backend_port=$(grep PORT .env | grep -o '[0-9]*' | head -1)
  fi

  echo "frontend: $frontend_port"
  echo "backend: $backend_port"
  echo "storybook: $storybook_port"
}
```

## Generation Template

After analysis, generate `.project-structure.yaml`:

```yaml
# Auto-generated by analyze-project-structure rule
# Generated at: {timestamp}
# Project: {project_name}

project:
  name: "{project_name}"
  type: "{project_type}" # monorepo | single-package
  description: "Auto-detected project structure"

structure:
  root: "."
  packages_dir: "{packages_dir}" # For monorepo
  source_dir: "{source_dir}" # For single-package
  tests_dir: "{tests_dir}"
  docs_dir: "docs"
  tasks_dir: ".tasks"

package_manager:
  type: "{package_manager}" # yarn | npm | pnpm | bun
  workspace_command: "{workspace_command}" # For monorepo

commands:
  dev: { dev_commands }
  test: { test_commands }
  lint: { lint_commands }
  build: { build_commands }
  typecheck: { typecheck_commands }
  custom: { custom_commands }

tech_stack:
  frontend:
    framework: "{frontend_framework}"
    language: "{language}"
    ui_library: "{ui_library}"

  backend:
    framework: "{backend_framework}"
    language: "{language}"
    api_style: "{api_style}"

  state_management: { state_management_list }

  testing:
    unit: "{unit_test_framework}"
    e2e: "{e2e_framework}"
    mocking: "{mocking_library}"

  database:
    type: "{database_type}"
    orm: "{orm}"

development:
  ports:
    frontend: { frontend_port }
    backend: { backend_port }
    storybook: { storybook_port }

  env_files:
    - ".env"
    - ".env.local"
    - ".env.development"

path_conventions:
  component_path: "{component_path_pattern}"
  page_path: "{page_path_pattern}"
  api_path: "{api_path_pattern}"
  test_path: "{test_path_pattern}"
  story_path: "{story_path_pattern}"

naming_conventions:
  components: "{component_naming}"
  files: "{file_naming}"
  directories: "{directory_naming}"
  variables: "camelCase"

# Detected packages (for monorepo)
examples:
  packages: { detected_packages }
```

## Execution Workflow

```markdown
**Step 1: Check if .project-structure.yaml exists**
→ If exists: Load and use
→ If not exists: Continue to Step 2

**Step 2: Analyze project**
→ Run Phase 1-8 analysis
→ Collect all project information

**Step 3: Generate configuration**
→ Fill in template with detected values
→ Write to {project_root}/.project-structure.yaml

**Step 4: Validate and confirm**
→ Show generated config to user
→ Ask: "Project structure detected. Please review .project-structure.yaml"
→ Allow user to make adjustments

**Step 5: Mark as complete**
→ Log: "✓ Project structure analysis complete"
→ Continue with original task
```

## Integration Points

### In requirement-driven-development.mdc

````markdown
## Project Structure Analysis

**CRITICAL: Before applying any rules, load project-specific configuration**

### 1. Check for Project Structure File

```bash
if [ ! -f ".project-structure.yaml" ]; then
  echo "⚠️  .project-structure.yaml not found"
  echo "→ Running project structure analysis..."
  # Execute analyze-project-structure rule
  # This will generate .project-structure.yaml
fi
```
````

### In plan-execution.mdc

````markdown
## Project Configuration Loading

**CRITICAL: Load project structure before executing any tasks**

### 1. Load .project-structure.yaml

```bash
if [ ! -f ".project-structure.yaml" ]; then
  echo "⚠️  .project-structure.yaml not found"
  echo "→ Running automatic project structure analysis..."
  # Execute analyze-project-structure rule
  exit 1  # Re-run after generation
fi
```
````

## Error Handling

### Scenario 1: Cannot Detect Project Type

```markdown
If project type cannot be determined:

1. Default to "single-package"
2. Set source_dir to "src" (most common)
3. Add comment: "# Unable to auto-detect, please verify"
4. Prompt user for manual review
```

### Scenario 2: Multiple Package Managers Detected

```markdown
If multiple lock files exist:

1. Priority: yarn.lock > pnpm-lock.yaml > package-lock.json
2. Warn user: "⚠️ Multiple package managers detected"
3. Use highest priority
4. Add comment: "# Multiple lock files found, using {selected}"
```

### Scenario 3: Missing package.json

```markdown
If package.json not found:

1. Check if this is a sub-directory
2. Search parent directories for package.json
3. If still not found: Cannot proceed
4. Error: "❌ Not a Node.js project (no package.json found)"
```

## Output Example

```yaml
# Auto-generated by analyze-project-structure rule
# Generated at: 2024-10-13T22:30:00Z
# Project: albatrion

project:
  name: "albatrion"
  type: "monorepo"
  description: "Auto-detected project structure"

structure:
  root: "."
  packages_dir: "packages"
  source_dir: "src"
  tests_dir: "__tests__"
  docs_dir: "docs"
  tasks_dir: ".tasks"

package_manager:
  type: "yarn"
  workspace_command: "yarn workspace"

commands:
  dev:
    app: "yarn workspace @canard/app dev"
    api: "yarn workspace @canard/api dev"
    all: "yarn dev"
  test:
    app: "yarn workspace @canard/app test"
    all: "yarn test"
  lint:
    app: "yarn workspace @canard/app lint"
    all: "yarn lint"
  build:
    app: "yarn workspace @canard/app build"
    all: "yarn build"
  custom:
    generate_types: "yarn workspace @canard/common generate-types"

tech_stack:
  frontend:
    framework: "react"
    language: "typescript"
    ui_library: "antd-mobile"
  backend:
    framework: "nestjs"
    api_style: "graphql"
  state_management:
    - "jotai"
    - "apollo-client"
  testing:
    unit: "vitest"
    e2e: "playwright"
    mocking: "msw"

development:
  ports:
    frontend: 5173
    backend: 4000
    storybook: 6006

path_conventions:
  component_path: "packages/app/src/components/{ComponentName}/{ComponentName}.tsx"
  page_path: "packages/app/src/pages/{PageName}/{PageName}.page.tsx"

naming_conventions:
  components: "PascalCase"
  files: "PascalCase"
  directories: "kebab-case"
  variables: "camelCase"

examples:
  packages:
    - name: "app"
      type: "frontend"
      path: "packages/app"
    - name: "api"
      type: "backend"
      path: "packages/api"
```

## Best Practices

1. **Always Review**: Auto-generated config should be reviewed by user
2. **Fail Safe**: If detection fails, use sensible defaults
3. **Clear Logging**: Show what was detected and what was assumed
4. **Incremental**: Allow user to run analysis again to update config
5. **Version Control**: Add .project-structure.yaml to git for team consistency

---

> Last Updated: 2024-10-13
> Purpose: Automatic project structure analysis and configuration generation
