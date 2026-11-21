---
"@slats/agents-assets-sync": patch
---

Refuse an `AGENTS.md` or rule source where an HTML comment closes and reopens on the same line (`<!-- a --> b <!-- c`) and a managed marker or fence line follows before the comment closes. Markdown ends the comment's HTML block at that line while HTML keeps the comment open, so the two readings disagree on where a managed block ends; a forced run could pair a START with the wrong END and overwrite your text. The run now leaves the file unchanged and names both the marker line and the line that reopened the comment. Close the comment on that line, or move the marker out of it, and run again. The README also lists the Markdown constructs the scanner does not interpret and therefore refuses.
