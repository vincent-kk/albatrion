---
"@slats/agents-assets-sync": major
---

Breaking change: rule sources and managed documents now require closed Markdown fences and HTML comments; nested fences in blockquotes or lists and fence syntax indented with tabs or four or more spaces are refused. Errors identify the file, opening line and repair, leave the affected unit unchanged, and allow other units to proceed. Source bytes are never canonicalized.

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
