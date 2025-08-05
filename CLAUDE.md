# Claude Code Guidelines for Albatrion Project

This document references project-specific guidelines for Claude Code when working on the Albatrion repository. All guidelines are maintained in the `.cursor/rules` directory.

## 📋 Important Commands

When completing tasks, always run:
- `npm run lint` - Check code style
- `npm run typecheck` - Verify TypeScript types
- `npm test` - Run tests

## 📁 Rule Files Reference

Please follow all guidelines defined in the following files:

### Core Guidelines
- **Project Structure**: `.cursor/rules/project-structure.mdc`
- **Code Writing Guidelines**: `.cursor/rules/code-writing-guidelines.mdc`
- **TypeScript Best Practices**: `.cursor/rules/typescript.mdc`
- **React + TypeScript Rules**: `.cursor/rules/typescript-react.mdc`
- **Testing Strategy**: `.cursor/rules/testing-strategy.mdc`
- **Frontend Design Guidelines (Toss)**: `.cursor/rules/toss-basic-frontend-rules.mdc`

### Process Guidelines
- **Changeset Creation**: `.cursor/rules/create-changeset.mdc`
- **Pull Request Guidelines**: `.cursor/rules/pull-request.mdc`

### Plugin Development
- **Schema Form Plugin Guidelines**: `.cursor/rules/create-canard-form-plugin-guidelines.mdc`

## 📌 Quick Reference

When working on this project, ensure you:
1. Read and follow all guidelines in the `.cursor/rules` directory
2. Apply the rules consistently across all code changes
3. Run lint, typecheck, and tests before completing any task
4. Follow the project structure and naming conventions
5. Adhere to TypeScript and React best practices
6. Create proper changesets and pull requests according to the guidelines

---

> All guidelines are maintained in `.cursor/rules` directory to ensure consistency between Cursor and Claude Code.
> Copyright © 2025 Vincent K. Kelvin. All rights reserved.