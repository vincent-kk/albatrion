---
description: Analyze project structure and generate .project-structure.yaml configuration
alwaysApply: false
---

Read and follow the guidelines in `.cursor/rules/analyze-project-structure.mdc` to automatically analyze your project structure and generate `.project-structure.yaml` configuration.

This command will guide you through:
- Detecting package manager and project type (monorepo/single-package)
- Scanning directory structure and extracting tech stack
- Parsing commands from package.json scripts
- Inferring naming and path conventions
- Generating `.project-structure.yaml` in project root
- Automatic integration with requirement-driven development workflows
