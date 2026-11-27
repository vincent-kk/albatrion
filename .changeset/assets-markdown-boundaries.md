---
"@slats/agents-assets-sync": major
---

Breaking change: rule files a package ships under `rules/`, and the `AGENTS.md` that receives rule blocks for `--agent codex` and `--agent agents`, must now use closed, top-level Markdown fences and closed HTML comments. A fence nested in a blockquote or list item, a fence indented with a tab or four or more spaces, and an unclosed fence or comment are refused, including in your own text outside the managed blocks of `AGENTS.md`.

The error names the file, the opening line and the repair. Nothing is written for that package and agent, and other packages and agents still proceed. The command does not rewrite the file for you.

Move a nested example to the top level before running the command again. Before:

````md
- Example:
  ```ts
  const value = 1;
  ```
````

After:

````md
- Example:

```ts
const value = 1;
```
````

Close an unterminated fence or comment in the named file before rerunning. Top-level backtick and tilde fences with up to three spaces of indentation and longer closing fences remain supported; markers inside HTML comments are ignored.
